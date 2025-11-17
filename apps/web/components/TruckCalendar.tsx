import { useState, useMemo } from 'react';

type Appointment = {
  id: string;
  user?: { name: string; email: string };
  vehicle?: { make: string; model: string; year: number; trim: string };
  userId: string;
  slotStart: string;
  slotEnd: string;
  address: string;
  scheduleState: string;
  dispatchStatus: string;
  schedulingMode: string;
  arrivalWindowStart?: string | null;
  windowLockedAt?: string | null;
};

type ViewMode = 'day' | 'week' | 'month';

interface TruckCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appt: Appointment) => void;
}

export default function TruckCalendar({ appointments, onAppointmentClick }: TruckCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Get color based on appointment state
  const getStateColor = (state: string) => {
    switch (state) {
      case 'DRAFT': return '#94a3b8';
      case 'INTERNAL_CONFIRMED': return '#3b82f6';
      case 'SENT_TO_CUSTOMER': return '#f59e0b';
      case 'CUSTOMER_CONFIRMED': return '#10b981';
      case 'SCHEDULED': return '#8b5cf6';
      case 'IN_PROGRESS': return '#06b6d4';
      case 'COMPLETED': return '#22c55e';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get days to display based on view mode
  const daysToDisplay = useMemo(() => {
    const days: Date[] = [];
    
    if (viewMode === 'day') {
      days.push(new Date(currentDate));
    } else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay()); // Start from Sunday
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day);
      }
    } else {
      // Month view
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startDay = start.getDay();
      
      // Add days from previous month
      for (let i = 0; i < startDay; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() - (startDay - i));
        days.push(day);
      }
      
      // Add days of current month
      for (let i = 1; i <= end.getDate(); i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
      }
      
      // Add days from next month to complete the grid
      const remaining = 42 - days.length; // 6 rows * 7 days
      for (let i = 1; i <= remaining; i++) {
        const day = new Date(end);
        day.setDate(end.getDate() + i);
        days.push(day);
      }
    }
    
    return days;
  }, [currentDate, viewMode]);

  // Filter appointments for each day
  const getAppointmentsForDay = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return appointments.filter(appt => {
      const apptDate = new Date(appt.slotStart);
      return apptDate >= dayStart && apptDate <= dayEnd;
    }).sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime());
  };

  // Format date for display
  const formatDate = (date: Date) => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else if (viewMode === 'week') {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="calendar-container">
      {/* Header Controls */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={goToPrevious} className="nav-btn">‹</button>
          <button onClick={goToToday} className="today-btn">Today</button>
          <button onClick={goToNext} className="nav-btn">›</button>
          <h2 className="calendar-title">{formatDate(currentDate)}</h2>
        </div>
        
        <div className="view-toggle">
          <button 
            onClick={() => setViewMode('day')} 
            className={viewMode === 'day' ? 'active' : ''}
          >
            Day
          </button>
          <button 
            onClick={() => setViewMode('week')} 
            className={viewMode === 'week' ? 'active' : ''}
          >
            Week
          </button>
          <button 
            onClick={() => setViewMode('month')} 
            className={viewMode === 'month' ? 'active' : ''}
          >
            Month
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <span className="legend-item"><span className="dot" style={{background: '#10b981'}}></span> Confirmed</span>
        <span className="legend-item"><span className="dot" style={{background: '#f59e0b'}}></span> Sent to Customer</span>
        <span className="legend-item"><span className="dot" style={{background: '#3b82f6'}}></span> Internal</span>
        <span className="legend-item"><span className="dot" style={{background: '#6b7280'}}></span> Draft</span>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <div className="weekday-header">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
      )}

      <div className={`calendar-grid ${viewMode}`}>
        {daysToDisplay.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isTodayFlag = isToday(day);
          const isCurrentMonthFlag = isCurrentMonth(day);
          
          return (
            <div 
              key={idx} 
              className={`calendar-day ${isTodayFlag ? 'today' : ''} ${!isCurrentMonthFlag && viewMode === 'month' ? 'other-month' : ''}`}
            >
              <div className="day-header">
                <span className="day-number">{day.getDate()}</span>
                {viewMode !== 'month' && (
                  <span className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                )}
              </div>
              
              <div className="day-appointments">
                {dayAppointments.length === 0 && viewMode !== 'month' && (
                  <div className="no-appointments">No trucks scheduled</div>
                )}
                {dayAppointments.map(appt => {
                  const startTime = new Date(appt.slotStart);
                  const endTime = new Date(appt.slotEnd);
                  
                  return (
                    <div 
                      key={appt.id} 
                      className="appointment-card"
                      style={{ borderLeftColor: getStateColor(appt.scheduleState) }}
                      onClick={() => onAppointmentClick?.(appt)}
                    >
                      <div className="appt-time">
                        {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        {viewMode !== 'month' && ` - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                      </div>
                      <div className="appt-customer">{appt.user?.name || 'Unknown'}</div>
                      {viewMode !== 'month' && (
                        <>
                          <div className="appt-vehicle">
                            {appt.vehicle?.make} {appt.vehicle?.model} ({appt.vehicle?.year})
                          </div>
                          <div className="appt-address">{appt.address}</div>
                        </>
                      )}
                      <div className="appt-state" style={{ color: getStateColor(appt.scheduleState) }}>
                        {appt.scheduleState.replace(/_/g, ' ')}
                      </div>
                    </div>
                  );
                })}
                {viewMode === 'month' && dayAppointments.length > 2 && (
                  <div className="more-appointments">+{dayAppointments.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .calendar-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-btn, .today-btn {
          padding: 8px 16px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .nav-btn:hover, .today-btn:hover {
          background: #f3f4f6;
        }

        .calendar-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 0 12px;
          color: #111827;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }

        .view-toggle button {
          padding: 6px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #6b7280;
          transition: all 0.2s;
        }

        .view-toggle button.active {
          background: white;
          color: #111827;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .calendar-legend {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          font-size: 13px;
          color: #6b7280;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .weekday-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }

        .calendar-grid {
          display: grid;
          gap: 8px;
        }

        .calendar-grid.day {
          grid-template-columns: 1fr;
        }

        .calendar-grid.week {
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-grid.month {
          grid-template-columns: repeat(7, 1fr);
        }

        .calendar-day {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          min-height: 120px;
          background: white;
          transition: all 0.2s;
        }

        .calendar-day:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .calendar-day.today {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .calendar-day.other-month {
          opacity: 0.4;
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f3f4f6;
        }

        .day-number {
          font-weight: 600;
          font-size: 16px;
          color: #111827;
        }

        .day-name {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }

        .day-appointments {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .no-appointments {
          font-size: 12px;
          color: #9ca3af;
          text-align: center;
          padding: 20px 0;
        }

        .appointment-card {
          background: #f9fafb;
          border-left: 3px solid #3b82f6;
          border-radius: 4px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }

        .appointment-card:hover {
          background: #f3f4f6;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .appt-time {
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .appt-customer {
          font-weight: 500;
          color: #374151;
          margin-bottom: 2px;
        }

        .appt-vehicle {
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .appt-address {
          color: #9ca3af;
          font-size: 11px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .appt-state {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .more-appointments {
          font-size: 11px;
          color: #6b7280;
          text-align: center;
          padding: 4px;
          cursor: pointer;
        }

        .calendar-grid.month .calendar-day {
          min-height: 100px;
        }

        .calendar-grid.month .appointment-card {
          padding: 4px 6px;
        }

        .calendar-grid.month .day-appointments {
          max-height: 60px;
          overflow: hidden;
        }

        .calendar-grid.day .calendar-day {
          min-height: 500px;
        }

        @media (max-width: 768px) {
          .calendar-header {
            flex-direction: column;
            align-items: stretch;
          }

          .calendar-nav {
            justify-content: space-between;
          }

          .calendar-title {
            margin: 0;
          }

          .calendar-grid.week {
            grid-template-columns: repeat(3, 1fr);
          }

          .view-toggle {
            width: 100%;
          }

          .view-toggle button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
