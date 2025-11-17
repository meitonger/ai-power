// apps/web/pages/admin/dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import TruckCalendar from '../../components/TruckCalendar';
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

type ViewType = 'calendar' | 'table';

// Use centralized GraphQL URL
const GQL = GRAPHQL_URL;

export default function AdminDashboard() {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>('calendar');

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
                userId
                vehicleId
                address
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

  const handleStatusChange = async (id: string, type: 'schedule' | 'dispatch', value: string) => {
    try {
      const mutation = type === 'schedule' ? 'updateScheduleState' : 'updateDispatchStatus';
      const param = type === 'schedule' ? 'state' : 'status';
      
      const res = await fetch(GQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation {
              ${mutation}(appointmentId: "${id}", ${param}: "${value}")
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

  const getStatusColor = (state: string): string => {
    switch (state) {
      case 'CUSTOMER_CONFIRMED': return '#10b981'; // green
      case 'SENT_TO_CUSTOMER': return '#f59e0b'; // orange
      case 'INTERNAL_CONFIRMED': return '#3b82f6'; // blue
      case 'DRAFT': return '#94a3b8'; // gray
      case 'CUSTOMER_DECLINED': return '#ef4444'; // red
      case 'CANCELLED': return '#ef4444'; // red
      default: return '#6b7280';
    }
  };

  const getDispatchColor = (status: string): string => {
    switch (status) {
      case 'COMPLETE': return '#10b981'; // green
      case 'IN_ROUTE': return '#3b82f6'; // blue
      case 'ASSIGNED': return '#f59e0b'; // orange
      case 'UNASSIGNED': return '#94a3b8'; // gray
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()),
    [rows]
  );

  return (
    <Layout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16}}>
        <h2>Admin Dashboard - Truck Schedule</h2>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{display:'flex', gap:4, background:'#f3f4f6', padding:4, borderRadius:8}}>
            <button 
              onClick={() => setViewType('calendar')}
              style={{
                padding: '6px 16px',
                border: 'none',
                background: viewType === 'calendar' ? 'white' : 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                color: viewType === 'calendar' ? '#111827' : '#6b7280',
                boxShadow: viewType === 'calendar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📅 Calendar
            </button>
            <button 
              onClick={() => setViewType('table')}
              style={{
                padding: '6px 16px',
                border: 'none',
                background: viewType === 'table' ? 'white' : 'transparent',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                color: viewType === 'table' ? '#111827' : '#6b7280',
                boxShadow: viewType === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📋 Table
            </button>
          </div>
          <Link href="/admin/appointments/new" style={{ background:'#111827', color:'#fff', padding:'8px 12px', borderRadius:8, textDecoration: 'none' }}>+ New Appointment</Link>
        </div>
      </div>

      {msg && <div style={{color:'#b00', marginTop:8, marginBottom:12, background:'#fee', padding:12, borderRadius:8}}>{msg}</div>}
      
      {loading ? (
        <div style={{textAlign:'center', padding:40, color:'#666'}}>Loading truck schedule...</div>
      ) : (
        <>
          {viewType === 'calendar' ? (
            <TruckCalendar 
              appointments={sorted} 
              onAppointmentClick={(appt) => {
                window.location.href = `/admin/appointments/${appt.id}/edit`;
              }}
            />
          ) : (
            <div style={{marginTop:12, overflowX:'auto', background:'white', borderRadius:12, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'2px solid #e5e7eb'}}>
                    <th style={{textAlign:'left', padding:12, fontWeight:600, color:'#374151'}}>When</th>
                    <th style={{textAlign:'left', padding:12, fontWeight:600, color:'#374151'}}>User</th>
                    <th style={{textAlign:'left', padding:12, fontWeight:600, color:'#374151'}}>Vehicle</th>
                    <th style={{textAlign:'left', padding:12, fontWeight:600, color:'#374151'}}>
                      <div>Schedule Status</div>
                      <div style={{fontSize:11, fontWeight:400, color:'#9ca3af', marginTop:2}}>& Dispatch</div>
                    </th>
                    <th style={{textAlign:'left', padding:12, fontWeight:600, color:'#374151'}}>Window</th>
                    <th style={{textAlign:'left', padding:12, fontWeight:600, color:'#374151'}}>Tech</th>
                    <th style={{textAlign:'left', padding:12, fontWeight:600, color:'#374151'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(a => (
                    <tr key={a.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                      <td style={{padding:12}}>
                        <div style={{fontWeight:500}}>{new Date(a.slotStart).toLocaleString()}</div>
                        <div style={{fontSize:12, color:'#666'}}>→ {new Date(a.slotEnd).toLocaleString()}</div>
                      </td>
                      <td style={{padding:12}}>
                        <div style={{fontWeight:500}}>{a.user?.name ?? a.userId}</div>
                        <div style={{fontSize:12, color:'#666'}}>{a.user?.email ?? ''}</div>
                      </td>
                      <td style={{padding:12}}>
                        <div style={{fontWeight:500}}>{a.vehicle?.make} {a.vehicle?.model}</div>
                        <div style={{fontSize:12, color:'#666'}}>{a.vehicle?.year} · {a.vehicle?.trim}</div>
                      </td>
                      <td style={{padding:12}}>
                        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                          <span style={{
                            width:10,
                            height:10,
                            borderRadius:'50%',
                            background: getStatusColor(a.scheduleState),
                            flexShrink:0
                          }}></span>
                          <select 
                            value={a.scheduleState}
                            onChange={(e) => handleStatusChange(a.id, 'schedule', e.target.value)}
                            style={{
                              padding:'4px 8px',
                              borderRadius:6,
                              border:'1px solid #e5e7eb',
                              fontSize:12,
                              fontWeight:500,
                              cursor:'pointer',
                              background:'white',
                              color: '#374151',
                              flex:1
                            }}
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="INTERNAL_CONFIRMED">Internal Confirmed</option>
                            <option value="SENT_TO_CUSTOMER">Sent to Customer</option>
                            <option value="CUSTOMER_CONFIRMED">Customer Confirmed</option>
                            <option value="CUSTOMER_DECLINED">Customer Declined</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span style={{
                            width:10,
                            height:10,
                            borderRadius:'50%',
                            background: getDispatchColor(a.dispatchStatus),
                            flexShrink:0
                          }}></span>
                          <select 
                            value={a.dispatchStatus}
                            onChange={(e) => handleStatusChange(a.id, 'dispatch', e.target.value)}
                            style={{
                              padding:'4px 8px',
                              borderRadius:6,
                              border:'1px solid #e5e7eb',
                              fontSize:12,
                              fontWeight:500,
                              cursor:'pointer',
                              background:'white',
                              color: '#374151',
                              flex:1
                            }}
                          >
                            <option value="UNASSIGNED">Unassigned</option>
                            <option value="ASSIGNED">Assigned</option>
                            <option value="IN_ROUTE">In Route</option>
                            <option value="COMPLETE">Complete</option>
                          </select>
                        </div>
                      </td>
                      <td style={{fontSize:12, color:'#666', padding:12}}>
                        <div>Mode: {a.schedulingMode}</div>
                        {a.arrivalWindowStart && <div>Arrive: {new Date(a.arrivalWindowStart).toLocaleString()}</div>}
                        {a.windowLockedAt && <div>Locked: {new Date(a.windowLockedAt).toLocaleString()}</div>}
                      </td>
                      <td style={{padding:12}}>—</td>
                      <td style={{padding:12}}>
                        <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                          <button onClick={()=>handleAction(a.id,'setDraft')} style={{padding:'4px 8px', fontSize:12, border:'1px solid #d1d5db', borderRadius:4, background:'white', cursor:'pointer'}}>Draft</button>
                          <button onClick={()=>handleAction(a.id,'internalConfirm')} style={{padding:'4px 8px', fontSize:12, border:'1px solid #d1d5db', borderRadius:4, background:'white', cursor:'pointer'}}>Internal</button>
                          <button onClick={()=>handleAction(a.id,'sendConfirmation')} style={{padding:'4px 8px', fontSize:12, border:'1px solid #d1d5db', borderRadius:4, background:'white', cursor:'pointer'}}>Send</button>
                          <button onClick={()=>handleAction(a.id,'resendConfirmation')} style={{padding:'4px 8px', fontSize:12, border:'1px solid #d1d5db', borderRadius:4, background:'white', cursor:'pointer'}}>Resend</button>
                          <button onClick={()=>handleAction(a.id,'customerConfirm')} style={{padding:'4px 8px', fontSize:12, border:'1px solid #d1d5db', borderRadius:4, background:'white', cursor:'pointer'}}>Confirmed</button>
                          <button onClick={()=>handleAction(a.id,'lockWindowNow')} style={{padding:'4px 8px', fontSize:12, border:'1px solid #d1d5db', borderRadius:4, background:'white', cursor:'pointer'}}>Lock</button>
                          <Link href={`/admin/appointments/${a.id}/edit`} style={{padding:'4px 8px', fontSize:12, color:'#2563eb', textDecoration:'none'}}>Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sorted.length===0 && (
                    <tr>
                      <td colSpan={7} style={{color:'#666', textAlign:'center', padding:40}}>
                        No truck appointments scheduled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
