// apps/web/pages/admin/appointments/[id]/edit.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { apiGet, apiPatch } from '../../../../lib/api';

function toLocalInput(d: string | null | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toISO(local: string | null | undefined): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

type LoadedAppointment = {
  id: string;
  userId: string;
  vehicleId: string;
  slotStart: string;
  slotEnd: string;
  address: string;
  notes?: string | null;
  arrivalWindowStart?: string | null;
  arrivalWindowEnd?: string | null;
  techId?: string | null;
};

export default function AdminEditAppointmentPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [slotStartLocal, setSlotStartLocal] = useState('');
  const [slotEndLocal, setSlotEndLocal] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [arrivalStartLocal, setArrivalStartLocal] = useState('');
  const [arrivalEndLocal, setArrivalEndLocal] = useState('');
  const [techId, setTechId] = useState('');

  useEffect(() => {
    async function load() {
      if (!id || typeof id !== 'string') return;
      setLoading(true);
      setError(null);
      try {
        const appt = await apiGet<LoadedAppointment>(`/appointments/${id}`);
        setSlotStartLocal(toLocalInput(appt.slotStart));
        setSlotEndLocal(toLocalInput(appt.slotEnd));
        setAddress(appt.address || '');
        setNotes(appt.notes || '');
        setArrivalStartLocal(toLocalInput(appt.arrivalWindowStart));
        setArrivalEndLocal(toLocalInput(appt.arrivalWindowEnd));
        setTechId(appt.techId || '');
      } catch (e: any) {
        setError(e?.message || 'Failed to load appointment');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function save() {
    if (!id || typeof id !== 'string') return;
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      await apiPatch(`/appointments/${id}`, {
        slotStart: toISO(slotStartLocal),
        slotEnd: toISO(slotEndLocal),
        address: address || undefined,
        notes: notes?.trim() || undefined,
        arrivalWindowStart: toISO(arrivalStartLocal),
        arrivalWindowEnd: toISO(arrivalEndLocal),
        techId: techId?.trim() || undefined,
      });
      setMsg('Saved');
      router.push('/admin/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin · Edit Appointment</title>
      </Head>
      <div style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
        <h2>Edit Appointment</h2>
        {loading && <div>Loading…</div>}
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 8, borderRadius: 8 }}>{error}</div>}
        {msg && <div style={{ background: '#ecfdf5', color: '#065f46', padding: 8, borderRadius: 8 }}>{msg}</div>}

        {!loading && (
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Start time</span>
              <input type="datetime-local" value={slotStartLocal} onChange={(e)=>setSlotStartLocal(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>End time</span>
              <input type="datetime-local" value={slotEndLocal} onChange={(e)=>setSlotEndLocal(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Address</span>
              <input type="text" value={address} onChange={(e)=>setAddress(e.target.value)} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Notes</span>
              <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Arrival window start (optional)</span>
                <input type="datetime-local" value={arrivalStartLocal} onChange={(e)=>setArrivalStartLocal(e.target.value)} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Arrival window end (optional)</span>
                <input type="datetime-local" value={arrivalEndLocal} onChange={(e)=>setArrivalEndLocal(e.target.value)} />
              </label>
            </div>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Tech ID (optional)</span>
              <input type="text" value={techId} onChange={(e)=>setTechId(e.target.value)} />
            </label>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={()=>router.push('/admin/dashboard')} className="secondary">Cancel</button>
              <button onClick={save} className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
