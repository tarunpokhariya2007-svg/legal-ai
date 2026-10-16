import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Check, RotateCcw, X } from 'lucide-react'
import type { FaceLandmarker } from '@mediapipe/tasks-vision'

// =====================================================
// LIVE PROFILE PHOTO CAPTURE
// =====================================================
//
// - Live camera only (getUserMedia). No file picker / gallery.
// - On-device face landmark detection (MediaPipe Face
//   Landmarker). No video frames leave the browser except the
//   single JPEG the user confirms.
// - Five guided poses: straight, left, right, up, down.
//
// IMPORTANT: these checks are quality + basic pose guidance.
// They do NOT verify identity and are NOT spoof-proof
// liveness detection.
// =====================================================

// The WASM runtime version must match the installed
// @mediapipe/tasks-vision version in package.json.
const MEDIAPIPE_VERSION = '0.10.21'

const WASM_BASE_URL =
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`

const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

// ---------- Tunable thresholds ----------
const OUTPUT_SIZE = 640 // saved photo is OUTPUT_SIZE x OUTPUT_SIZE
const JPEG_QUALITY = 0.9
const DETECT_INTERVAL_MS = 90

const HOLD_FRAMES_STRAIGHT = 8
const HOLD_FRAMES_POSE = 5

const MIN_VIDEO_HEIGHT = 480

const MIN_BRIGHTNESS = 70 // mean luma 0-255 inside the face
const MAX_BRIGHTNESS = 205
const MIN_CONTRAST = 28 // luma std-dev inside the face
const BACKLIGHT_RATIO = 0.6 // face / whole-frame brightness
const MIN_SHARPNESS = 22 // Laplacian variance on a 96x96 face crop

const YAW_TURN = 0.1 // nose offset (fraction of face width)
const YAW_MAX = 0.32
const PITCH_TILT = 0.07 // nose position change (fraction of eye-chin)
const PITCH_MAX = 0.3
const CROSS_AXIS_MAX = 0.12

// ---------- Types ----------
type Pt = { x: number; y: number; z?: number }

type Phase = 'loading' | 'capturing' | 'preview' | 'saving' | 'error'

type PoseKey = 'straight' | 'left' | 'right' | 'up' | 'down'

const STEPS: { key: PoseKey; label: string; hint: string }[] = [
  {
    key: 'straight',
    label: 'Look straight ahead',
    hint: 'Face the camera with a neutral expression.',
  },
  {
    key: 'left',
    label: 'Turn your head to your left',
    hint: 'Slowly turn, keeping your face in view.',
  },
  {
    key: 'right',
    label: 'Turn your head to your right',
    hint: 'Slowly turn, keeping your face in view.',
  },
  {
    key: 'up',
    label: 'Tilt your head up',
    hint: 'Lift your chin slightly.',
  },
  {
    key: 'down',
    label: 'Tilt your head down',
    hint: 'Lower your chin slightly.',
  },
]

interface FaceMetrics {
  yaw: number
  pitch: number
  roll: number
  offsetX: number
  offsetY: number
  heightFrac: number
  inside: boolean
  faceBox: { x: number; y: number; w: number; h: number }
}

interface QualityMetrics {
  brightness: number
  contrast: number
  sharpness: number
  frameBrightness: number
}

interface Props {
  open: boolean
  onClose: () => void
  /** Persist the confirmed JPEG. Throw to show an error and allow retry. */
  onSave: (photo: Blob) => Promise<void>
}

// =====================================================
// GEOMETRY
// =====================================================

function computeMetrics(
  lm: Pt[],
  vw: number,
  vh: number
): FaceMetrics | null {
  if (lm.length < 468) {
    return null
  }

  const side = Math.min(vw, vh)
  const cropX = (vw - side) / 2
  const cropY = (vh - side) / 2

  let minX = 1
  let maxX = 0
  let minY = 1
  let maxY = 0

  for (const p of lm) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  const boxX = minX * vw
  const boxY = minY * vh
  const boxW = (maxX - minX) * vw
  const boxH = (maxY - minY) * vh

  const offsetX = (boxX + boxW / 2 - cropX) / side - 0.5
  const offsetY = (boxY + boxH / 2 - cropY) / side - 0.5

  const margin = 0.02 * side

  const inside =
    boxX >= cropX + margin &&
    boxX + boxW <= cropX + side - margin &&
    boxY >= cropY + margin &&
    boxY + boxH <= cropY + side - margin

  // Yaw: nose tip position between the two cheek edges.
  // Measured in raw (un-mirrored) camera coordinates, so a
  // positive value means the user turned to THEIR left.
  const cheekA = lm[234]
  const cheekB = lm[454]
  const nose = lm[1]

  const left = Math.min(cheekA.x, cheekB.x)
  const right = Math.max(cheekA.x, cheekB.x)

  const yaw =
    right - left > 0.0001
      ? (nose.x - left) / (right - left) - 0.5
      : 0

  // Pitch: nose tip position between the eye line and chin.
  // Smaller = head tilted up, larger = tilted down.
  const eyeY = (lm[33].y + lm[263].y) / 2
  const chinY = lm[152].y

  const pitch =
    chinY - eyeY > 0.0001 ? (nose.y - eyeY) / (chinY - eyeY) : 0.6

  // Roll: slope of the eye line, in degrees.
  let roll =
    (Math.atan2(
      (lm[263].y - lm[33].y) * vh,
      (lm[263].x - lm[33].x) * vw
    ) *
      180) /
    Math.PI

  if (roll > 90) roll -= 180
  if (roll < -90) roll += 180

  const heightPx = Math.abs(lm[152].y - lm[10].y) * vh

  return {
    yaw,
    pitch,
    roll,
    offsetX,
    offsetY,
    heightFrac: heightPx / side,
    inside,
    faceBox: { x: boxX, y: boxY, w: boxW, h: boxH },
  }
}

// =====================================================
// IMAGE QUALITY (brightness, contrast, sharpness)
// =====================================================

function measureQuality(
  video: HTMLVideoElement,
  box: { x: number; y: number; w: number; h: number },
  work: HTMLCanvasElement
): QualityMetrics | null {
  const ctx = work.getContext('2d', { willReadFrequently: true })

  if (!ctx) {
    return null
  }

  const SIZE = 96

  work.width = SIZE
  work.height = SIZE

  // Face region (slightly inset to avoid hair / background).
  const insetX = box.w * 0.1
  const insetY = box.h * 0.1

  const sx = Math.max(0, box.x + insetX)
  const sy = Math.max(0, box.y + insetY)
  const sw = Math.min(video.videoWidth - sx, box.w - insetX * 2)
  const sh = Math.min(video.videoHeight - sy, box.h - insetY * 2)

  if (sw < 16 || sh < 16) {
    return null
  }

  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, SIZE, SIZE)

  const face = ctx.getImageData(0, 0, SIZE, SIZE).data

  const gray = new Float32Array(SIZE * SIZE)

  let sum = 0

  for (let i = 0; i < SIZE * SIZE; i += 1) {
    const g =
      0.299 * face[i * 4] +
      0.587 * face[i * 4 + 1] +
      0.114 * face[i * 4 + 2]

    gray[i] = g
    sum += g
  }

  const mean = sum / (SIZE * SIZE)

  let variance = 0

  for (let i = 0; i < gray.length; i += 1) {
    variance += (gray[i] - mean) * (gray[i] - mean)
  }

  const contrast = Math.sqrt(variance / gray.length)

  // Variance of the Laplacian (higher = sharper).
  let lapSum = 0
  let lapSumSq = 0
  let lapCount = 0

  for (let y = 1; y < SIZE - 1; y += 1) {
    for (let x = 1; x < SIZE - 1; x += 1) {
      const i = y * SIZE + x

      const lap =
        gray[i - SIZE] +
        gray[i + SIZE] +
        gray[i - 1] +
        gray[i + 1] -
        4 * gray[i]

      lapSum += lap
      lapSumSq += lap * lap
      lapCount += 1
    }
  }

  const lapMean = lapSum / lapCount
  const sharpness = lapSumSq / lapCount - lapMean * lapMean

  // Whole-frame brightness (for backlight detection).
  const FRAME = 24

  work.width = FRAME
  work.height = FRAME

  const ctx2 = work.getContext('2d', { willReadFrequently: true })

  if (!ctx2) {
    return null
  }

  ctx2.drawImage(video, 0, 0, FRAME, FRAME)

  const frame = ctx2.getImageData(0, 0, FRAME, FRAME).data

  let frameSum = 0

  for (let i = 0; i < FRAME * FRAME; i += 1) {
    frameSum +=
      0.299 * frame[i * 4] +
      0.587 * frame[i * 4 + 1] +
      0.114 * frame[i * 4 + 2]
  }

  return {
    brightness: mean,
    contrast,
    sharpness,
    frameBrightness: frameSum / (FRAME * FRAME),
  }
}

function lightingProblem(q: QualityMetrics): string | null {
  if (q.brightness < MIN_BRIGHTNESS) {
    return 'Too dark. Face a light source or move to a brighter place.'
  }

  if (q.brightness > MAX_BRIGHTNESS) {
    return 'Too bright. Avoid direct light on your face.'
  }

  if (
    q.frameBrightness > 120 &&
    q.brightness < q.frameBrightness * BACKLIGHT_RATIO
  ) {
    return 'The light is behind you. Face the light instead.'
  }

  if (q.contrast < MIN_CONTRAST) {
    return 'Your face is not clear. Improve the lighting.'
  }

  return null
}

// =====================================================
// COMPONENT
// =====================================================

export default function LivePhotoCapture({
  open,
  onClose,
  onSave,
}: Props) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [stepIndex, setStepIndex] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const [message, setMessage] = useState('Starting camera…')
  const [poseOk, setPoseOk] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [saveError, setSaveError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const rafRef = useRef<number>(0)
  const workCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Mutable flow state (kept in refs so the animation loop never
  // reads stale React state).
  const runningRef = useRef(false)
  const stepRef = useRef(0)
  const holdRef = useRef(0)
  const lastDetectRef = useRef(0)
  const baselineRef = useRef({ yaw: 0, pitch: 0.6, samples: 0 })
  const bestFrameRef = useRef<{
    canvas: HTMLCanvasElement
    sharpness: number
  } | null>(null)
  const photoBlobRef = useRef<Blob | null>(null)
  const previewUrlRef = useRef('')

  // -----------------------------------------------
  // CAMERA / MODEL TEARDOWN
  // -----------------------------------------------

  const stopCamera = useCallback(() => {
    runningRef.current = false

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }

    const stream = streamRef.current

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    const video = videoRef.current

    if (video) {
      video.pause()
      video.srcObject = null
    }
  }, [])

  const releasePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = ''
    }

    setPreviewUrl('')
  }, [])

  const teardown = useCallback(() => {
    stopCamera()

    if (landmarkerRef.current) {
      try {
        landmarkerRef.current.close()
      } catch {
        // ignore
      }

      landmarkerRef.current = null
    }

    bestFrameRef.current = null
    photoBlobRef.current = null

    releasePreview()
  }, [stopCamera, releasePreview])

  // -----------------------------------------------
  // LOAD MODEL (once per open)
  // -----------------------------------------------

  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) {
      return
    }

    const vision = await import('@mediapipe/tasks-vision')

    const fileset = await vision.FilesetResolver.forVisionTasks(
      WASM_BASE_URL
    )

    const baseOptions = (delegate: 'GPU' | 'CPU') => ({
      modelAssetPath: FACE_MODEL_URL,
      delegate,
    })

    try {
      landmarkerRef.current =
        await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: baseOptions('GPU'),
          runningMode: 'VIDEO',
          numFaces: 2,
        })
    } catch {
      // Some devices do not support the GPU delegate.
      landmarkerRef.current =
        await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: baseOptions('CPU'),
          runningMode: 'VIDEO',
          numFaces: 2,
        })
    }
  }, [])

  // -----------------------------------------------
  // START CAMERA
  // -----------------------------------------------

  const startCamera = useCallback(async () => {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      throw new Error(
        'This browser cannot access the camera. Use a modern browser over HTTPS.'
      )
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    streamRef.current = stream

    const video = videoRef.current

    if (!video) {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      throw new Error('Camera view is not ready.')
    }

    video.srcObject = stream

    await video.play()
  }, [])

  // -----------------------------------------------
  // DETECTION LOOP
  // -----------------------------------------------

  const finishCapture = useCallback(async () => {
    runningRef.current = false

    const best = bestFrameRef.current

    stopCamera()

    if (!best) {
      setErrorText('Could not capture a clear photo. Please try again.')
      setPhase('error')
      return
    }

    const blob: Blob | null = await new Promise((resolve) =>
      best.canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    )

    if (!blob) {
      setErrorText('Could not create the photo. Please try again.')
      setPhase('error')
      return
    }

    photoBlobRef.current = blob

    releasePreview()

    const url = URL.createObjectURL(blob)

    previewUrlRef.current = url

    setPreviewUrl(url)
    setSaveError('')
    setPhase('preview')
  }, [stopCamera, releasePreview])

  const captureCandidate = useCallback(
    (
      video: HTMLVideoElement,
      metrics: FaceMetrics,
      quality: QualityMetrics
    ) => {
      const vw = video.videoWidth
      const vh = video.videoHeight

      // Square crop centred on the face, with room around it.
      const faceCx = metrics.faceBox.x + metrics.faceBox.w / 2
      const faceCy = metrics.faceBox.y + metrics.faceBox.h / 2

      const side = Math.min(
        Math.min(vw, vh),
        Math.max(metrics.faceBox.h * 1.8, 256)
      )

      const sx = Math.min(Math.max(0, faceCx - side / 2), vw - side)
      const sy = Math.min(Math.max(0, faceCy - side / 2), vh - side)

      const canvas = document.createElement('canvas')

      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return
      }

      // Un-mirrored: the saved photo shows the true orientation.
      ctx.drawImage(
        video,
        sx,
        sy,
        side,
        side,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      )

      const current = bestFrameRef.current

      if (!current || quality.sharpness > current.sharpness) {
        bestFrameRef.current = {
          canvas,
          sharpness: quality.sharpness,
        }
      }
    },
    []
  )

  const evaluateFrame = useCallback(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current

    if (
      !video ||
      !landmarker ||
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return
    }

    if (video.videoHeight < MIN_VIDEO_HEIGHT && video.videoWidth < MIN_VIDEO_HEIGHT) {
      setPoseOk(false)
      setMessage('Camera resolution is too low for a clear photo.')
      return
    }

    const result = landmarker.detectForVideo(video, performance.now())

    const faces = result.faceLandmarks || []

    const step = STEPS[stepRef.current]

    const fail = (text: string) => {
      holdRef.current = 0
      setHoldProgress(0)
      setPoseOk(false)
      setMessage(text)
    }

    if (faces.length === 0) {
      return fail('No face detected. Move into the frame.')
    }

    if (faces.length > 1) {
      return fail('More than one face detected. Only you should be visible.')
    }

    const metrics = computeMetrics(
      faces[0] as Pt[],
      video.videoWidth,
      video.videoHeight
    )

    if (!metrics) {
      return fail('Face not clear. Please adjust your position.')
    }

    const isStraight = step.key === 'straight'

    // ----- Position / size -----
    const maxOffset = isStraight ? 0.14 : 0.28

    if (!metrics.inside) {
      return fail('Keep your whole face inside the frame.')
    }

    if (
      Math.abs(metrics.offsetX) > maxOffset ||
      Math.abs(metrics.offsetY) > maxOffset
    ) {
      return fail('Centre your face in the frame.')
    }

    if (metrics.heightFrac < (isStraight ? 0.4 : 0.32)) {
      return fail('Move closer to the camera.')
    }

    if (metrics.heightFrac > 0.85) {
      return fail('Move a little further from the camera.')
    }

    // ----- Lighting / sharpness -----
    const work =
      workCanvasRef.current ||
      (workCanvasRef.current = document.createElement('canvas'))

    const quality = measureQuality(video, metrics.faceBox, work)

    if (!quality) {
      return fail('Face not clear. Please adjust your position.')
    }

    const light = lightingProblem(quality)

    if (light) {
      return fail(light)
    }

    if (isStraight && quality.sharpness < MIN_SHARPNESS) {
      return fail('Image is blurry. Hold still and wipe the camera lens.')
    }

    // ----- Pose -----
    const base = baselineRef.current

    const yawDelta = metrics.yaw - base.yaw
    const pitchDelta = metrics.pitch - base.pitch

    let poseMatches = false
    let poseMessage = step.hint

    switch (step.key) {
      case 'straight':
        poseMatches =
          Math.abs(metrics.yaw) <= 0.07 &&
          metrics.pitch >= 0.38 &&
          metrics.pitch <= 0.8 &&
          Math.abs(metrics.roll) <= 12

        if (!poseMatches) {
          poseMessage = 'Look straight at the camera and keep your head level.'
        }
        break

      case 'left':
        poseMatches =
          yawDelta >= YAW_TURN &&
          yawDelta <= YAW_MAX &&
          Math.abs(pitchDelta) <= CROSS_AXIS_MAX
        break

      case 'right':
        poseMatches =
          yawDelta <= -YAW_TURN &&
          yawDelta >= -YAW_MAX &&
          Math.abs(pitchDelta) <= CROSS_AXIS_MAX
        break

      case 'up':
        poseMatches =
          pitchDelta <= -PITCH_TILT &&
          pitchDelta >= -PITCH_MAX &&
          Math.abs(yawDelta) <= CROSS_AXIS_MAX
        break

      case 'down':
        poseMatches =
          pitchDelta >= PITCH_TILT &&
          pitchDelta <= PITCH_MAX &&
          Math.abs(yawDelta) <= CROSS_AXIS_MAX
        break
    }

    if (!poseMatches) {
      holdRef.current = 0
      setHoldProgress(0)
      setPoseOk(false)
      setMessage(`${step.label}. ${poseMessage}`)
      return
    }

    // ----- Pose held -----
    holdRef.current += 1

    if (isStraight) {
      // Average the neutral pose to use as the baseline for the
      // other four poses, and keep the sharpest straight frame.
      const n = base.samples + 1

      base.yaw = (base.yaw * base.samples + metrics.yaw) / n
      base.pitch = (base.pitch * base.samples + metrics.pitch) / n
      base.samples = n

      captureCandidate(video, metrics, quality)
    }

    const required = isStraight
      ? HOLD_FRAMES_STRAIGHT
      : HOLD_FRAMES_POSE

    setPoseOk(true)
    setMessage('Good. Hold still…')
    setHoldProgress(Math.min(1, holdRef.current / required))

    if (holdRef.current < required) {
      return
    }

    // ----- Step complete -----
    holdRef.current = 0
    setHoldProgress(0)

    if (stepRef.current >= STEPS.length - 1) {
      void finishCapture()
      return
    }

    stepRef.current += 1

    setStepIndex(stepRef.current)
    setPoseOk(false)
    setMessage(STEPS[stepRef.current].label)
  }, [captureCandidate, finishCapture])

  const startLoop = useCallback(() => {
    runningRef.current = true

    const tick = (now: number) => {
      if (!runningRef.current) {
        return
      }

      rafRef.current = requestAnimationFrame(tick)

      if (now - lastDetectRef.current < DETECT_INTERVAL_MS) {
        return
      }

      lastDetectRef.current = now

      try {
        evaluateFrame()
      } catch (error) {
        console.error('Face detection error:', error)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [evaluateFrame])

  const resetFlow = useCallback(() => {
    stepRef.current = 0
    holdRef.current = 0
    baselineRef.current = { yaw: 0, pitch: 0.6, samples: 0 }
    bestFrameRef.current = null
    photoBlobRef.current = null

    setStepIndex(0)
    setHoldProgress(0)
    setPoseOk(false)
    setSaveError('')
    setMessage(STEPS[0].label)
  }, [])

  const describeCameraError = (error: unknown): string => {
    const name = (error as { name?: string })?.name

    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return 'Camera permission was denied. Allow camera access in your browser settings and try again.'
    }

    if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      return 'No camera was found on this device.'
    }

    if (name === 'NotReadableError') {
      return 'The camera is in use by another app. Close it and try again.'
    }

    return (
      (error as Error)?.message ||
      'Could not start the camera or face detection. Please try again.'
    )
  }

  // -----------------------------------------------
  // OPEN / CLOSE LIFECYCLE
  // -----------------------------------------------

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    resetFlow()
    setErrorText('')
    setPhase('loading')
    setMessage('Starting camera…')

    ;(async () => {
      try {
        await Promise.all([loadModel(), startCamera()])

        if (cancelled) {
          return
        }

        setPhase('capturing')
        setMessage(STEPS[0].label)

        startLoop()
      } catch (error) {
        if (cancelled) {
          return
        }

        console.error('Live photo capture error:', error)

        stopCamera()

        setErrorText(describeCameraError(error))
        setPhase('error')
      }
    })()

    return () => {
      cancelled = true
      teardown()
    }
  }, [open, resetFlow, loadModel, startCamera, startLoop, stopCamera, teardown])

  // Close with Escape.
  useEffect(() => {
    if (!open) {
      return
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && phase !== 'saving') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [open, phase, onClose])

  // -----------------------------------------------
  // ACTIONS
  // -----------------------------------------------

  const handleRetake = async () => {
    releasePreview()
    resetFlow()
    setErrorText('')
    setPhase('loading')
    setMessage('Starting camera…')

    try {
      await loadModel()
      await startCamera()

      setPhase('capturing')
      setMessage(STEPS[0].label)

      startLoop()
    } catch (error) {
      stopCamera()

      setErrorText(describeCameraError(error))
      setPhase('error')
    }
  }

  const handleConfirm = async () => {
    const blob = photoBlobRef.current

    if (!blob) {
      return
    }

    setSaveError('')
    setPhase('saving')

    try {
      await onSave(blob)

      teardown()
      onClose()
    } catch (error) {
      setSaveError(
        (error as Error)?.message ||
          'Failed to save the photo. Please try again.'
      )

      setPhase('preview')
    }
  }

  if (!open) {
    return null
  }

  // -----------------------------------------------
  // RENDER
  // -----------------------------------------------

  const step = STEPS[stepIndex]
  const showVideo = phase === 'loading' || phase === 'capturing'
  const guideColor = poseOk ? '#10B981' : 'rgba(255,255,255,0.85)'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a live profile photo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(2,6,23,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          maxHeight: '100%',
          overflowY: 'auto',
          background: 'var(--bg)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 20,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            <Camera size={18} />
            Live profile photo
          </div>

          <button
            type="button"
            aria-label="Close camera"
            disabled={phase === 'saving'}
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ---------- CAMERA VIEW ---------- */}
        <div
          style={{
            display: showVideo ? 'block' : 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#000',
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
              }}
            />

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <ellipse
                cx="50"
                cy="50"
                rx="29"
                ry="38"
                fill="none"
                stroke={guideColor}
                strokeWidth="1.2"
                strokeDasharray={poseOk ? '0' : '4 3'}
              />
            </svg>

            {phase === 'loading' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.55)',
                  color: 'white',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  padding: 16,
                }}
              >
                Starting camera and loading face detection…
              </div>
            )}
          </div>

          {/* Step progress */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 14,
            }}
            aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}
          >
            {STEPS.map((item, index) => (
              <div
                key={item.key}
                title={item.label}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  background:
                    index < stepIndex
                      ? '#10B981'
                      : index === stepIndex
                        ? 'var(--blue)'
                        : 'var(--border)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {index === stepIndex && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: `${holdProgress * 100}%`,
                      background: '#10B981',
                      transition: 'width 90ms linear',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              fontWeight: 600,
            }}
          >
            Step {stepIndex + 1} of {STEPS.length}: {step.label}
          </div>

          <div
            aria-live="polite"
            style={{
              marginTop: 4,
              fontSize: '0.88rem',
              color: poseOk ? '#059669' : 'var(--text-muted)',
              minHeight: 38,
            }}
          >
            {message}
          </div>
        </div>

        {/* ---------- PREVIEW ---------- */}
        {(phase === 'preview' || phase === 'saving') && (
          <div>
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 16,
                overflow: 'hidden',
                background: '#000',
              }}
            >
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview of your new profile photo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              )}
            </div>

            <p
              style={{
                margin: '12px 0 0',
                fontSize: '0.88rem',
                color: 'var(--text-muted)',
              }}
            >
              Check that your face is clear. Use this photo as your profile
              picture?
            </p>

            {saveError && (
              <p
                role="alert"
                style={{
                  margin: '10px 0 0',
                  fontSize: '0.88rem',
                  color: '#DC2626',
                }}
              >
                {saveError}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 14,
              }}
            >
              <button
                type="button"
                className="btn-ghost"
                disabled={phase === 'saving'}
                onClick={handleRetake}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <RotateCcw size={15} />
                Retake
              </button>

              <button
                type="button"
                className="btn-primary"
                disabled={phase === 'saving'}
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Check size={15} />
                {phase === 'saving' ? 'Saving…' : 'Use this photo'}
              </button>
            </div>
          </div>
        )}

        {/* ---------- ERROR ---------- */}
        {phase === 'error' && (
          <div>
            <p
              role="alert"
              style={{
                margin: '8px 0 16px',
                color: '#DC2626',
                fontSize: '0.92rem',
              }}
            >
              {errorText}
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                Close
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleRetake}
                style={{ flex: 1 }}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <p
          style={{
            margin: '14px 0 0',
            fontSize: '0.75rem',
            color: 'var(--text-subtle)',
          }}
        >
          The camera runs on your device and stops when you finish. These
          checks help capture a clear photo; they do not verify your
          identity.
        </p>
      </div>
    </div>
  )
}
