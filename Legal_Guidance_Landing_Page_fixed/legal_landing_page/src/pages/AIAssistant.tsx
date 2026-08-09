import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import {
  Send, Mic, Square, Paperclip, RotateCcw, Scale, FileText, Users,
  Clock, ChevronRight, Sparkles, MessageSquare, Plus, X, Volume2, Loader2,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
  metadata?: {
    caseType?: string
    laws?: string[]
    actions?: string[]
    documents?: string[]
    timeline?: string
  }
}

const suggestedPrompts = [
  'My landlord is refusing to return my security deposit',
  'I was wrongfully terminated without notice period',
  'A company cheated me in an online transaction',
  'My neighbor is encroaching on my property',
  'How do I file an RTI application?',
  'What are my rights if I am arrested?',
]

const aiResponses: Record<string, Message> = {
  default: {
    id: 'ai-1',
    role: 'ai',
    content: 'I\'ve analyzed your situation carefully. Here\'s a comprehensive legal assessment based on Indian law.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    metadata: {
      caseType: 'Property Law — Security Deposit Dispute',
      laws: [
        'Transfer of Property Act, 1882 — Section 108',
        'Model Tenancy Act, 2021 — Section 24',
        'Specific Relief Act, 1963 — Section 38',
        'Consumer Protection Act, 2019 (if builder involved)',
      ],
      actions: [
        'Send a legal notice to landlord via registered post within 7 days',
        'File complaint with Rent Authority / Rent Controller of your district',
        'Approach Consumer Disputes Redressal Commission if amount > ₹1 lakh',
        'File civil suit under Order XXXVII CPC for recovery of money',
      ],
      documents: [
        'Original rent agreement with landlord signature',
        'Bank receipts / UPI transaction proofs of deposit payment',
        'Written communication with landlord (WhatsApp, email)',
        'Utility bills and possession certificate (proof of vacancy)',
        'Photos/video of property condition at time of leaving',
      ],
      timeline: '2–6 weeks for Rent Authority resolution; 6–18 months for civil court',
    },
  },
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Namaste! I\'m NyayaAI, your AI-powered legal assistant trained on Indian law — IPC, CrPC, CPC, IBC, RTI Act, and thousands of court judgments.\n\nDescribe your legal problem in simple terms, upload a document, or choose a suggested topic below. I\'ll provide detailed legal guidance instantly.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentStep, setAgentStep] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null)
  const activeChat = conversationId?.toString() || ''
  const [chatHistory, setChatHistory] = useState<
  { id: string; title: string; date: string }[]
>([])
  const [fileUploaded, setFileUploaded] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [loadingSpeechId, setLoadingSpeechId] = useState<string | null>(null)
  const [voiceEngine, setVoiceEngine] = useState<'browser' | 'sarvam'>('sarvam')
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const speechRecognitionRef = useRef<any>(null)
const loadConversations = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) return;

    const res = await fetch(
      "http://localhost:5001/api/chat/conversations",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(
        data.message || "Failed to load conversations"
      );
    }

    setChatHistory(
      data.conversations.map((chat: any) => ({
        id: String(chat.id),
        title: chat.title || "New Chat",
        date: new Date(
          chat.updated_at || chat.created_at
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }))
    );
  } catch (err) {
    console.error("LOAD CONVERSATIONS ERROR:", err);
  }
};

const loadConversation = async (id: string) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    const res = await fetch(
      `http://localhost:5001/api/chat/conversations/${id}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(
        data.message || "Failed to load conversation"
      );
    }

    setConversationId(Number(id));

    const loadedMessages: Message[] = data.messages.map(
      (msg: any, index: number) => ({
        id: String(msg.id ?? index),
        role: msg.sender === "user" ? "user" : "ai",
        content: msg.message,
        timestamp: msg.created_at
          ? new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      })
    );

    setMessages(loadedMessages);
  } catch (err) {
    console.error("LOAD CONVERSATION ERROR:", err);
    alert("Failed to load conversation.");
  }
};

useEffect(() => {
  loadConversations();
}, []);

  const saveMessage = async (
  conversationId: number,
  sender: "user" | "ai",
  message: string,
  token: string
) => {
  const res = await fetch(
    `http://localhost:5001/api/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sender,
        message,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(
      data.message || "Failed to save message"
    );
  }

  return data;
};
const sendMessage = async (text: string) => {
  if (!text.trim()) return;

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again.");
    return;
  }

  const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setAgentStep("🧠 Master Agent is understanding your case...");
    await new Promise(r => setTimeout(r, 700));

    setAgentStep("📄 Case Analyzer is classifying the zcase...");
    await new Promise(r => setTimeout(r, 700));

    setAgentStep("⚖️ Law Research Agent is finding relevant laws...");
    await new Promise(r => setTimeout(r, 700));

    setAgentStep("👨‍⚖️ Lawyer Recommendation Agent is selecting advocates...");
    await new Promise(r => setTimeout(r, 700));

    setAgentStep("📝 Report Generator is preparing your legal report...");

    try {
      let currentConversationId = conversationId;

if (!currentConversationId) {
  const conversationRes = await fetch(
    "http://localhost:5001/api/chat/conversations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: text.slice(0, 60),
      }),
    }
  );

  const conversationData = await conversationRes.json();

  if (!conversationRes.ok || !conversationData.success) {
    throw new Error(
      conversationData.message || "Failed to create conversation"
    );
  }

  currentConversationId = conversationData.conversationId;
  setConversationId(currentConversationId);
}
if (currentConversationId !== null) {
  await saveMessage(
    currentConversationId,
    "user",
    text,
    token
  );
}
       const res = await fetch("http://localhost:5001/analyze", {
          method: "POST",
          headers: {
             "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          body: JSON.stringify({
             case: text,
          }),
    });

        const data = await res.json();

        const aiMsg: Message = {
            id: Date.now().toString() + "-ai",
            role: "ai",
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
setMessages(prev => [...prev, aiMsg]);

if (currentConversationId !== null) {
  await saveMessage(
    currentConversationId,
    "ai",
    data.response,
    token
  );
}

    } catch (err) {
        console.error(err);

        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                role: "ai",
                content: "Unable to connect to backend.",
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
        ]);
    } finally {
        setLoading(false);
        setAgentStep("");
    }
};

  // ---- Speech-to-text (mic input) ----

  // Browser-native path: uses the Web Speech API (free, no backend call, English-strongest)
  const startBrowserRecognition = () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      alert('Your browser does not support built-in speech recognition. Try Chrome, or switch to the Sarvam AI engine.')
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(prev => (prev ? prev + ' ' : '') + transcript)
    }
    recognition.onerror = (event: any) => {
      console.error('Browser speech recognition error:', event.error)
    }
    recognition.onend = () => setIsRecording(false)

    speechRecognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  const stopBrowserRecognition = () => {
    speechRecognitionRef.current?.stop()
    setIsRecording(false)
  }

  // Sarvam path: records audio and sends it to the backend for transcription
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Mic access error:', err)
      alert('Could not access microphone. Please check browser permissions.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  const handleMicClick = () => {
    if (voiceEngine === 'browser') {
      isRecording ? stopBrowserRecognition() : startBrowserRecognition()
    } else {
      isRecording ? stopRecording() : startRecording()
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setTranscribing(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language_code', 'unknown') // auto-detect Hindi/Punjabi/English etc.

      const res = await fetch('http://localhost:5001/api/voice/stt', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (data.success && data.transcript) {
        setInput(prev => (prev ? prev + ' ' : '') + data.transcript)
      } else {
        console.error('STT failed:', data.message)
        alert(`Voice input failed: ${data.message || 'unknown error'}`)
      }
    } catch (err) {
      console.error('STT error:', err)
      alert('Voice input failed — could not reach the server. Check that the backend is running on port 5001.')
    } finally {
      setTranscribing(false)
    }
  }

  // ---- Text-to-speech (read AI reply aloud) ----
  const handleSpeak = async (messageId: string, text: string) => {
    // If this message is already playing, stop it
    if (speakingId === messageId) {
      if (voiceEngine === 'browser') {
        window.speechSynthesis.cancel()
      } else {
        audioPlayerRef.current?.pause()
      }
      setSpeakingId(null)
      return
    }

    // Stop anything else currently playing
    window.speechSynthesis.cancel()
    audioPlayerRef.current?.pause()
    setSpeakingId(null)

    if (voiceEngine === 'browser') {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-IN'
      utterance.onend = () => setSpeakingId(null)
      utterance.onerror = () => setSpeakingId(null)
      setSpeakingId(messageId)
      window.speechSynthesis.speak(utterance)
      return
    }

    setLoadingSpeechId(messageId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, language_code: 'en-IN' }),
      })

      const data = await res.json()
      if (data.success && data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`)
        audioPlayerRef.current = audio
        audio.onended = () => setSpeakingId(null)
        setSpeakingId(messageId)
        await audio.play()
      } else {
        console.error('TTS failed:', data.message)
        alert(`Voice output failed: ${data.message || 'unknown error'}`)
      }
    } catch (err) {
      console.error('TTS error:', err)
      alert('Voice output failed — could not reach the server. Check that the backend is running on port 5001.')
    } finally {
      setLoadingSpeechId(null)
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 116px)', gap: 0, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Chat history sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} className="ai-sidebar">
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>
          <button className="btn-primary"
            onClick={() => {
  setConversationId(null);

  setMessages([{
    id: 'welcome-new',
    role: 'ai',
    content: 'New conversation started. How can I help you with your legal matter today?',
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
  }]);
}}
            style={{
              width: '100%', padding: '9px', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <Plus size={14} /> New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {chatHistory.map(ch => (
            <div
           key={ch.id}
  onClick={() => loadConversation(ch.id)}
  style={{
                padding: '10px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                background: ch.id === activeChat ? 'var(--bg-card)' : 'transparent',
                border: ch.id === activeChat ? '1px solid var(--border)' : '1px solid transparent',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MessageSquare size={13} style={{ color: 'var(--text-muted)', marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>{ch.title}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{ch.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-subtle)', lineHeight: 1.5 }}>
          NyayaAI provides general legal information, not professional legal advice. Consult a qualified advocate for your specific situation.
        </div>
      </aside>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--blue), #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Scale size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>NyayaAI Legal Assistant</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
              Online · Trained on Indian Law
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              onClick={() => setVoiceEngine(v => v === 'sarvam' ? 'browser' : 'sarvam')}
              title="Switch voice engine"
              style={{
                padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
                background: 'var(--bg-secondary)', fontSize: '0.75rem', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}>
              <Volume2 size={12} /> Voice: {voiceEngine === 'sarvam' ? 'Sarvam AI' : 'Browser'}
            </button>
            <button style={{
              padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', fontSize: '0.75rem', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}
              onClick={() => setMessages([{
                id: 'clear',
                role: 'ai',
                content: 'Conversation cleared. How can I assist you today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }])}>
              <RotateCcw size={12} /> Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', gap: 10,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {/* Avatar */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'ai'
                  ? 'linear-gradient(135deg, var(--blue), #7C3AED)'
                  : 'linear-gradient(135deg, #7C3AED, #EC4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                fontWeight: 700, color: 'white',
              }}>
                {msg.role === 'ai' ? <Scale size={13} /> : 'G'}
              </div>

              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Bubble */}
                <div className={msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}
                  style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
                    {msg.content}
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 6,
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>
                      {msg.timestamp}
                    </div>
                    {msg.role === 'ai' && (
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        disabled={loadingSpeechId === msg.id}
                        title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 2, display: 'flex', alignItems: 'center',
                          color: speakingId === msg.id ? 'var(--blue)' : 'var(--text-muted)',
                          opacity: loadingSpeechId === msg.id ? 0.5 : 0.75,
                        }}>
                        {loadingSpeechId === msg.id ? (
                          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : speakingId === msg.id ? (
                          <Square size={11} fill="currentColor" />
                        ) : (
                          <Volume2 size={13} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI metadata card */}
                {msg.role === 'ai' && msg.metadata && (
                  <div className="card" style={{ padding: 20 }}>
                    {/* Case type */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Scale size={16} style={{ color: 'var(--blue)' }} />
                      <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '0.9rem' }}>
                        {msg.metadata.caseType}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="metadata-grid">
                      {/* Relevant Laws */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                          📚 Relevant Laws
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {msg.metadata.laws?.map(l => (
                            <li key={l} style={{ fontSize: '0.78rem', color: 'var(--text)', padding: '5px 8px', borderRadius: 6, background: 'var(--blue-subtle)', border: '1px solid var(--blue-light)' }}>
                              {l}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommended Actions */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                          ⚡ Recommended Actions
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {msg.metadata.actions?.map((a, i) => (
                            <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                              <span style={{ color: 'var(--emerald)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Documents Required */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                          📄 Documents Required
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {msg.metadata.documents?.map(d => (
                            <li key={d} style={{ fontSize: '0.78rem', color: 'var(--text)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                              <FileText size={12} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Timeline */}
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                          🕐 Estimated Timeline
                        </div>
                        <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.8rem', color: 'var(--text)' }}>
                          <Clock size={13} style={{ color: '#F59E0B', marginRight: 6, verticalAlign: 'middle' }} />
                          {msg.metadata.timeline}
                        </div>

                        <Link to="/dashboard/advocates" className="btn-primary"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            marginTop: 12, padding: '10px', borderRadius: 8, textDecoration: 'none',
                            fontWeight: 600, fontSize: '0.8rem',
                          }}>
                          <Users size={14} />
                          Find an Advocate <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

         {/* Agent Status */}
{loading && (
  <div
    className="chat-bubble-ai"
    style={{
      padding: "16px",
      borderRadius: 12,
      background: "var(--bg-secondary)",
      border: "1px solid var(--border)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#22c55e",
          animation: "pulse 1s infinite",
        }}
      />
      <strong>NyayaAI Agent Network Working...</strong>
    </div>

    <div
      style={{
        color: "#60a5fa",
        fontWeight: 600,
        marginBottom: 10,
      }}
    >
      {agentStep}
    </div>

    <div
      style={{
        display: "flex",
        gap: 5,
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#3b82f6",
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  </div>
)}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestedPrompts.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                style={{
                  padding: '7px 12px', borderRadius: 8, fontSize: '0.775rem', fontWeight: 500,
                  border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.borderColor = 'var(--blue)'
                  ;(e.target as HTMLElement).style.color = 'var(--blue)'
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.target as HTMLElement).style.color = 'var(--text-muted)'
                }}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* File upload indicator */}
        {fileUploaded && (
          <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              padding: '6px 12px', borderRadius: 8, background: 'var(--emerald-subtle)',
              border: '1px solid var(--emerald-light)', display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.78rem', color: 'var(--emerald)',
            }}>
              <FileText size={13} /> {fileUploaded}
              <button onClick={() => setFileUploaded(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--emerald)', padding: 0, display: 'flex' }}>
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '8px 8px 8px 14px',
            transition: 'border-color 0.15s',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Describe your legal issue... (Press Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                resize: 'none', fontSize: '0.875rem', color: 'var(--text)',
                lineHeight: 1.6, maxHeight: 120, overflowY: 'auto',
                fontFamily: 'inherit', paddingTop: 4,
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <input ref={fileRef} type="file" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && setFileUploaded(e.target.files[0].name)} />
              <button onClick={() => fileRef.current?.click()}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} title="Upload document">
                <Paperclip size={15} />
              </button>
              <button
                onClick={handleMicClick}
                disabled={transcribing}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: isRecording ? '1px solid #EF4444' : '1px solid var(--border)',
                  background: isRecording ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
                  cursor: transcribing ? 'default' : 'pointer',
                  color: isRecording ? '#EF4444' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: transcribing ? 0.6 : 1,
                }}
                title={isRecording ? 'Stop recording' : 'Voice input'}>
                {transcribing ? (
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                ) : isRecording ? (
                  <Square size={13} fill="currentColor" />
                ) : (
                  <Mic size={15} />
                )}
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="btn-primary"
                style={{
                  width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: (!input.trim() || loading) ? 0.5 : 1,
                }}>
                <Send size={15} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
            <Sparkles size={11} style={{ color: 'var(--text-subtle)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
              NyayaAI can make mistakes. For critical decisions, consult a verified advocate.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
         0% {
         opacity: 0.4;
         transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
      `}</style>
    </div>
  )
}
