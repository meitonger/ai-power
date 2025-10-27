// apps/web/pages/admin/dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/graphql`, {
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
      const res = await fetch(`${API_URL}/api/graphql`, {
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

  
  return (
    <Layout>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Admin Dashboard</h2>
        <small>API: {API_URL}</small>
      </div>
      {msg && <div style={{color:'#b00', marginTop:8}}>{msg}</div>}
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
                  <button onClick={()=>handleAction(a.id,'internal')}>Internal</button>{' '}
                  <button onClick={()=>handleAction(a.id,'send')}>Send</button>{' '}
                  <button onClick={()=>handleAction(a.id,'resend')}>Resend</button>{' '}
                  <button onClick={()=>handleAction(a.id,'lock')}>Lock</button>
                </td>
              </tr>
            ))}
            {sorted.length===0 && <tr><td colSpan={7} style={{color:'#666'}}>No appointments</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
