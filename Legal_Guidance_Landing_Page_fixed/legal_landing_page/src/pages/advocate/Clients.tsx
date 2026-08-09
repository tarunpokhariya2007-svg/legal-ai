import { useState } from 'react'
import { Search, MessageSquare, Calendar } from 'lucide-react'

const clients = [
  { name: 'Gaurav Mehta', initials: 'GM', case: 'Property Boundary Dispute', status: 'Active', lastContact: '2 days ago', color: '#2563EB' },
  { name: 'Arjun Sharma', initials: 'AS', case: 'Wrongful Termination', status: 'In Progress', lastContact: '4 days ago', color: '#7C3AED' },
  { name: 'Rekha Verma', initials: 'RV', case: 'Child Custody', status: 'Resolved', lastContact: '1 week ago', color: '#059669' },
  { name: 'Vikram Singh', initials: 'VS', case: 'Criminal Bail Application', status: 'Active', lastContact: '1 day ago', color: '#EF4444' },
  { name: 'Sneha Patel', initials: 'SP', case: 'Consumer Complaint — Online Fraud', status: 'In Progress', lastContact: '3 days ago', color: '#F59E0B' },
  { name: 'Priya Nair', initials: 'PN', case: 'Landlord Eviction Notice', status: 'Active', lastContact: '2 hours ago', color: '#06B6D4' },
]

const statusColor: Record<string, { c: string; bg: string }> = {
  Active: { c: 'var(--blue)', bg: 'var(--blue-subtle)' },
  'In Progress': { c: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  Resolved: { c: 'var(--emerald)', bg: 'var(--emerald-subtle)' },
}

export default function Clients() {
  const [search, setSearch] = useState('')
  const filtered = clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.case.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Clients</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 2 }}>{clients.length} total clients</p>
      </div>

      <div style={{ position: 'relative', maxWidth: 340, marginBottom: 20 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" placeholder="Search clients or cases..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="clients-full-grid">
        {filtered.map(c => {
          const sc = statusColor[c.status]
          return (
            <div key={c.name} className="card card-interactive" style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div className="avatar" style={{ width: 42, height: 42, fontSize: '0.85rem', background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }}>
                  {c.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{c.lastContact}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>{c.case}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge" style={{ background: sc.bg, color: sc.c }}>{c.status}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button title="Message" style={{
                    width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><MessageSquare size={13} /></button>
                  <button title="Schedule" style={{
                    width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Calendar size={13} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 900px) { .clients-full-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .clients-full-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
