import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Star,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const API_URL = 'https://legal-ai-z7vb.onrender.com'

const timeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
]

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function Booking() {
  const navigate = useNavigate()

  // =====================================================
  // SELECTED ADVOCATE ID
  // =====================================================

  const advocateId = new URLSearchParams(
    window.location.search
  ).get('advocateId')

  // =====================================================
  // DATE / BOOKING STATE
  // =====================================================

  const today = new Date()

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] =
    useState<number | null>(null)
  const [selectedTime, setSelectedTime] =
    useState<string | null>(null)

  const [mode, setMode] =
    useState<'video' | 'inperson'>('video')

  const [booked, setBooked] = useState(false)

  // =====================================================
  // BOOKING LOADING STATE
  // =====================================================

  const [bookingLoading, setBookingLoading] =
    useState(false)

  // =====================================================
  // SELECTED ADVOCATE
  // =====================================================

  const [advocate, setAdvocate] =
    useState<any>(null)

  const [loadingAdvocate, setLoadingAdvocate] =
    useState(true)

  // =====================================================
  // LOAD SELECTED ADVOCATE
  // =====================================================

  useEffect(() => {
    if (!advocateId) {
      setLoadingAdvocate(false)
      return
    }

    const loadAdvocate = async () => {
      try {
        setLoadingAdvocate(true)

        const response = await fetch(
          `${API_URL}/api/lawyers`
        )

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status}`
          )
        }

        const data = await response.json()

        if (
          data.success &&
          Array.isArray(data.lawyers)
        ) {
          const selectedAdvocate =
            data.lawyers.find(
              (lawyer: any) =>
                String(lawyer.id) ===
                String(advocateId)
            )

          if (selectedAdvocate) {
            setAdvocate(selectedAdvocate)
          } else {
            console.error(
              'Selected advocate not found:',
              advocateId
            )
          }
        }
      } catch (error) {
        console.error(
          'Failed to load selected advocate:',
          error
        )
      } finally {
        setLoadingAdvocate(false)
      }
    }

    loadAdvocate()
  }, [advocateId])

  // =====================================================
  // ADVOCATE DISPLAY DATA
  // =====================================================

  const advocateName =
    advocate?.full_name || 'Advocate'

  const advocateInitials =
    advocateName
      .split(' ')
      .filter(Boolean)
      .map(
        (name: string) =>
          name[0]
      )
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'AD'

  const advocateEmail =
    advocate?.email || ''

  const advocatePhone =
    advocate?.phone || ''

  const advocateSpecialization =
    advocate?.specialization ||
    advocate?.specializations?.[0] ||
    'General Practice'

  const advocateCity =
    advocate?.city ||
    'India'

  const advocateCourt =
    advocate?.court ||
    'High Court'

  // =====================================================
  // FEES
  // =====================================================

  const consultationFee =
    Number(advocate?.fee) > 0
      ? Number(advocate.fee)
      : 1500

  const platformFee =
    Math.round(
      consultationFee * 0.05
    )

  const totalFee =
    consultationFee + platformFee

  // =====================================================
  // CALENDAR
  // =====================================================

  const daysInMonth =
    getDaysInMonth(
      year,
      month
    )

  const firstDay =
    getFirstDay(
      year,
      month
    )

  const unavailableDays = [
    3,
    7,
    14,
    21,
    28
  ]

  // =====================================================
  // PREVIOUS MONTH
  // =====================================================

  const prevMonth = () => {
    if (month === 0) {
      setYear(
        y => y - 1
      )

      setMonth(11)
    } else {
      setMonth(
        m => m - 1
      )
    }

    setSelectedDay(null)
    setSelectedTime(null)
  }

  // =====================================================
  // NEXT MONTH
  // =====================================================

  const nextMonth = () => {
    if (month === 11) {
      setYear(
        y => y + 1
      )

      setMonth(0)
    } else {
      setMonth(
        m => m + 1
      )
    }

    setSelectedDay(null)
    setSelectedTime(null)
  }

  // =====================================================
  // CREATE APPOINTMENT
  // =====================================================

  const handleBooking = async () => {
    if (
      !selectedDay ||
      !selectedTime ||
      !advocateId
    ) {
      return
    }

    try {
      setBookingLoading(true)

      // -------------------------------------------------
      // AUTH TOKEN
      // -------------------------------------------------

      const token =
        localStorage.getItem('token')

      if (!token) {
        alert(
          'Please login before booking an appointment.'
        )

        return
      }

      // -------------------------------------------------
      // FORMAT DATE
      // -------------------------------------------------

      const appointmentDate = [
        year,
        String(month + 1).padStart(2, '0'),
        String(selectedDay).padStart(2, '0')
      ].join('-')

      // -------------------------------------------------
      // SEND BOOKING TO BACKEND
      // -------------------------------------------------

      const response = await fetch(
        `${API_URL}/api/appointments`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            advocateId:
              Number(advocateId),

            appointmentDate,

            appointmentTime:
              selectedTime,

            mode,

            consultationFee,

            platformFee,

            totalFee
          })
        }
      )

      const data =
        await response.json()

      // -------------------------------------------------
      // HANDLE ERROR
      // -------------------------------------------------

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
          'Failed to book appointment.'
        )
      }

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      console.log(
        'APPOINTMENT CREATED:',
        data.appointment
      )

      setBooked(true)

    } catch (error: any) {

      console.error(
        'BOOKING ERROR:',
        error
      )

      alert(
        error?.message ||
        'Failed to book appointment. Please try again.'
      )

    } finally {
      setBookingLoading(false)
    }
  }

  // =====================================================
  // BOOKING CONFIRMATION
  // =====================================================

  if (booked) {
    return (
      <div
        className="page-enter"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400
        }}
      >
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: 'center',
            maxWidth: 440
          }}
        >

          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background:
                'var(--emerald-subtle)',
              border:
                '2px solid var(--emerald-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin:
                '0 auto 20px'
            }}
          >
            <CheckCircle
              size={34}
              style={{
                color:
                  'var(--emerald)'
              }}
            />
          </div>

          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 8
            }}
          >
            Consultation Booked!
          </h2>

          <p
            style={{
              color:
                'var(--text-muted)',
              marginBottom: 20,
              lineHeight: 1.6
            }}
          >
            Your appointment with{' '}
            <strong>
              Adv. {advocateName}
            </strong>{' '}
            has been confirmed.
          </p>

          <div
            style={{
              padding:
                '14px 18px',
              borderRadius: 10,
              background:
                'var(--bg-secondary)',
              marginBottom: 24,
              textAlign: 'left'
            }}
          >
            {[
              [
                'Advocate',
                `Adv. ${advocateName}`
              ],

              [
                'Date',
                `${selectedDay} ${months[month]} ${year}`
              ],

              [
                'Time',
                selectedTime || ''
              ],

              [
                'Mode',
                mode === 'video'
                  ? 'Video Call'
                  : 'In-Person'
              ],

              [
                'Fee',
                `₹${totalFee.toLocaleString()} (paid)`
              ]

            ].map(
              ([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    padding: '4px 0',
                    fontSize:
                      '0.875rem'
                  }}
                >
                  <span
                    style={{
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    {k}
                  </span>

                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        'var(--text)',
                      textAlign:
                        'right'
                    }}
                  >
                    {v}
                  </span>
                </div>
              )
            )}
          </div>

          <button
            onClick={() =>
              navigate('/dashboard')
            }
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Go to Dashboard
          </button>

        </div>
      </div>
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingAdvocate) {
    return (
      <div
        className="page-enter"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color:
              'var(--text-muted)'
          }}
        >
          <div
            style={{
              marginBottom: 10
            }}
          >
            Loading advocate details...
          </div>

          <div
            style={{
              fontSize: '0.8rem'
            }}
          >
            Please wait
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // MAIN BOOKING PAGE
  // =====================================================

  return (
    <div className="page-enter">

      {/* Header */}

      <div
        style={{
          marginBottom: 24
        }}
      >
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: 4
          }}
        >
          Book Consultation
        </h1>

        <p
          style={{
            color:
              'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: 24
          }}
        >
          Choose your preferred date,
          time, and consultation mode.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 340px',
          gap: 20
        }}
        className="booking-grid"
      >

        {/* =================================================
            LEFT: CALENDAR + TIME + MODE
        ================================================= */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >

          {/* Calendar */}

          <div
            className="card"
            style={{
              padding: 24
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                marginBottom: 20
              }}
            >

              <button
                onClick={prevMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border:
                    '1px solid var(--border)',
                  background:
                    'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  color:
                    'var(--text-muted)'
                }}
              >
                <ChevronLeft
                  size={16}
                />
              </button>

              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontSize: '0.95rem'
                }}
              >
                {months[month]} {year}
              </span>

              <button
                onClick={nextMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border:
                    '1px solid var(--border)',
                  background:
                    'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  color:
                    'var(--text-muted)'
                }}
              >
                <ChevronRight
                  size={16}
                />
              </button>

            </div>

            {/* Weekdays */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(7, 1fr)',
                gap: 2,
                marginBottom: 8
              }}
            >
              {[
                'Su',
                'Mo',
                'Tu',
                'We',
                'Th',
                'Fr',
                'Sa'
              ].map(d => (
                <div
                  key={d}
                  style={{
                    textAlign: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color:
                      'var(--text-muted)',
                    padding: '4px 0'
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(7, 1fr)',
                gap: 2
              }}
            >

              {Array.from({
                length: firstDay
              }).map((_, i) => (
                <div
                  key={`e${i}`}
                />
              ))}

              {Array.from({
                length: daysInMonth
              }).map((_, i) => {

                const day =
                  i + 1

                const isToday =
                  year ===
                    today.getFullYear() &&
                  month ===
                    today.getMonth() &&
                  day ===
                    today.getDate()

                const isPast =
                  new Date(
                    year,
                    month,
                    day
                  ) <
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                  )

                const isUnavail =
                  unavailableDays.includes(
                    day
                  )

                const isSelected =
                  selectedDay === day

                return (
                  <button
                    key={day}
                    onClick={() => {

                      if (
                        !isPast &&
                        !isUnavail
                      ) {
                        setSelectedDay(
                          day
                        )

                        setSelectedTime(
                          null
                        )
                      }

                    }}
                    disabled={
                      isPast ||
                      isUnavail
                    }
                    style={{
                      height: 36,
                      borderRadius: 8,
                      border: 'none',
                      cursor:
                        isPast ||
                        isUnavail
                          ? 'default'
                          : 'pointer',
                      fontSize:
                        '0.82rem',
                      fontWeight:
                        isSelected
                          ? 700
                          : 400,
                      background:
                        isSelected
                          ? 'var(--blue)'
                          : isToday
                          ? 'var(--blue-subtle)'
                          : 'transparent',
                      color:
                        isSelected
                          ? 'white'
                          : isPast
                          ? 'var(--text-subtle)'
                          : isUnavail
                          ? 'var(--border)'
                          : isToday
                          ? 'var(--blue)'
                          : 'var(--text)',
                      transition:
                        'all 0.15s',
                      textDecoration:
                        isUnavail
                          ? 'line-through'
                          : 'none'
                    }}
                  >
                    {day}
                  </button>
                )
              })}

            </div>

            {/* Legend */}

            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 12,
                paddingTop: 12,
                borderTop:
                  '1px solid var(--border)'
              }}
            >

              {[
                [
                  'var(--blue)',
                  'Selected'
                ],
                [
                  'var(--blue-subtle)',
                  'Today'
                ],
                [
                  'var(--border)',
                  'Unavailable'
                ]
              ].map(
                ([c, l]) => (
                  <div
                    key={l}
                    style={{
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 5
                    }}
                  >

                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: c
                      }}
                    />

                    <span
                      style={{
                        fontSize:
                          '0.7rem',
                        color:
                          'var(--text-muted)'
                      }}
                    >
                      {l}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>

          {/* Time Slots */}

          {selectedDay && (
            <div
              className="card"
              style={{
                padding: 20
              }}
            >

              <h3
                style={{
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  marginBottom: 14
                }}
              >

                <Clock
                  size={15}
                  style={{
                    marginRight: 6,
                    verticalAlign:
                      'middle',
                    color:
                      'var(--blue)'
                  }}
                />

                Available Time Slots —{' '}
                {selectedDay}{' '}
                {months[month]}

              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(4, 1fr)',
                  gap: 8
                }}
              >

                {timeSlots.map(t => {

                  const slotBooked =
                    [
                      '11:00 AM',
                      '2:00 PM'
                    ].includes(t)

                  const selected =
                    selectedTime === t

                  return (
                    <button
                      key={t}
                      onClick={() =>
                        !slotBooked &&
                        setSelectedTime(
                          t
                        )
                      }
                      disabled={
                        slotBooked
                      }
                      style={{
                        padding: '9px',
                        borderRadius: 8,
                        fontSize:
                          '0.8rem',
                        fontWeight: 600,
                        cursor:
                          slotBooked
                            ? 'default'
                            : 'pointer',
                        border:
                          `1px solid ${
                            selected
                              ? 'var(--blue)'
                              : 'var(--border)'
                          }`,
                        background:
                          selected
                            ? 'var(--blue)'
                            : slotBooked
                            ? 'var(--bg-secondary)'
                            : 'var(--bg-card)',
                        color:
                          selected
                            ? 'white'
                            : slotBooked
                            ? 'var(--text-subtle)'
                            : 'var(--text)',
                        textDecoration:
                          slotBooked
                            ? 'line-through'
                            : 'none'
                      }}
                    >
                      {t}
                    </button>
                  )
                })}

              </div>

            </div>
          )}

          {/* Consultation Mode */}

          <div
            className="card"
            style={{
              padding: 20
            }}
          >

            <h3
              style={{
                fontWeight: 700,
                color: 'var(--text)',
                fontSize: '0.9rem',
                marginBottom: 14
              }}
            >
              Consultation Mode
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 10
              }}
            >

              {[
                {
                  id: 'video' as const,
                  icon: Video,
                  label: 'Video Call',
                  sub: 'Google Meet / Zoom'
                },
                {
                  id: 'inperson' as const,
                  icon: MapPin,
                  label: 'In-Person',
                  sub: 'Delhi HC Chamber'
                }
              ].map(m => (

                <button
                  key={m.id}
                  onClick={() =>
                    setMode(m.id)
                  }
                  style={{
                    padding: '14px',
                    borderRadius: 10,
                    border:
                      `1.5px solid ${
                        mode === m.id
                          ? 'var(--blue)'
                          : 'var(--border)'
                      }`,
                    background:
                      mode === m.id
                        ? 'var(--blue-subtle)'
                        : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition:
                      'all 0.15s'
                  }}
                >

                  <m.icon
                    size={18}
                    style={{
                      color:
                        mode === m.id
                          ? 'var(--blue)'
                          : 'var(--text-muted)',
                      marginBottom: 6
                    }}
                  />

                  <div
                    style={{
                      fontWeight: 600,
                      color:
                        mode === m.id
                          ? 'var(--blue)'
                          : 'var(--text)',
                      fontSize:
                        '0.875rem'
                    }}
                  >
                    {m.label}
                  </div>

                  <div
                    style={{
                      fontSize:
                        '0.72rem',
                      color:
                        'var(--text-muted)',
                      marginTop: 2
                    }}
                  >
                    {m.sub}
                  </div>

                </button>

              ))}

            </div>
          </div>

        </div>

        {/* =================================================
            RIGHT: ADVOCATE + PAYMENT
        ================================================= */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >

          {/* Advocate Profile */}

          <div
            className="card"
            style={{
              padding: 22
            }}
          >

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 16
              }}
            >

              <div
                className="avatar"
                style={{
                  width: 52,
                  height: 52,
                  fontSize: '1rem'
                }}
              >
                {advocateInitials}
              </div>

              <div>

                <div
                  style={{
                    fontWeight: 700,
                    color: 'var(--text)',
                    fontSize: '0.95rem'
                  }}
                >
                  Adv. {advocateName}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginTop: 3
                  }}
                >

                  <Award
                    size={11}
                    style={{
                      color:
                        'var(--emerald)'
                    }}
                  />

                  <span
                    style={{
                      fontSize:
                        '0.7rem',
                      color:
                        'var(--emerald)',
                      fontWeight: 600
                    }}
                  >
                    Registered Advocate
                  </span>

                </div>

              </div>

            </div>

            <div
              style={{
                fontSize: '0.8rem',
                color:
                  'var(--text-muted)',
                marginBottom: 14
              }}
            >
              {advocateSpecialization} ·{' '}
              {advocateCity}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 14
              }}
            >

              <div
                style={{
                  textAlign: 'center',
                  flex: 1
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    gap: 3
                  }}
                >

                  <Star
                    size={12}
                    style={{
                      color:
                        '#F59E0B'
                    }}
                    fill="#F59E0B"
                  />

                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        'var(--text)',
                      fontSize:
                        '0.875rem'
                    }}
                  >
                    New
                  </span>

                </div>

                <div
                  style={{
                    fontSize:
                      '0.65rem',
                    color:
                      'var(--text-muted)'
                  }}
                >
                  No reviews
                </div>

              </div>

              <div
                style={{
                  width: 1,
                  background:
                    'var(--border)'
                }}
              />

              <div
                style={{
                  textAlign: 'center',
                  flex: 1
                }}
              >

                <div
                  style={{
                    fontWeight: 700,
                    color:
                      'var(--text)',
                    fontSize:
                      '0.875rem'
                  }}
                >
                  —
                </div>

                <div
                  style={{
                    fontSize:
                      '0.65rem',
                    color:
                      'var(--text-muted)'
                  }}
                >
                  experience
                </div>

              </div>

              <div
                style={{
                  width: 1,
                  background:
                    'var(--border)'
                }}
              />

              <div
                style={{
                  textAlign: 'center',
                  flex: 1
                }}
              >

                <div
                  style={{
                    fontWeight: 700,
                    color:
                      'var(--text)',
                    fontSize:
                      '0.875rem'
                  }}
                >
                  —
                </div>

                <div
                  style={{
                    fontSize:
                      '0.65rem',
                    color:
                      'var(--text-muted)'
                  }}
                >
                  cases won
                </div>

              </div>

            </div>

            {/* Contact details */}

            {(advocateEmail ||
              advocatePhone) && (
              <div
                style={{
                  borderTop:
                    '1px solid var(--border)',
                  paddingTop: 12,
                  marginTop: 4,
                  fontSize:
                    '0.75rem',
                  color:
                    'var(--text-muted)'
                }}
              >

                {advocateEmail && (
                  <div
                    style={{
                      marginBottom: 4
                    }}
                  >
                    Email:{' '}
                    <strong
                      style={{
                        color:
                          'var(--text)'
                      }}
                    >
                      {advocateEmail}
                    </strong>
                  </div>
                )}

                {advocatePhone && (
                  <div>
                    Phone:{' '}
                    <strong
                      style={{
                        color:
                          'var(--text)'
                      }}
                    >
                      {advocatePhone}
                    </strong>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Booking Summary */}

          <div
            className="card"
            style={{
              padding: 20
            }}
          >

            <h3
              style={{
                fontWeight: 700,
                color: 'var(--text)',
                fontSize: '0.9rem',
                marginBottom: 14
              }}
            >
              Booking Summary
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: 8,
                marginBottom: 16
              }}
            >

              {[
                [
                  'Advocate',
                  `Adv. ${advocateName}`
                ],

                [
                  'Date',
                  selectedDay
                    ? `${selectedDay} ${months[month]} ${year}`
                    : '—'
                ],

                [
                  'Time',
                  selectedTime || '—'
                ],

                [
                  'Mode',
                  mode === 'video'
                    ? 'Video Call'
                    : 'In-Person'
                ],

                [
                  'Duration',
                  '60 minutes'
                ],

                [
                  'Consultation Fee',
                  `₹${consultationFee.toLocaleString()}`
                ],

                [
                  'Platform Fee (5%)',
                  `₹${platformFee.toLocaleString()}`
                ]

              ].map(
                ([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      fontSize:
                        '0.84rem',
                      gap: 12
                    }}
                  >

                    <span
                      style={{
                        color:
                          'var(--text-muted)'
                      }}
                    >
                      {k}
                    </span>

                    <span
                      style={{
                        fontWeight: 500,
                        color:
                          'var(--text)',
                        textAlign:
                          'right'
                      }}
                    >
                      {v}
                    </span>

                  </div>
                )
              )}

            </div>

            <div
              style={{
                height: 1,
                background:
                  'var(--border)',
                margin: '14px 0'
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: 20
              }}
            >

              <span
                style={{
                  fontWeight: 700,
                  color:
                    'var(--text)'
                }}
              >
                Total
              </span>

              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color:
                    'var(--text)'
                }}
              >
                ₹{totalFee.toLocaleString()}
              </span>

            </div>

            {/* =================================================
                BOOKING BUTTON
            ================================================= */}

            <button
              onClick={handleBooking}
              disabled={
                !selectedDay ||
                !selectedTime ||
                bookingLoading
              }
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 10,
                border: 'none',
                cursor:
                  selectedDay &&
                  selectedTime &&
                  !bookingLoading
                    ? 'pointer'
                    : 'not-allowed',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                gap: 8,
                opacity:
                  selectedDay &&
                  selectedTime &&
                  !bookingLoading
                    ? 1
                    : 0.5
              }}
            >
              {bookingLoading
                ? 'Booking...'
                : 'Pay & Confirm Booking'}
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                color:
                  'var(--text-muted)',
                marginTop: 10
              }}
            >
              Powered by Razorpay · 100% Secure · Refundable within 24hrs
            </p>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .booking-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  )
}