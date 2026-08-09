import { useState } from 'react'
import { Link } from 'react-router'
import {
  Calendar, Users, DollarSign, TrendingUp, Clock, Star, ChevronRight,
  CheckCircle, AlertCircle, ArrowRight, BookOpen, FileText, Zap,
} from 'lucide-react'

const appointments = [
  { name: 'Gaurav Mehta', initials: 'GM', type: 'Property Dispute', time: '10 Aug, 3:00 PM', mode: 'Video', fee: 1500, status: 'confirmed', color: '#2563EB' },
  { name: 'Sneha Patel', initials: 'SP', type: 'Consumer Complaint', time: '11 Aug, 11:00 AM', mode: 'In-Person', fee: 1500, status: 'confirmed', color: '#7C3AED' },
  { name: 'Rajan Gupta', initials: 'RG', type: 'Labour Dispute', time: '12 Aug, 2:00 PM', mode: 'Video', fee: 1500, status: 'pending', color: '#F59E0B' },
  { name: 'Meera Iyer', initials: 'MI', type: 'Divorce Mediation', time: '14 Aug, 4:00 PM', mode: 'In-Person', fee: 1500, status: 'confirmed', color: '#059669' },
]

const recentClients = [
  { name: 'Gaurav Mehta', initials: 'GM', case: 'Property Boundary Dispute', status: 'Active', lastContact: '2 days ago', color: '#2563EB' },
  { name: 'Arjun Sharma', initials: 'AS', case: 'Wrongful Termination', status: 'In Progress', lastContact: '4 days ago', color: '#7C3AED' },
  { name: 'Rekha Verma', initials: 'RV', case: 'Child Custody', status: 'Resolved', lastContact: '1 week ago', color: '#059669' },
  { name: 'Vikram Singh', initials: 'VS', case: 'Criminal Bail Application', status: 'Active', lastContact: '1 day ago', color: '#EF4444' },
]

const pendingRequestsSeed = [
  { id: '1', name: 'Priya Nair', type: 'Property Law', message: 'Need help with landlord eviction notice received yesterday...', time: '2 hours ago' },
  { id: '2', name: 'Karan Shah', type: 'Employment Law', message: 'Terminated without cause after 8 years. Seeking advice on severance...', time: '5 hours ago' },
  { id: '3', name: 'Anjali Roy', type: 'Family Law', message: 'Going through divorce proceedings. Need representation in Kolkata HC...', time: '1 day ago' },
]

const monthlyRevenue = [
  { month: 'Feb', amount: 42000, cases: 14 },
  { month: 'Mar', amount: 38000, cases: 12 },
  { month: 'Apr', amount: 55000, cases: 18 },
  { month: 'May', amount: 49000, cases: 16 },
  { month: 'Jun', amount: 62000, cases: 21 },
  { month: 'Jul', amount: 58000, cases: 19 },
]
const maxRevenue = Math.max(...monthlyRevenue.map(m => m.amount))

export default function AdvocateDashboard() {
  const [pendingRequests, setPendingRequests] = useState(pendingRequestsSeed)
  const [toast, setToast] = useState<string | null>(null)

  const respond = (id: string, name: string, accepted: boolean) => {
    setPendingRequests(prev => prev.filter(r => r.id !== id))
    setToast(accepted ? `Accepted request from ${name}` : `Declined request from ${name}`)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="page-enter">
      {/* Welcome banner */}
      <div style={{
        borderRadius: 'var(--radius)', padding: '24px 28px',
        background: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #065F46 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4, fontWeight: 500 }}>Good morning 🌟</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 4 }}>
                Adv. Priya Sharma
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
                  ✓ Bar Council Verified
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Delhi HC · Property & Employment Law</span>
              </div>
            </div>
            <Link to="/advocate/ai-research" style={{
              padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)', color: 'white', textDecoration: 'none',
              fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <BookOpen size={15} /> AI Research Assistant
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { val: '4', lbl: 'Appointments Today' },
              { val: '23', lbl: 'Active Clients' },
              { val: '₹58K', lbl: 'This Month' },
              { val: '4.9⭐', lbl: 'Rating' },
            ].map(s => (
              <div key={s.lbl} style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{s.val}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="stats-row">
        {[
          { icon: Calendar, val: '4', lbl: "Today's Appointments", change: '+1', color: 'var(--blue)' },
          { icon: Users, val: '23', lbl: 'Active Clients', change: '+3', color: '#7C3AED' },
          { icon: DollarSign, val: '₹58,000', lbl: 'July Revenue', change: '+12%', color: 'var(--emerald)' },
          { icon: Star, val: '4.9', lbl: 'Average Rating', change: '218 reviews', color: '#F59E0B' },
        ].map(s => (
          <div key={s.lbl} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--emerald)' }}>{s.change}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="main-grid">
        {/* Upcoming appointments */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Upcoming Appointments</h2>
            <Link to="/advocate/appointments" style={{ fontSize: '0.78rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: 12, borderRadius: 10, background: 'var(--bg-secondary)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}>
                <div className="avatar" style={{ width: 38, height: 38, fontSize: '0.78rem', background: `linear-gradient(135deg, ${a.color}, ${a.color}88)` }}>
                  {a.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.85rem' }}>{a.name}</div>
                    <span className="badge" style={{
                      background: a.status === 'confirmed' ? 'var(--emerald-subtle)' : 'rgba(245,158,11,0.1)',
                      color: a.status === 'confirmed' ? 'var(--emerald)' : '#F59E0B',
                    }}>
                      {a.status === 'confirmed' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                      {a.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.type}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <Clock size={11} /> {a.time}
                    </span>
                    <span style={{
                      padding: '1px 7px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600,
                      background: a.mode === 'Video' ? 'var(--blue-subtle)' : 'var(--bg-secondary)',
                      color: a.mode === 'Video' ? 'var(--blue)' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}>{a.mode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Revenue Overview</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['6M', '1Y'].map(p => (
                <button key={p} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                  border: '1px solid var(--border)', background: p === '6M' ? 'var(--blue-subtle)' : 'var(--bg-secondary)',
                  color: p === '6M' ? 'var(--blue)' : 'var(--text-muted)', cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>
          </div>
          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, marginBottom: 12 }}>
            {monthlyRevenue.map(m => {
              const h = (m.amount / maxRevenue) * 120
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {m.cases}
                  </div>
                  <div
                    title={`₹${m.amount.toLocaleString()}`}
                    style={{
                      width: '100%', height: h, borderRadius: '4px 4px 0 0',
                      background: m.month === 'Jun' ? 'linear-gradient(180deg, var(--emerald), var(--emerald-dark))' : 'var(--blue-subtle)',
                      border: `1px solid ${m.month === 'Jun' ? 'var(--emerald-light)' : 'var(--border)'}`,
                      transition: 'height 0.5s ease', cursor: 'pointer',
                    }} />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>{m.month}</div>
                </div>
              )
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>₹3,04,000</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total (Feb–Jul 2026)</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                <TrendingUp size={14} style={{ color: 'var(--emerald)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald)' }}>+18.4%</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vs last 6 months</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Research Widget + Pending Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="main-grid">
        {/* AI Research widget */}
        <div className="card" style={{ padding: 22, background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(124,58,237,0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--blue), #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={17} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>AI Legal Research</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Case analysis & judgment finder</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { icon: FileText, label: 'Analyze Case File', color: 'var(--blue)' },
              { icon: FileText, label: 'Summary from FIR', color: '#7C3AED' },
              { icon: Zap, label: 'Similar Judgments', color: 'var(--emerald)' },
              { icon: FileText, label: 'Draft Arguments', color: '#F59E0B' },
            ].map(item => (
              <Link key={item.label} to="/advocate/ai-research" style={{
                padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem',
                fontWeight: 500, color: 'var(--text)', transition: 'all 0.15s', textDecoration: 'none',
              }}>
                <item.icon size={14} style={{ color: item.color, flexShrink: 0 }} />
                {item.label}
              </Link>
            ))}
          </div>

          <Link to="/advocate/ai-research" className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 9, textDecoration: 'none',
              fontWeight: 600, fontSize: '0.85rem',
            }}>
            Open AI Research Assistant <ChevronRight size={14} />
          </Link>
        </div>

        {/* Pending requests */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
              Pending Requests
              <span style={{
                marginLeft: 8, padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem',
                fontWeight: 700, background: 'var(--blue-subtle)', color: 'var(--blue)',
              }}>{pendingRequests.length}</span>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingRequests.map(r => (
              <div key={r.id} style={{ padding: 14, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.85rem' }}>{r.name}</div>
                  <span className="badge" style={{ background: 'var(--blue-subtle)', color: 'var(--blue)' }}>{r.type}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 10px' }}>"{r.message}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{r.time}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => respond(r.id, r.name, false)} style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                      border: '1px solid var(--border)', background: 'var(--bg-card)',
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}>Decline</button>
                    <button onClick={() => respond(r.id, r.name, true)} className="btn-emerald" style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                      border: 'none', cursor: 'pointer',
                    }}>Accept</button>
                  </div>
                </div>
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No pending requests right now.
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, background: 'var(--emerald-subtle)',
          border: '1px solid var(--emerald-light)', color: 'var(--emerald)', fontSize: '0.82rem', fontWeight: 500,
        }}>
          {toast}
        </div>
      )}

      {/* Recent Clients */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>Recent Clients</h2>
          <Link to="/advocate/clients" style={{ fontSize: '0.78rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="clients-grid">
          {recentClients.map(c => (
            <div key={c.name} style={{ padding: 14, borderRadius: 10, background: 'var(--bg-secondary)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.78rem', background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }}>
                  {c.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.82rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.lastContact}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{c.case}</div>
              <span className="badge" style={{
                background: c.status === 'Active' ? 'var(--blue-subtle)' : c.status === 'Resolved' ? 'var(--emerald-subtle)' : 'rgba(245,158,11,0.1)',
                color: c.status === 'Active' ? 'var(--blue)' : c.status === 'Resolved' ? 'var(--emerald)' : '#F59E0B',
              }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .main-grid { grid-template-columns: 1fr !important; }
          .clients-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .stats-row { grid-template-columns: 1fr 1fr !important; }
          .clients-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
