// apps/web/pages/admin/dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { GRAPHQL_URL } from '../../lib/api';

console.log("🚀 AdminDashboard rendered");

type Appointment = {
  id: string;
  user?: { name: string; email: string };
  vehicle?: { make: string; model: string; year: number; trim: string };
  userId: string;
  vehicleId: string;
  slotStart: string;
  slotEnd: string;
  address: string;
  scheduleState: string;
  dispatchStatus: string;
  schedulingMode: string;
  arrivalWindowStart?: string | null;
  windowLockedAt?: string | null;
};

// Use centralized GraphQL URL
const GQL = GRAPHQL_URL;

export default function AdminDashboard() {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('calendar');

  // Calendar timeline controls
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(GQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              appointments {
                id
                slotStart
                slotEnd
                scheduleState
                dispatchStatus
                schedulingMode
                arrivalWindowStart
                windowLockedAt
                user { name email }
                vehicle { make model year trim }
              }
            }
          `,
        }),
      });
  
      const json = await res.json();
  
      if (json.errors) {
        console.error('❌ GraphQL error:', json.errors);
        setMsg(json.errors[0].message);
        setRows([]); // empty
      } else {
        console.log('✅ Got data:', json.data);
        setRows(json.data.appointments ?? []);
      }
    } catch (e: any) {
      console.error('❌ Fetch failed:', e.message);
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(GQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation {
              ${action}(appointmentId: "${id}")
            }
          `,
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      await fetchAppointments();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()),
    [rows]
  );

  // Calendar helpers
  function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun ... 6=Sat
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function formatDayLabel(d: Date): string {
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const HOUR_START = 7; // 7am
  const HOUR_END = 20;  // 8pm
  const HOUR_HEIGHT = 48; // px per hour

  const appointmentsByDay = useMemo(() => {
    return weekDays.map(day => {
      const matches = sorted.filter(a => isSameDay(new Date(a.slotStart), day));
      return { day, items: matches };
    });
  }, [sorted, weekDays]);

  function minutesSinceStart(d: Date): number {
    return (d.getHours() - HOUR_START) * 60 + d.getMinutes();
  }

  function blockStyle(startISO: string, endISO: string): React.CSSProperties {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const topMin = Math.max(0, minutesSinceStart(start));
    const durMin = Math.max(30, Math.max(0, (end.getTime() - start.getTime()) / 60000));
    const topPx = (topMin / 60) * HOUR_HEIGHT;
    const heightPx = (durMin / 60) * HOUR_HEIGHT;
    return { position: 'absolute', left: 8, right: 8, top: topPx, height: heightPx, borderRadius: 8, padding: 8, color: '#111827', overflow: 'hidden' };
  }

  function stateColor(state?: string): { background: string; border: string } {
    const s = (state || '').toLowerCase();
    if (s.includes('internal')) return { background: '#d1fae5', border: '#10b981' }; // green
    if (s.includes('resent')) return { background: '#dbeafe', border: '#3b82f6' }; // blue
    if (s.includes('sent')) return { background: '#e0e7ff', border: '#6366f1' }; // indigo
    if (s.includes('locked')) return { background: '#fde68a', border: '#f59e0b' }; // amber
    return { background: '#f3f4f6', border: '#9ca3af' }; // gray
  }

  return (
    <Layout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Admin Dashboard</h2>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{display:'inline-flex', background:'#f3f4f6', borderRadius:999, padding:2}}>
            <button onClick={()=>setView('calendar')} aria-pressed={view==='calendar'} style={{ padding:'6px 10px', borderRadius:999, border:'none', background:view==='calendar'?'#111827':'transparent', color:view==='calendar'?'#fff':'#111827', cursor:'pointer' }}>Calendar</button>
            <button onClick={()=>setView('list')} aria-pressed={view==='list'} style={{ padding:'6px 10px', borderRadius:999, border:'none', background:view==='list'?'#111827':'transparent', color:view==='list'?'#fff':'#111827', cursor:'pointer' }}>List</button>
          </div>
          <Link href="/admin/appointments/new" style={{ background:'#111827', color:'#fff', padding:'8px 12px', borderRadius:8 }}>+ New</Link>
          <small>GraphQL: {GQL}</small>
        </div>
      </div>
      {msg && <div style={{color:'#b00', marginTop:8}}>{msg}</div>}
      {view === 'list' && (
        <div style={{marginTop:12, overflowX:'auto'}}>
          <table style={{width:'100%'}}>
            <thead>
              <tr>
                <th>When</th>
                <th>User</th>
                <th>Vehicle</th>
                <th>State</th>
                <th>Window</th>
                <th>Tech</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(a => (
                <tr key={a.id}>
                  <td>
                    <div>{new Date(a.slotStart).toLocaleString()}</div>
                    <div style={{fontSize:12, color:'#666'}}>→ {new Date(a.slotEnd).toLocaleString()}</div>
                  </td>
                  <td>
                    <div>{a.user?.name ?? a.userId}</div>
                    <div style={{fontSize:12, color:'#666'}}>{a.user?.email ?? ''}</div>
                  </td>
                  <td>
                    <div>{a.vehicle?.make} {a.vehicle?.model}</div>
                    <div style={{fontSize:12, color:'#666'}}>{a.vehicle?.year} · {a.vehicle?.trim}</div>
                  </td>
                  <td>
                    <div>{a.scheduleState}</div>
                    <div style={{fontSize:12, color:'#666'}}>Dispatch: {a.dispatchStatus}</div>
                  </td>
                  <td style={{fontSize:12, color:'#666'}}>
                    <div>Mode: {a.schedulingMode}</div>
                    {a.arrivalWindowStart && <div>Arrive: {new Date(a.arrivalWindowStart).toLocaleString()}</div>}
                    {a.windowLockedAt && <div>Locked: {new Date(a.windowLockedAt).toLocaleString()}</div>}
                  </td>
                  <td>—</td>
                  <td>
                    <button onClick={()=>handleAction(a.id,'internalConfirm')}>Internal</button>{' '}
                    <button onClick={()=>handleAction(a.id,'sendConfirmation')}>Send</button>{' '}
                    <button onClick={()=>handleAction(a.id,'resendConfirmation')}>Resend</button>{' '}
                    <button onClick={()=>handleAction(a.id,'lockWindowNow')}>Lock</button>{' '}
                    <Link href={`/admin/appointments/${a.id}/edit`} className="link">Edit</Link>
                  </td>
                </tr>
              ))}
              {sorted.length===0 && <tr><td colSpan={7} style={{color:'#666'}}>No appointments</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {view === 'calendar' && (
        <div style={{marginTop:12}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <button className="secondary" onClick={()=>setCurrentDate(new Date())}>Today</button>
              <button className="secondary" onClick={()=>setCurrentDate(d=>{ const x=new Date(d); x.setDate(x.getDate()-7); return x; })}>← Prev</button>
              <button className="secondary" onClick={()=>setCurrentDate(d=>{ const x=new Date(d); x.setDate(x.getDate()+7); return x; })}>Next →</button>
            </div>
            <div style={{fontWeight:600}}>
              {weekDays[0].toLocaleDateString()} – {weekDays[6].toLocaleDateString()}
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'80px repeat(7, 1fr)', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden'}}>
            {/* Header row */}
            <div style={{background:'#f9fafb', borderRight:'1px solid #e5e7eb'}}></div>
            {weekDays.map((d, i) => (
              <div key={i} style={{padding:8, background:'#f9fafb', borderRight: i<6 ? '1px solid #e5e7eb' : undefined, textAlign:'center', fontWeight:600}}>
                {formatDayLabel(d)}
              </div>
            ))}

            {/* Time gutter and day columns */}
            <div style={{borderTop:'1px solid #e5e7eb', borderRight:'1px solid #e5e7eb', background:'#fff'}}>
              {Array.from({length: HOUR_END - HOUR_START + 1}).map((_, idx) => {
                const hr = HOUR_START + idx;
                const label = new Date(0,0,0,hr).toLocaleTimeString(undefined, { hour: 'numeric' });
                return (
                  <div key={hr} style={{height:HOUR_HEIGHT, fontSize:12, color:'#6b7280', padding:4, borderTop: idx===0? undefined : '1px dotted #e5e7eb'}}>{label}</div>
                );
              })}
            </div>

            {appointmentsByDay.map(({ day, items }, colIdx) => (
              <div key={colIdx} style={{position:'relative', borderTop:'1px solid #e5e7eb', borderRight: colIdx<6 ? '1px solid #e5e7eb' : undefined, background:'#fff', height: (HOUR_END - HOUR_START) * HOUR_HEIGHT}}>
                {/* hour lines */}
                {Array.from({length: HOUR_END - HOUR_START + 1}).map((_, idx) => (
                  <div key={idx} style={{position:'absolute', left:0, right:0, top: idx*HOUR_HEIGHT, borderTop:'1px dotted #f3f4f6'}} />
                ))}
                {/* appointments */}
                {items.map(a => {
                  const { background, border } = stateColor(a.scheduleState);
                  const style = blockStyle(a.slotStart, a.slotEnd);
                  return (
                    <div key={a.id} style={{...style, background, border:`1px solid ${border}`}}>
                      <div style={{fontSize:12, color:'#374151', marginBottom:4}}>
                        {new Date(a.slotStart).toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' })}
                        {' – '}
                        {new Date(a.slotEnd).toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' })}
                      </div>
                      <div style={{fontWeight:600}}>{a.user?.name ?? a.userId}</div>
                      <div style={{fontSize:12, color:'#374151'}}>
                        {a.vehicle?.make} {a.vehicle?.model} {a.vehicle?.year}
                      </div>
                      <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>{a.scheduleState}</div>
                      <div style={{display:'flex', gap:6, marginTop:6}}>
                        <button className="ghost" onClick={()=>handleAction(a.id,'internalConfirm')}>Internal</button>
                        <button className="ghost" onClick={()=>handleAction(a.id,'sendConfirmation')}>Send</button>
                        <Link href={`/admin/appointments/${a.id}/edit`} className="link">Edit</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
