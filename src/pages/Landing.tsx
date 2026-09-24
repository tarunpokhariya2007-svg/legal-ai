import { Link, useNavigate } from 'react-router'

import { useEffect, useRef, useState } from 'react'

import { motion } from 'motion/react'

import { isLoggedIn } from '../lib/auth'

import {

  Scale, ArrowRight, CheckCircle, Shield, Zap, Globe, Lock,

  MessageSquare, Users, FileSearch, MapPin, Mic, ChevronRight,

  Award, Clock, TrendingUp, BookOpen, Crown, Code2, Database,

  Lightbulb, Target, ShieldCheck, BarChart3,Bot,Languages

} from 'lucide-react'

const stats = [

  { value: '5+', label: 'AI Agents', icon: Bot },

  { value: '24/7', label: 'AI Assistance', icon: Clock },

  { value: '8+', label: 'Languages Supported', icon: Languages },

  { value: 'Secure', label: 'User Data Protection', icon: ShieldCheck },

];

const steps = [

  {

    step: '01', title: 'Describe Your Issue',

    desc: 'Simply type or speak your legal problem in any language — no legal jargon needed.',

    color: '#D4AF37',

  },

  {

    step: '02', title: 'AI Analyzes Your Case',

    desc: 'Our Agentic AI cross-references thousands of statutes, IPC sections, and precedents instantly.',

    color: '#8A6A24',

  },

  {

    step: '03', title: 'Receive Legal Guidance',

    desc: 'Get a structured report with relevant laws, recommended actions, required documents, and timelines.',

    color: '#D4AF37',

  },

  {

    step: '04', title: 'Hire an Advocate',

    desc: 'Browse verified advocates matched to your case type, read reviews, and book consultations.',

    color: '#A27B2C',

  },

]

const features = [

  {

    icon: MessageSquare, title: 'AI Legal Assistant',

    desc: 'ChatGPT-style interface trained on Indian law. Ask anything about your rights and get instant, accurate guidance.',

    color: '#D4AF37', bg: 'rgba(212,175,55,0.08)',

  },

  {

    icon: Users, title: 'Advocate Marketplace',

    desc: 'Connect with 1,840+ verified advocates filtered by specialization, city, language, and consultation fee.',

    color: '#8A6A24', bg: 'rgba(162,123,44,0.08)',

  },

  {

    icon: FileSearch, title: 'AI Document Analyzer',

    desc: 'Upload FIRs, contracts, court orders, and property papers. AI extracts key clauses and flags risks instantly.',

    color: '#D4AF37', bg: 'rgba(212,175,55,0.08)',

  },

  {

    icon: MapPin, title: 'Jurisdiction Finder',

    desc: 'Automatically identify the correct court, jurisdiction, and authority for your case type and location.',

    color: '#A27B2C', bg: 'rgba(162,123,44,0.08)',

  },

  {

    icon: Lock, title: 'Secure Chat',

    desc: 'End-to-end encrypted communication with advocates. Your legal matters stay strictly confidential.',

    color: '#8B4A42', bg: 'rgba(139,74,66,0.07)',

  },

  {

    icon: Globe, title: 'Multilingual Support',

    desc: 'Available in Hindi, English, Tamil, Bengali, Marathi, Telugu, Kannada, and 14 more Indian languages.',

    color: '#527B83', bg: 'rgba(82,123,131,0.08)',

  },

]

const teamProfileLinkStyle: React.CSSProperties = {

  display: 'block',

  padding: '8px 10px',

  borderRadius: 5,

  color: 'rgba(255,255,255,0.78)',

  textDecoration: 'none',

  fontSize: '0.75rem',

  whiteSpace: 'nowrap',

}

const teamMembers = [
  {
    name: 'Gaurav Singh',
    role: 'Team Lead',
    image: '/team/gaurav.jpg',
    roleIcon: Crown,
    description:
      "Hi, I'm Gaurav Singh, the Team Lead of Nyaya AI. I coordinate the team, guide project direction, and help turn our ideas into practical solutions that make legal technology more accessible.",
    skills: [
      { icon: Lightbulb, lines: <>Team<br />Management</> },
      { icon: Users, lines: <>Project<br />Coordination</> },
      { icon: Target, lines: <>Strategy &amp;<br />Planning</> },
    ],
  },
  {
    name: 'Tarun Pokhariya',
    role: 'Backend & Frontend Developer',
    image: '/team/tarun.jpg',
    roleIcon: Code2,
    description:
      "Hi, I'm Tarun Pokhariya, the Backend and Frontend Developer of Nyaya AI. I build and maintain the platform, develop user-facing features, and connect the frontend with reliable backend services.",
    skills: [
      { icon: Code2, lines: <>Full-Stack<br />Development</> },
      { icon: Target, lines: <>Feature<br />Implementation</> },
      { icon: ShieldCheck, lines: <>System<br />Integration</> },
    ],
  },
  {
    name: 'Pragitya Ghosh',
    role: 'Database Manager',
    image: '/team/pragitya.jpg',
    roleIcon: Database,
    description:
      "Hi, I'm Pragitya Ghosh, the Database Manager of Nyaya AI. I design and manage our data systems, focus on data integrity and security, and help ensure that our platform's information remains organized and reliable.",
    skills: [
      { icon: Database, lines: <>Database<br />Design</> },
      { icon: ShieldCheck, lines: <>Data Security<br />&amp; Integrity</> },
      { icon: BarChart3, lines: <>Performance<br />Optimization</> },
    ],
  },
]

type TeamParticle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  twinkle: number
  phase: number
  drift: number
  previousX: number
  previousY: number
  recentSpawns: Array<{ x: number; y: number }>
}

type TeamParticleProps = {
  core: string
  bright: string
  glow: string
}

function TeamParticles({ core, bright, glow }: TeamParticleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const host = canvas.parentElement
    if (!host) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cssWidth = 0
    let cssHeight = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let animationFrame = 0
    let lastTime = performance.now()
    let destroyed = false

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = reduceMotionQuery.matches

    const particleCount = () => {
      if (cssWidth < 360) return 20
      if (cssWidth < 520) return 26
      return 34
    }

    const random = (min: number, max: number) =>
      min + Math.random() * (max - min)

    const distance = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) => Math.hypot(x1 - x2, y1 - y2)

    const chooseSpawnPoint = (
      particle: TeamParticle,
      forceFresh = false,
    ) => {
      const minDistanceFromPrevious = Math.max(
        65,
        Math.min(cssWidth, cssHeight) * 0.26,
      )

      const recent = particle.recentSpawns
      let x = cssWidth / 2
      let y = cssHeight / 2

      for (let attempt = 0; attempt < 60; attempt += 1) {
        x = random(8, Math.max(9, cssWidth - 8))
        y = random(8, Math.max(9, cssHeight - 8))

        const farFromLastPosition =
          distance(x, y, particle.previousX, particle.previousY) >=
          minDistanceFromPrevious

        const farFromRecentPositions = recent.every(
          point => distance(x, y, point.x, point.y) >= minDistanceFromPrevious * 0.72,
        )

        if ((forceFresh && farFromLastPosition && farFromRecentPositions) ||
            (!forceFresh && farFromLastPosition)) {
          break
        }
      }

      particle.previousX = x
      particle.previousY = y

      recent.push({ x, y })
      if (recent.length > 7) recent.shift()

      particle.x = x
      particle.y = y
    }

    const createParticle = (): TeamParticle => {
      const particle: TeamParticle = {
        x: 0,
        y: 0,
        vx: random(-10, 10),
        vy: random(-16, -4),
        size: random(1.35, 3.2),
        life: random(3.5, 7.5),
        maxLife: 6,
        twinkle: random(1.2, 3.4),
        phase: random(0, Math.PI * 2),
        drift: random(0.45, 1.35),
        previousX: -9999,
        previousY: -9999,
        recentSpawns: [],
      }

      particle.maxLife = particle.life
      chooseSpawnPoint(particle, true)

      particle.vx = random(-12, 12)
      particle.vy = random(-15, 8)

      return particle
    }

    let particles: TeamParticle[] = []

    const resetParticle = (particle: TeamParticle) => {
      // Remember the exact position where this particle disappeared.
      // The next spawn is forced to a clearly different location.
      particle.previousX = particle.x
      particle.previousY = particle.y

      chooseSpawnPoint(particle, true)
      particle.life = random(3.8, 8.2)
      particle.maxLife = particle.life
      particle.size = random(1.35, 3.2)
      particle.vx = random(-13, 13)
      particle.vy = random(-17, 10)
      particle.twinkle = random(1.1, 3.8)
      particle.phase = random(0, Math.PI * 2)
      particle.drift = random(0.45, 1.5)
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      cssWidth = Math.max(1, rect.width)
      cssHeight = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.round(cssWidth * dpr)
      canvas.height = Math.round(cssHeight * dpr)
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      particles = Array.from(
        { length: particleCount() },
        () => createParticle(),
      )

      lastTime = performance.now()
    }

    const drawParticle = (
      particle: TeamParticle,
      time: number,
    ) => {
      const lifeProgress = 1 - particle.life / particle.maxLife
      const fadeIn = Math.min(1, lifeProgress * 5)
      const fadeOut = Math.min(1, particle.life * 1.8)
      const baseAlpha = Math.min(fadeIn, fadeOut)

      const twinkleWave =
        (Math.sin(time * 0.001 * particle.twinkle + particle.phase) + 1) / 2

      const sparkle = Math.pow(twinkleWave, 8)
      const alpha = Math.min(
        1,
        baseAlpha * (0.48 + twinkleWave * 0.35 + sparkle * 0.35),
      )

      const size =
        particle.size *
        (1 + sparkle * 0.85)

      ctx.save()
      ctx.globalAlpha = alpha

      // Outer colored bloom.
      ctx.shadowBlur = 12 + sparkle * 15
      ctx.shadowColor = glow
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      ctx.fill()

      // Bright inner core.
      ctx.shadowBlur = 0
      ctx.globalAlpha = Math.min(1, alpha * 1.35)
      ctx.fillStyle = bright
      ctx.beginPath()
      ctx.arc(
        particle.x,
        particle.y,
        Math.max(0.75, size * 0.52),
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Occasional four-point sparkle.
      if (sparkle > 0.62) {
        const ray = size * (3.5 + sparkle * 2.2)
        ctx.globalAlpha = Math.min(1, alpha * 0.85)
        ctx.strokeStyle = bright
        ctx.lineWidth = 0.75 + sparkle * 0.55
        ctx.shadowBlur = 10 + sparkle * 12
        ctx.shadowColor = glow
        ctx.beginPath()
        ctx.moveTo(particle.x - ray, particle.y)
        ctx.lineTo(particle.x + ray, particle.y)
        ctx.moveTo(particle.x, particle.y - ray)
        ctx.lineTo(particle.x, particle.y + ray)
        ctx.stroke()
      }

      ctx.restore()
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight)

      particles.forEach(particle => {
        particle.x = Math.max(8, Math.min(cssWidth - 8, particle.x))
        particle.y = Math.max(8, Math.min(cssHeight - 8, particle.y))
        particle.life = particle.maxLife * 0.5
        drawParticle(particle, performance.now())
      })
    }

    const animate = (now: number) => {
      if (destroyed) return

      const dt = Math.min((now - lastTime) / 1000, 0.033)
      lastTime = now

      ctx.clearRect(0, 0, cssWidth, cssHeight)

      for (const particle of particles) {
        particle.life -= dt

        if (particle.life <= 0) {
          // A fresh randomized location is selected far away from the
          // particle's previous spawn, so the same visual spot is not reused.
          resetParticle(particle)
        }

        const elapsed = particle.maxLife - particle.life

        // Every particle has a different slow wandering field.
        // This prevents a synchronized/repeating loop.
        const wanderX =
          Math.sin(elapsed * particle.drift + particle.phase) *
          8 *
          dt

        const wanderY =
          Math.cos(elapsed * (particle.drift * 0.83) + particle.phase * 1.37) *
          7 *
          dt

        particle.vx += wanderX
        particle.vy += wanderY

        // Keep movement gentle and bounded.
        particle.vx *= 0.996
        particle.vy *= 0.996

        particle.x += particle.vx * dt
        particle.y += particle.vy * dt

        // Bounce softly from the card edges instead of teleporting.
        const padding = 7

        if (particle.x <= padding) {
          particle.x = padding
          particle.vx = Math.abs(particle.vx) * 0.82
        } else if (particle.x >= cssWidth - padding) {
          particle.x = cssWidth - padding
          particle.vx = -Math.abs(particle.vx) * 0.82
        }

        if (particle.y <= padding) {
          particle.y = padding
          particle.vy = Math.abs(particle.vy) * 0.82
        } else if (particle.y >= cssHeight - padding) {
          particle.y = cssHeight - padding
          particle.vy = -Math.abs(particle.vy) * 0.82
        }

        drawParticle(particle, now)
      }

      animationFrame = window.requestAnimationFrame(animate)
    }

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches

      if (reducedMotion) {
        window.cancelAnimationFrame(animationFrame)
        drawStatic()
      } else {
        lastTime = performance.now()
        animationFrame = window.requestAnimationFrame(animate)
      }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    resize()

    if (reducedMotion) {
      drawStatic()
    } else {
      animationFrame = window.requestAnimationFrame(animate)
    }

    if (typeof reduceMotionQuery.addEventListener === 'function') {
      reduceMotionQuery.addEventListener('change', handleMotionPreference)
    } else {
      reduceMotionQuery.addListener(handleMotionPreference)
    }

    return () => {
      destroyed = true
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()

      if (typeof reduceMotionQuery.removeEventListener === 'function') {
        reduceMotionQuery.removeEventListener('change', handleMotionPreference)
      } else {
        reduceMotionQuery.removeListener(handleMotionPreference)
      }
    }
  }, [bright, core, glow])

  return (
    <canvas
      ref={canvasRef}
      className="team-particles"
      aria-hidden="true"
    />
  )
}

export default function Landing() {

  const [openSocial, setOpenSocial] = useState<'linkedin' | 'github' | null>(null)

  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const socialRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleProtectedNavigation = (path: string) => {

    if (isLoggedIn()) {

      navigate(path)

    } else {

      navigate('/login')

    }

  }

  // These landing-page feature buttons ALWAYS open the Login page first.

  // This is intentional: even an already-authenticated user must go through

  // the Login page when clicking one of the newly added Legal Help options.

  const requireLogin = (_path: string) => {

    navigate('/login')

  }

  useEffect(() => {

    const disclaimerTimer = window.setTimeout(() => {

      setShowDisclaimer(false)

    }, 10000)

    return () => window.clearTimeout(disclaimerTimer)

  }, [])

  useEffect(() => {

    const handleOutsideClick = (event: MouseEvent) => {

      if (socialRef.current && !socialRef.current.contains(event.target as Node)) {

        setOpenSocial(null)

      }

    }

    document.addEventListener('mousedown', handleOutsideClick)

    return () => {

      document.removeEventListener('mousedown', handleOutsideClick)

    }

  }, [])

  return (

    <div className="landing-page" style={{ overflowX: 'hidden' }}>

      <style>{`

        /* =====================================================

           NYAYA AI LANDING PAGE ONLY

           BLACK BACKGROUND + MOVING WHITE SPARKLES + GOLD UI

           ===================================================== */

        .landing-page {

          --landing-gold: #D4AF37;

          --landing-gold-light: #F0D878;

          --landing-gold-dark: #A88624;

          background: #000 !important;

          color: #fff !important;

          min-height: 100vh;

          position: relative;

          overflow-x: hidden;

          isolation: isolate;

        }

        /* Background particles removed intentionally. */

        /* Keep every real landing element above the particles */

        .landing-page > * {

          position: relative;

          z-index: 1;

        }

        /* Remove old hero/mesh blue backgrounds */

        .landing-page .hero-gradient,

        .landing-page .mesh-gradient {

          background: #000 !important;

        }

        /* All landing sections stay black */

        .landing-page section,

        .landing-page footer {

          background-color: #000 !important;

        }

        /* White typography */

        .landing-page h1,

        .landing-page h2,

        .landing-page h3,

        .landing-page h4 {

          color: #fff !important;

        }

        .landing-page p,

        .landing-page span,

        .landing-page li {

          color: rgba(255,255,255,.78);

        }

        /* Gold highlighted headline */

        .landing-page .gradient-text {

          background: none !important;

          color: var(--landing-gold) !important;

          -webkit-text-fill-color: var(--landing-gold) !important;

        }

        /* Gold symbols/icons */

        .landing-page svg {

          color: var(--landing-gold) !important;

          stroke: var(--landing-gold) !important;

        }

        .landing-page .section-tag {

          color: var(--landing-gold) !important;

          background: rgba(212,175,55,.08) !important;

          border: 1px solid rgba(212,175,55,.30) !important;

        }

        /* Gold primary action */

        .landing-page .btn-primary {

          background: var(--landing-gold) !important;

          color: #000 !important;

          border: 1px solid var(--landing-gold-light) !important;

          box-shadow: 0 8px 28px rgba(212,175,55,.18) !important;

        }

        .landing-page .btn-primary svg {

          color: #000 !important;

          stroke: #000 !important;

        }

        /* Black/transparent secondary action */

        .landing-page .btn-ghost {

          background: rgba(255,255,255,.025) !important;

          color: #fff !important;

          border: 1px solid rgba(212,175,55,.35) !important;

        }

        .landing-page .btn-ghost svg {

          color: var(--landing-gold) !important;

          stroke: var(--landing-gold) !important;

        }

        /* Stats strip */

        .landing-page .stat-number {

          color: var(--landing-gold) !important;

        }

        /* Cards */

        .landing-page .card,

        .landing-page .feature-card {

          background: rgba(255,255,255,.025) !important;

          border: 1px solid rgba(212,175,55,.16) !important;

          box-shadow: 0 12px 35px rgba(0,0,0,.35);

        }

        .landing-page .card:hover,

        .landing-page .feature-card:hover {

          border-color: rgba(212,175,55,.42) !important;

        }

        /* Gold feature/step number backgrounds */

        .landing-page .badge {

          background: rgba(212,175,55,.10) !important;

          color: var(--landing-gold) !important;

        }

        /* Team cards */

        .landing-page .team-card:hover {

          transform: translateY(-8px);

          border-color: rgba(212,175,55,.55) !important;

          box-shadow: 0 24px 55px rgba(0,0,0,.50) !important;

        }

        /* =====================================================
           TEAM CARDS + LIVE PARTICLES
           Cards stay completely still. Only the particles move.
           ===================================================== */

        .landing-page .team-card {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .landing-page .team-card:hover {
          transform: none !important;
          border-color: rgba(212,175,55,.55) !important;
          box-shadow: 0 24px 55px rgba(0,0,0,.50) !important;
        }

        .landing-page .team-card > *:not(.team-particles) {
          position: relative;
          z-index: 2;
        }

        .landing-page .team-particles {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
          z-index: 0;
        }

        .landing-page .team-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
          width: 100%;
          align-items: stretch;
        }

        @media (max-width: 900px) {
          .landing-page .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .landing-page .team-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-page .team-card {
            transition: none !important;
          }
        }

        /* Footer */

        .landing-page footer {

          border-top-color: rgba(212,175,55,.18) !important;

        }

        /* Footer logo */

        .landing-page footer a:hover {

          color: var(--landing-gold) !important;

        }

        /* CTA banner links */

        .landing-page a {

          transition: border-color .2s ease, color .2s ease, background .2s ease;

        }

        /* If the navbar is outside Landing.tsx, style it ONLY while

           this landing page exists. This does not affect dashboard pages. */

        body:has(.landing-page) nav {

          background: rgba(0,0,0,.88) !important;

          border-bottom: 1px solid rgba(212,175,55,.18) !important;

        }

        body:has(.landing-page) nav svg {

          color: var(--landing-gold) !important;

          stroke: var(--landing-gold) !important;

        }


      `}</style>

      {/* ── Hero ── */}

      <section className="hero-gradient" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative' }}>

        {/* Decorative orbs */}

        <div style={{

          position: 'absolute', width: 600, height: 600, borderRadius: '50%',

          background: 'radial-gradient(circle, rgba(162,123,44,0.06) 0%, transparent 70%)',

          top: -100, left: -100, pointerEvents: 'none',

        }} />

        <div style={{

          position: 'absolute', width: 400, height: 400, borderRadius: '50%',

          background: 'radial-gradient(circle, rgba(36,52,71,0.05) 0%, transparent 70%)',

          bottom: 0, right: 100, pointerEvents: 'none',

        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', width: '100%' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}

            className="hero-grid">

            {/* Left */}

            <div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>

                <span className="section-tag">

                  <Zap size={12} /> Agentic AI Platform

                </span>

              </div>

              <h1 style={{

                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', fontWeight: 900,

                lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 20, color: 'var(--text)',

              }}>

                AI Legal Guidance<br /><span className="gradient-text">for India</span><br />with Nyaya AI.

              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>

                Nyaya AI provides AI-powered legal guidance in India, helps you understand your rights, analyze legal documents, find relevant legal information, and connect with advocates — all in your language.

              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>

                <button

                  type="button"

                  onClick={() => handleProtectedNavigation('/dashboard/ai-assistant')}

                  className="btn-primary"

                  style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>

                  <MessageSquare size={18} />

                  Get Legal Help

                </button>

                <button

                  type="button"

                  onClick={() => handleProtectedNavigation('/dashboard/advocates')}

                  className="btn-ghost"

                  style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>

                  <Users size={18} />

                  Find an Advocate

                  <ArrowRight size={16} />

                </button>

              </div>

              {/* Trust indicators */}

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

                {['Bar Council Verified', 'ISO 27001 Certified', 'MeitY Recognized'].map(t => (

                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>

                    <CheckCircle size={14} style={{ color: '#D4AF37', flexShrink: 0 }} />

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t}</span>

                  </div>

                ))}

              </div>

            </div>

            {/* Right – Illustration */}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

              <HeroVideo />

            </div>

          </div>

        </div>

      </section>

{/* ── Stats ── */}

<section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>

  <motion.div

    initial={{ opacity: 0, y: 24 }}

    whileInView={{ opacity: 1, y: 0 }}

    viewport={{ once: false, amount: 0.2 }}

    transition={{ duration: 0.8, ease: 'easeOut' }}

  >

    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="stats-grid">

            {stats.map(s => (

              <div key={s.label} style={{ textAlign: 'center' }}>

                <div className="stat-number">{s.value}</div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>

                  {s.label}

                </div>

              </div>

            ))}

          </div>

        </div>

         </motion.div>

      </section>

      {/* ── How It Works ── */}

      <motion.section
        id="how-it-works"
        style={{ padding: '100px 24px' }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.12 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <motion.div
            style={{ textAlign: 'center', marginBottom: 64 }}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >

            <span className="section-tag" style={{ marginBottom: 16, display: 'inline-flex' }}>

              <Clock size={12} /> How It Works

            </span>

            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginTop: 12 }}>

              Justice in four steps

            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>

              From describing your problem to hiring an advocate — NyayaAI guides you every step of the way.

            </p>

          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="steps-grid">

            {steps.map((s, i) => (

              <motion.div
                key={s.step}
                className="card"
                style={{ padding: 28, position: 'relative' }}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: 'easeOut' }}
              >

                <div style={{

                  width: 48, height: 48, borderRadius: 14, marginBottom: 16,

                  background: `color-mix(in srgb, ${s.color} 12%, transparent)`,

                  display: 'flex', alignItems: 'center', justifyContent: 'center',

                }}>

                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: s.color }}>

                    {s.step}

                  </span>

                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>

                  {s.title}

                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>

                  {s.desc}

                </p>

                {i < steps.length - 1 && (

                  <ChevronRight size={18} style={{

                    position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',

                    color: 'var(--text-subtle)', zIndex: 1,

                  }} />

                )}

              </motion.div>

            ))}

          </div>

        </div>

      </motion.section>

      {/* ── Features ── */}

      <motion.section
        id="features"
        className="mesh-gradient"
        style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <motion.div
            style={{ textAlign: 'center', marginBottom: 64 }}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >

            <span className="section-tag" style={{ marginBottom: 16, display: 'inline-flex' }}>

              <Zap size={12} /> Platform Features

            </span>

            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginTop: 12 }}>

              Everything you need for legal clarity

            </h2>

          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="features-grid">

            {features.map((f, i) => (

              <motion.div
                key={f.title}
                className="feature-card"
                style={{ padding: 28 }}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.18 }}
                transition={{ duration: 0.55, delay: i * 0.09, ease: 'easeOut' }}
              >

                <div style={{

                  width: 48, height: 48, borderRadius: 14, background: f.bg,

                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,

                }}>

                  <f.icon size={22} style={{ color: f.color }} strokeWidth={2} />

                </div>

                <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontSize: '1rem' }}>

                  {f.title}

                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>

                  {f.desc}

                </p>

              </motion.div>

            ))}

          </div>

        </div>

      </motion.section>

      {/* ── Our Team ── */}

      <motion.section id="about" style={{

        padding: '100px 24px',

        borderTop: '1px solid var(--border)',

        position: 'relative',

        overflow: 'hidden',

      }}>

        <div style={{

          position: 'absolute',

          width: 520,

          height: 520,

          borderRadius: '50%',

          background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)',

          top: -180,

          left: '50%',

          transform: 'translateX(-50%)',

          pointerEvents: 'none',

        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Section heading */}

          <div style={{ textAlign: 'center', marginBottom: 56 }}>

            <span className="section-tag" style={{

              marginBottom: 16,

              display: 'inline-flex',

              alignItems: 'center',

              gap: 7,

            }}>

              <Users size={14} /> Our Team

            </span>

            <h2 style={{

              fontSize: 'clamp(2rem, 4vw, 3.2rem)',

              fontWeight: 850,

              lineHeight: 1.15,

              letterSpacing: '-0.04em',

              color: 'var(--text)',

              marginTop: 12,

              marginBottom: 16,

            }}>

              Meet the People Behind <span className="gradient-text">Nyaya AI</span>

            </h2>

            <p style={{

              maxWidth: 760,

              margin: '0 auto',

              color: 'var(--text-muted)',

              fontSize: '1rem',

              lineHeight: 1.7,

            }}>

              A passionate team combining leadership, software engineering, and

              database expertise to build accessible and technology-driven legal

              guidance for India.

            </p>

          </div>

          {/* Team cards — static layout with independent live particle fields */}
          <motion.div
            className="team-grid"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.12 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            aria-label="Nyaya AI team members"
          >
            {teamMembers.map(member => {
              const RoleIcon = member.roleIcon

              const particlePalette =
                member.name === 'Gaurav Singh'
                  ? {
                      core: '#FF3B30',
                      bright: '#FF6B5F',
                      glow: 'rgba(255,59,48,0.95)',
                    }
                  : member.name === 'Tarun Pokhariya'
                    ? {
                        core: '#B44CFF',
                        bright: '#D58AFF',
                        glow: 'rgba(180,76,255,0.95)',
                      }
                    : {
                        core: '#2196FF',
                        bright: '#65C7FF',
                        glow: 'rgba(33,150,255,0.95)',
                      }

              return (
                <div
                  className="team-card"
                  key={member.name}
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(212,175,55,0.22)',
                    borderRadius: 20,
                    padding: 24,
                    textAlign: 'center',
                    boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                    width: '100%',
                    maxWidth: 380,
                    margin: '0 auto',
                    boxSizing: 'border-box',
                  }}
                >
                  <TeamParticles
                    core={particlePalette.core}
                    bright={particlePalette.bright}
                    glow={particlePalette.glow}
                  />

                  <div style={{
                    width: 190,
                    height: 190,
                    margin: '0 auto 22px',
                    borderRadius: '50%',
                    padding: 4,
                    background: 'linear-gradient(135deg, #D4AF37, #F5D76E, #A27B2C)',
                    boxShadow: '0 0 35px rgba(212,175,55,0.18)',
                  }}>
                    <img
                      src={member.image}
                      alt={`${member.name} - ${member.role} at Nyaya AI`}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        objectPosition: 'center top',
                        display: 'block',
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: '1px solid rgba(212,175,55,0.55)',
                    background: 'rgba(212,175,55,0.06)',
                    color: '#D4AF37',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    marginBottom: 16,
                  }}>
                    <RoleIcon size={15} /> {member.role}
                  </div>

                  <h3 style={{
                    color: 'var(--text)',
                    fontSize: '1.55rem',
                    fontWeight: 800,
                    margin: '0 0 12px',
                    letterSpacing: '-0.02em',
                  }}>
                    {member.name}
                  </h3>

                  <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.94rem',
                    lineHeight: 1.7,
                    margin: '0 0 24px',
                    minHeight: 130,
                  }}>
                    {member.description}
                  </p>

                  <div style={{
                    height: 1,
                    background: 'rgba(212,175,55,0.18)',
                    marginBottom: 22,
                  }} />

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                    textAlign: 'left',
                  }}>
                    {member.skills.map((skill, skillIndex) => {
                      const SkillIcon = skill.icon

                      return (
                        <div key={`${member.name}-skill-${skillIndex}`}>
                          <SkillIcon size={22} style={{ color: '#D4AF37', marginBottom: 8 }} />
                          <div style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.76rem',
                            lineHeight: 1.4,
                          }}>
                            {skill.lines}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>

        </div>

      </motion.section>

      {/* ── What You Can Do ── */}

      <motion.section
        id="pricing"
        className="hero-gradient"
        style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <motion.div
            style={{ textAlign: 'center', marginBottom: 56 }}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >

            <span className="section-tag" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 7 }}>

              <Scale size={12} /> Legal Help Starts Here

            </span>

            <h2 style={{

              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',

              fontWeight: 800,

              color: 'var(--text)',

              letterSpacing: '-0.03em',

              marginTop: 12,

              marginBottom: 14,

            }}>

              Legal help that starts with you.

            </h2>

            <p style={{

              color: 'var(--text-muted)',

              fontSize: '1rem',

              lineHeight: 1.7,

              maxWidth: 650,

              margin: '0 auto',

            }}>

              Get AI-powered legal guidance, understand your rights, analyze documents,

              and connect with advocates — all from one platform.

            </p>

          </motion.div>

          <div

            style={{

              display: 'grid',

              gridTemplateColumns: 'repeat(3, 1fr)',

              gap: 24,

            }}

            className="pricing-grid"

          >

            {[

              {

                icon: MessageSquare,

                title: 'AI Legal Guidance',

                desc: 'Describe your legal issue in simple language and get structured guidance based on your situation.',

                button: 'Get Legal Help',

                action: () => requireLogin('/dashboard/ai-assistant'),

              },

              {

                icon: FileSearch,

                title: 'Document Analysis',

                desc: 'Upload legal documents and use AI to identify important information, clauses, risks, and key points.',

                button: 'Analyze a Document',

                action: () => requireLogin('/dashboard/documents'),

              },

              {

                icon: Users,

                title: 'Find an Advocate',

                desc: 'Discover advocates based on your legal needs and connect with the right professional for your matter.',

                button: 'Find an Advocate',

                action: () => requireLogin('/dashboard/advocates'),

              },

            ].map((item, i) => {

              const Icon = item.icon

              return (

                <motion.div
                  key={item.title}
                  className="card"
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.18 }}
                  transition={{ duration: 0.55, delay: i * 0.12, ease: 'easeOut' }}

                  style={{

                    padding: 30,

                    position: 'relative',

                    display: 'flex',

                    flexDirection: 'column',

                    minHeight: 320,

                  }}

                >

                  <div

                    style={{

                      width: 52,

                      height: 52,

                      borderRadius: 15,

                      background: 'rgba(212,175,55,0.09)',

                      border: '1px solid rgba(212,175,55,0.20)',

                      display: 'flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      marginBottom: 20,

                    }}

                  >

                    <Icon size={23} />

                  </div>

                  <h3

                    style={{

                      fontSize: '1.15rem',

                      fontWeight: 750,

                      color: 'var(--text)',

                      marginBottom: 10,

                    }}

                  >

                    {item.title}

                  </h3>

                  <p

                    style={{

                      fontSize: '0.9rem',

                      color: 'var(--text-muted)',

                      lineHeight: 1.7,

                      margin: '0 0 24px',

                      flex: 1,

                    }}

                  >

                    {item.desc}

                  </p>

                  <button

                    type="button"

                    onClick={item.action}

                    className="btn-ghost"

                    style={{

                      width: '100%',

                      padding: '12px 14px',

                      borderRadius: 10,

                      fontWeight: 700,

                      fontSize: '0.88rem',

                      display: 'inline-flex',

                      alignItems: 'center',

                      justifyContent: 'center',

                      gap: 8,

                      cursor: 'pointer',

                    }}

                  >

                    {item.button}

                    <ArrowRight size={16} />

                  </button>

                </motion.div>

              )

            })}

          </div>

          <div

            style={{

              marginTop: 28,

              padding: '18px 22px',

              borderRadius: 14,

              border: '1px solid rgba(212,175,55,0.18)',

              background: 'rgba(212,175,55,0.035)',

              textAlign: 'center',

            }}

          >

            <p

              style={{

                margin: 0,

                color: 'rgba(255,255,255,0.72)',

                fontSize: '0.86rem',

                lineHeight: 1.6,

              }}

            >

              Start exploring Nyaya AI today — no subscription purchase is required.

            </p>

          </div>

        </div>

      </motion.section>

      {/* ── CTA Banner ── */}

      <motion.section
        style={{ padding: '80px 24px', background: '#000000' }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >

        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>

          <Shield size={40} style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto 20px' }} />

          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 16 }}>

            Your rights. Our mission.

          </h2>

          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', marginBottom: 32, lineHeight: 1.6 }}>

            Every Indian deserves access to quality legal help. NyayaAI makes that possible — free, fast, and in your language.

          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>

            <Link to="/signup" style={{

              padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: '1rem',

              background: '#F5F1E8', color: '#243447', textDecoration: 'none',

              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8,

            }}>

              Get Started Free <ArrowRight size={18} />

            </Link>

            <button

              type="button"

              onClick={() => handleProtectedNavigation('/dashboard/advocates')}

              style={{

                padding: '14px 32px', borderRadius: 12, fontWeight: 600, fontSize: '1rem',

                background: 'rgba(255,255,255,0.15)', color: 'white',

                border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',

              }}>

              Find an Advocate

            </button>

          </div>

        </div>

      </motion.section>

      {/* ── Footer ── */}

      <motion.footer id="contact" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '64px 24px 32px' }}>

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }} className="footer-grid">

            <div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>

                <span style={{

                  fontWeight: 900,

                  fontSize: '1.25rem',

                  letterSpacing: '4px',

                  color: '#D4AF37',

                }}>

                  ALPINE

                </span>

              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 280 }}>

                AI-powered legal assistance platform, making legal guidance simple and accessible for everyone.

              </p>

              {/* Team social profiles */}

              <div

                ref={socialRef}

                style={{

                  display: 'flex',

                  gap: 8,

                  marginTop: 16,

                  flexWrap: 'wrap',

                }}

              >

                {/* LinkedIn */}

                <div style={{ position: 'relative' }}>

                  <button

                    type="button"

                    onClick={() =>

                      setOpenSocial(

                        openSocial === 'linkedin' ? null : 'linkedin'

                      )

                    }

                    style={{

                      padding: '7px 12px',

                      borderRadius: 6,

                      background: 'var(--bg-card)',

                      border: '1px solid rgba(212,175,55,0.35)',

                      fontSize: '0.75rem',

                      color: '#D4AF37',

                      cursor: 'pointer',

                      fontWeight: 600,

                    }}

                  >

                    LinkedIn

                  </button>

                  {openSocial === 'linkedin' && (

                    <div

                      style={{

                        position: 'absolute',

                        bottom: 'calc(100% + 8px)',

                        left: 0,

                        minWidth: 190,

                        padding: 8,

                        borderRadius: 8,

                        background: '#080808',

                        border: '1px solid rgba(212,175,55,0.35)',

                        boxShadow: '0 12px 30px rgba(0,0,0,0.55)',

                        zIndex: 100,

                      }}

                    >

                      <a

                        href="https\://www.linkedin.com/in/tarun-pokhariya-9971433a6"

                        target="_blank"

                        rel="noopener noreferrer"

                        style={teamProfileLinkStyle}

                      >

                        Tarun Pokhariya

                      </a>

                      <a

                        href="https\://www.linkedin.com/in/pragitya-ghosh-33ba5a381/"

                        target="_blank"

                        rel="noopener noreferrer"

                        style={teamProfileLinkStyle}

                      >

                        Pragitya Ghosh

                      </a>

                      <a

                        href="https\://www.linkedin.com/in/gaurav-singh-aa6a19376"

                        target="_blank"

                        rel="noopener noreferrer"

                        style={teamProfileLinkStyle}

                      >

                        Gaurav Singh

                      </a>

                    </div>

                  )}

                </div>

                {/* GitHub */}

                <div style={{ position: 'relative' }}>

                  <button

                    type="button"

                    onClick={() =>

                      setOpenSocial(

                        openSocial === 'github' ? null : 'github'

                      )

                    }

                    style={{

                      padding: '7px 12px',

                      borderRadius: 6,

                      background: 'var(--bg-card)',

                      border: '1px solid rgba(212,175,55,0.35)',

                      fontSize: '0.75rem',

                      color: '#D4AF37',

                      cursor: 'pointer',

                      fontWeight: 600,

                    }}

                  >

                    GitHub

                  </button>

                  {openSocial === 'github' && (

                    <div

                      style={{

                        position: 'absolute',

                        bottom: 'calc(100% + 8px)',

                        left: 0,

                        minWidth: 190,

                        padding: 8,

                        borderRadius: 8,

                        background: '#080808',

                        border: '1px solid rgba(212,175,55,0.35)',

                        boxShadow: '0 12px 30px rgba(0,0,0,0.55)',

                        zIndex: 100,

                      }}

                    >

                      <a

                        href="https\://github.com/tarunpokhariya2007-svg"

                        target="_blank"

                        rel="noopener noreferrer"

                        style={teamProfileLinkStyle}

                      >

                        Tarun Pokhariya

                      </a>

                      <a

                        href="https\://github.com/gaurav8469"

                        target="_blank"

                        rel="noopener noreferrer"

                        style={teamProfileLinkStyle}

                      >

                        Gaurav Singh

                      </a>

                      <a

                        href="https\://github.com/Pragitya02"

                        target="_blank"

                        rel="noopener noreferrer"

                        style={teamProfileLinkStyle}

                      >

                        Pragitya Ghosh

                      </a>

                    </div>

                  )}

                </div>

              </div>

            </div>

            {[

              { heading: 'Platform', links: ['AI Assistant', 'Find Advocates', 'Document Analyzer', 'Jurisdiction Finder', 'Legal Help'] },

              { heading: 'For Advocates', links: ['Join as Advocate', 'AI Research Tool', 'Client Management', 'Earnings Dashboard', 'Verification'] },

              { heading: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact', 'Privacy Policy'] },

            ].map(col => (

              <div key={col.heading}>

                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>

                  {col.heading}

                </h4>

                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {col.links.map(l => (

                    <li key={l}>

                      <a href="#" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>

                    </li>

                  ))}

                </ul>

              </div>

            ))}

          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>

              © 2026 NyayaAI Technologies Pvt. Ltd. · Not a substitute for professional legal advice. · CIN: U74140DL2024PTC000001

            </p>

            <div style={{ display: 'flex', gap: 16 }}>

              {['Terms', 'Privacy', 'Disclaimer', 'Grievance'].map(l => (

                <a key={l} href="#" style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textDecoration: 'none' }}>{l}</a>

              ))}

            </div>

          </div>

        </div>

      </motion.footer>

      <style>{`

        .nyaya-disclaimer {

          position: fixed;

          right: 20px;

          bottom: 20px;

          width: min(360px, calc(100vw - 32px));

          max-height: 190px;

          overflow-y: auto;

          padding: 14px 42px 14px 16px;

          background: rgba(8, 8, 8, 0.96);

          border: 1px solid rgba(212, 175, 55, 0.65);

          border-radius: 12px;

          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55);

          backdrop-filter: blur(8px);

          -webkit-backdrop-filter: blur(8px);

          z-index: 9999;

          scrollbar-width: thin;

        }

        .nyaya-disclaimer::-webkit-scrollbar {

          width: 6px;

        }

        .nyaya-disclaimer::-webkit-scrollbar-thumb {

          background: rgba(212, 175, 55, 0.65);

          border-radius: 10px;

        }

        .nyaya-disclaimer-title {

          margin: 0 0 7px;

          color: #D4AF37;

          font-size: 0.78rem;

          font-weight: 800;

          letter-spacing: 0.04em;

          text-transform: uppercase;

        }

        .nyaya-disclaimer-text {

          margin: 0;

          color: rgba(255, 255, 255, 0.78);

          font-size: 0.72rem;

          line-height: 1.55;

        }

        .nyaya-disclaimer-close {

          position: absolute;

          top: 8px;

          right: 8px;

          width: 28px;

          height: 28px;

          border: 1px solid rgba(212, 175, 55, 0.35);

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.04);

          color: #D4AF37;

          display: flex;

          align-items: center;

          justify-content: center;

          cursor: pointer;

          font-size: 18px;

          line-height: 1;

          padding: 0;

        }

        .nyaya-disclaimer-close:hover {

          background: rgba(212, 175, 55, 0.12);

        }

        @media (max-width: 600px) {

          .nyaya-disclaimer {

            right: 12px;

            bottom: 12px;

            width: calc(100vw - 24px);

            max-height: 170px;

            padding: 13px 40px 13px 14px;

          }

          .nyaya-disclaimer-text {

            font-size: 0.7rem;

          }

        }

      `}</style>

      {showDisclaimer && (

        <div

          className="nyaya-disclaimer"

          role="dialog"

          aria-label="Legal disclaimer"

        >

          <button

            type="button"

            className="nyaya-disclaimer-close"

            onClick={() => setShowDisclaimer(false)}

            aria-label="Close disclaimer"

            title="Close"

          >

            ×

          </button>

          <p className="nyaya-disclaimer-title">Disclaimer</p>

          <p className="nyaya-disclaimer-text">

            Nyaya AI provides general legal information and AI-assisted

            guidance. It is not a substitute for advice from a qualified

            advocate. Laws and procedures may change, so users should verify

            important matters with a legal professional.

          </p>

        </div>

      )}

      <style>{`

        @media (max-width: 900px) {

          .hero-grid { grid-template-columns: 1fr !important; }

          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }

          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }

          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }

          .pricing-grid { grid-template-columns: 1fr !important; }

          .footer-grid { grid-template-columns: 1fr 1fr !important; }

        }

        @media (max-width: 600px) {

          .stats-grid { grid-template-columns: 1fr 1fr !important; }

          .steps-grid { grid-template-columns: 1fr !important; }

          .features-grid { grid-template-columns: 1fr !important; }

          .footer-grid { grid-template-columns: 1fr !important; }

        }

      `}</style>

    </div>

  )

}

function HeroVideo() {

  const videoARef = useRef<HTMLVideoElement>(null)

  const videoBRef = useRef<HTMLVideoElement>(null)

  const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A')

  useEffect(() => {

    const videoA = videoARef.current

    const videoB = videoBRef.current

    if (!videoA || !videoB) return

    let switching = false

    const handleTimeUpdate = () => {

      const currentVideo = activeVideo === 'A' ? videoA : videoB

      const nextVideo = activeVideo === 'A' ? videoB : videoA

      if (

        !switching &&

        Number.isFinite(currentVideo.duration) &&

        currentVideo.duration > 0 &&

        currentVideo.currentTime >= currentVideo.duration - 0.45

      ) {

        switching = true

        nextVideo.currentTime = 0

        nextVideo.play().catch(() => {})

        setActiveVideo(activeVideo === 'A' ? 'B' : 'A')

        window.setTimeout(() => {

          currentVideo.pause()

          currentVideo.currentTime = 0

          switching = false

        }, 450)

      }

    }

    const activeVideoElement = activeVideo === 'A' ? videoA : videoB

    activeVideoElement.addEventListener('timeupdate', handleTimeUpdate)

    return () => {

      activeVideoElement.removeEventListener('timeupdate', handleTimeUpdate)

    }

  }, [activeVideo])

  return (

    <div

      className="legal-scale-video"

      style={{

        position: 'relative',

        width: 560,

        height: 460,

        maxWidth: '100%',

        display: 'flex',

        justifyContent: 'center',

        alignItems: 'center',

      }}

    >

      <video

        ref={videoARef}

        src="/hero-scale.mp4"

        muted

        autoPlay

        playsInline

        preload="auto"

        aria-hidden="true"

        style={{

          position: 'absolute',

          inset: 0,

          width: '100%',

          height: '100%',

          objectFit: 'contain',

          opacity: activeVideo === 'A' ? 1 : 0,

          transition: 'opacity 450ms ease-in-out',

          pointerEvents: 'none',

        }}

      />

      <video

        ref={videoBRef}

        src="/hero-scale.mp4"

        muted

        playsInline

        preload="auto"

        aria-hidden="true"

        style={{

          position: 'absolute',

          inset: 0,

          width: '100%',

          height: '100%',

          objectFit: 'contain',

          opacity: activeVideo === 'B' ? 1 : 0,

          transition: 'opacity 450ms ease-in-out',

          pointerEvents: 'none',

        }}

      />

      <style>{`

        .legal-scale-video {

          overflow: visible;

        }

        @media (max-width: 700px) {

          .legal-scale-video {

            width: 100% !important;

            height: 420px !important;

          }

        }

        @media (prefers-reduced-motion: reduce) {

          .legal-scale-video video {

            transition: none !important;

          }

        }

      `}</style>

    </div>

  )

}
