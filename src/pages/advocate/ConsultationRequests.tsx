import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default function ConsultationRequests() {
  return (
    <div
      className="page-enter"
      style={{
        paddingBottom: 40,
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: '1.7rem',
            fontWeight: 800,
            color: 'var(--text)',
            margin: 0,
            marginBottom: 6,
          }}
        >
          Consultation Requests
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            margin: 0,
            fontSize: '0.9rem',
          }}
        >
          Review and manage consultation requests from potential clients.
        </p>
      </div>

      {/* Status summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
        className="consultation-request-stats"
      >
        <div
          className="card"
          style={{
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(212, 175, 55, 0.10)',
              border: '1px solid rgba(212, 175, 55, 0.20)',
            }}
          >
            <Clock size={20} color="#D4AF37" />
          </div>

          <div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--text)',
              }}
            >
              0
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Pending
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(34, 197, 94, 0.10)',
              border: '1px solid rgba(34, 197, 94, 0.20)',
            }}
          >
            <CheckCircle2 size={20} color="#22C55E" />
          </div>

          <div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--text)',
              }}
            >
              0
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Accepted
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(239, 68, 68, 0.10)',
              border: '1px solid rgba(239, 68, 68, 0.20)',
            }}
          >
            <XCircle size={20} color="#EF4444" />
          </div>

          <div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'var(--text)',
              }}
            >
              0
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Declined
            </div>
          </div>
        </div>
      </div>

      {/* Requests area */}
      <div
        className="card"
        style={{
          minHeight: 390,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 480,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              margin: '0 auto 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(212, 175, 55, 0.10)',
              border: '1px solid rgba(212, 175, 55, 0.20)',
            }}
          >
            <ClipboardList
              size={32}
              color="#D4AF37"
            />
          </div>

          <h2
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text)',
            }}
          >
            No consultation requests yet
          </h2>

          <p
            style={{
              margin: 0,
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              lineHeight: 1.6,
            }}
          >
            New consultation and booking requests will appear here
            when clients contact you for a consultation.
          </p>
        </div>
      </div>

      {/* Future workflow */}
      <div
        className="card"
        style={{
          marginTop: 18,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 12,
          }}
        >
          Request workflow
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
          }}
        >
          <span>Client sends request</span>
          <span>→</span>
          <span>Advocate reviews</span>
          <span>→</span>
          <span>Accept / Decline</span>
          <span>→</span>
          <span>Consultation</span>
        </div>
      </div>
    </div>
  )
}