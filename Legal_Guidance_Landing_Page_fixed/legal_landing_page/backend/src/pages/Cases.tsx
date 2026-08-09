import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Search, FolderOpen } from 'lucide-react'

const allCases = [
  { id: 'NYC-2026-0842', title: 'Security Deposit Dispute', type: 'Property Law', status: 'Active', progress: 65, updated: '2 hours ago' },
  { id: 'NYC-2026-0671', title: 'Wrongful Dismissal Claim', type: 'Employment', status: 'Pending', progress: 30, updated: '1 day ago' },
  { id: 'NYC-2026-0390', title: 'E-commerce Fraud Complaint', type: 'Consumer', status: 'Resolved', progress: 100, updated: '1 week ago' },
  { id: 'NYC-2026-0255', title: 'Property Boundary Dispute with Neighbor', type: 'Property Law', status: 'Active', progress: 40, updated: '2 days ago' },
  { id: 'NYC-2025-1188', title: 'RTI Application — Municipal Records', type: 'Administrative', status: 'Resolved', progress: 100, updated: '3 months ago' },
]

const statusColor: Record<string, { c: string; bg: string }> = {
  Active: { c: 'var(--blue)', bg: 'var(--blue-subtle)' },
  Pending: { c: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  Resolved: { c: 'var(--emerald)', bg: 'var(--emerald-subtle)' },
}

export default function Cases() {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Pending' | 'Resolved'>('All')
  const [search, setSearch] = useState('')

  const filtered = allCases.filter(c =>
    (filter === 'All' || c.status === filter) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>My Cases</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 2 }}>{allCases.length} cases tracked · {allCases.filter(c => c.status === 'Active').length} active</p>
        </div>
        <Link to="/dashboard/ai-assistant" className="btn-primary"
          style={{ padding: '9px 16px', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={15} /> Start New Case
        </Link>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['All', 'Active', 'Pending', 'Resolved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 13px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              border: '1px solid var(--border)',
              background: filter === f ? 'var(--blue)' : 'var(--bg-secondary)',
              color: filter === f ? 'white' : 'var(--text-muted)',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(c => {
          const sc = statusColor[c.status]
          return (
            <div key={c.id} className="card card-interactive" style={{ padding: 18, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{c.id} · {c.type} · Updated {c.updated}</div>
                </div>
                <span className="badge" style={{ background: sc.bg, color: sc.c }}>{c.status}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.progress}%`, borderRadius: 3, background: sc.c, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: 4 }}>{c.progress}% complete</div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FolderOpen size={32} style={{ color: 'var(--text-subtle)', marginBottom: 10 }} />
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>No cases found</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try a different filter or search term</div>
          </div>
        )}
      </div>
    </div>
  )
}
