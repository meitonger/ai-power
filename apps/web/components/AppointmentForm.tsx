import React from 'react';
import { apiGet, apiPost } from '../lib/api';
import type { User, Vehicle, Appointment } from '../types';

/* ---------- pricing tables (edit any time) ---------- */
type TireKey = 'tire_on_sedan' | 'tire_off_sedan' | 'tire_on_pickup' | 'tire_off_pickup';
const TIRE_SERVICES: Record<TireKey, { label: string; price: number }> = {
  tire_on_sedan:   { label: 'Tire Change · On Rim · Sedan/SUV',    price: 60 },
  tire_off_sedan:  { label: 'Tire Change · Off Rim · Sedan/SUV',   price: 120 },
  tire_on_pickup:  { label: 'Tire Change · On Rim · Pickup Truck', price: 70 },
  tire_off_pickup: { label: 'Tire Change · Off Rim · Pickup Truck',price: 130 },
};
type FilterKey = 'tesla_m3' | 'tesla_my' | 'tesla_ms' | 'tesla_mx';
const FILTER_SERVICES: Record<FilterKey, { label: string; price: number }> = {
  tesla_m3: { label: 'TESLA Cabin Filters · Model 3 (2 inner filters)', price: 95  },
  tesla_my: { label: 'TESLA Cabin Filters · Model Y (full 6 filters)',  price: 150 },
  tesla_ms: { label: 'TESLA Cabin Filters · Model S (Starting At)',     price: 100 },
  tesla_mx: { label: 'TESLA Cabin Filters · Model X (Starting At)',     price: 100 },
};
type ExtraKey =
  | 'flat_repair' | 'balancing' | 'rotation' | 'mount_dismount'
  | 'tpms_install_program' | 'hub_clean' | 'seasonal_storage' | 'callout_fee';
type ExtraItem = {
  key: ExtraKey; label: string; unitPrice: number; unit: 'flat'|'per_tire'|'per_wheel'|'per_set';
  defaultQty?: number; editablePrice?: boolean;
};
const EXTRAS: ExtraItem[] = [
  { key: 'flat_repair',          label: 'Flat Repair (Patch/Plug)',       unitPrice: 40,  unit: 'per_tire', defaultQty: 1 },
  { key: 'balancing',            label: 'Wheel Balancing',                 unitPrice: 15,  unit: 'per_tire', defaultQty: 4 },
  { key: 'rotation',             label: 'Tire Rotation',                   unitPrice: 40,  unit: 'per_set',  defaultQty: 1 },
  { key: 'mount_dismount',       label: 'Mount & Dismount',                unitPrice: 15,  unit: 'per_tire', defaultQty: 4 },
  { key: 'tpms_install_program', label: 'TPMS Install & Program',          unitPrice: 35,  unit: 'per_wheel',defaultQty: 4 },
  { key: 'hub_clean',            label: 'Hub & Rim Clean',                 unitPrice: 10,  unit: 'per_wheel',defaultQty: 4 },
  { key: 'seasonal_storage',     label: 'Seasonal Storage (set of 4)',     unitPrice: 100, unit: 'flat',     defaultQty: 1 },
  { key: 'callout_fee',          label: 'Mobile Service Call-out',         unitPrice: 0,   unit: 'flat',     defaultQty: 1, editablePrice: true },
];

/* ---------- types ---------- */
type ExtraSelection = Partial<Record<ExtraKey, { qty: number; unitPrice?: number }>>;
type LineItem = {
  vehicleId: string;
  tire?: TireKey | '';
  filter?: FilterKey | '';
  extras: ExtraSelection;
};
type Step = 1 | 2 | 3;
const createEmptyLine = (): LineItem => ({ vehicleId: '', tire: '', filter: '', extras: {} });

/* ---------- helpers ---------- */
const money = (n: number) => `$${n}`;
const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const getDefaultSlotRange = () => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start: toLocalInput(start), end: toLocalInput(end) };
};

export default function AppointmentWizard({ onSuccess }: { onSuccess?: (appts: Appointment[]) => void }) {
  const [step, setStep] = React.useState<Step>(1);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [resetCountdown, setResetCountdown] = React.useState<number | null>(null);
  const [creatingUser, setCreatingUser] = React.useState(false);
  const [showAddVehicleForLine, setShowAddVehicleForLine] = React.useState<number | null>(null);
  const [creatingVehicle, setCreatingVehicle] = React.useState(false);
  const [newVehicle, setNewVehicle] = React.useState<{ make: string; model: string; year: string }>({
    make: '', model: '', year: ''
  });

  // shared booking
  const [userId, setUserId] = React.useState('');
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [slotStartLocal, setSlotStartLocal] = React.useState('');
  const [slotEndLocal, setSlotEndLocal] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [orderNotes, setOrderNotes] = React.useState('');

  // per-vehicle lines
  const [lines, setLines] = React.useState<LineItem[]>([createEmptyLine()]);

  React.useEffect(() => {
    (async () => {
      try {
        const v = await apiGet<Vehicle[]>('/vehicles');
        setVehicles(v);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // default times: next top of hour -> +1h
  React.useEffect(() => {
    const { start, end } = getDefaultSlotRange();
    setSlotStartLocal(s => s || start);
    setSlotEndLocal(e => e || end);
  }, []);

  const resetWizard = React.useCallback(() => {
    const { start, end } = getDefaultSlotRange();
    setStep(1);
    setUserId('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSlotStartLocal(start);
    setSlotEndLocal(end);
    setAddress('');
    setOrderNotes('');
    setLines([createEmptyLine()]);
    setSuccessMsg(null);
    setError(null);
    setShowAddVehicleForLine(null);
    setNewVehicle({ make: '', model: '', year: '' });
    setCreatingVehicle(false);
    setCreatingUser(false);
    setResetCountdown(null);
  }, []);

  React.useEffect(() => {
    if (resetCountdown === null) return;
    if (resetCountdown <= 0) {
      resetWizard();
      return;
    }
    const timer = setTimeout(() => {
      setResetCountdown(prev => {
        if (prev === null) return null;
        return Math.max(prev - 1, 0);
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [resetCountdown, resetWizard]);

  const vehiclesForUser = React.useMemo(
    () => vehicles.filter(v => !userId || v.userId === userId),
    [vehicles, userId]
  );

  // If exactly one vehicle exists for this customer, auto-select it on empty lines
  React.useEffect(() => {
    if (vehiclesForUser.length === 1) {
      const onlyId = vehiclesForUser[0].id;
      lines.forEach((l, idx) => {
        if (!l.vehicleId) updateLine(idx, 'vehicleId', onlyId);
      });
    }
  }, [vehiclesForUser, lines]);

  React.useEffect(() => {
    // If customer changed, reset vehicles selection to force re-pick
    setLines(prev => prev.map(l => ({ ...l, vehicleId: '' })));
  }, [userId]);

  function lineSubtotal(line: LineItem): number {
    let sum = 0;
    if (line.tire)   sum += TIRE_SERVICES[line.tire].price;
    if (line.filter) sum += FILTER_SERVICES[line.filter].price;
    for (const item of EXTRAS) {
      const sel = line.extras[item.key];
      if (!sel) continue;
      const unit = (sel.unitPrice ?? item.unitPrice);
      const qty  = Math.max(1, Math.floor(sel.qty || 1));
      sum += unit * qty;
    }
    return sum;
  }
  const orderTotal = lines.reduce((acc, l) => acc + lineSubtotal(l), 0);

  function addLine(copyPrev = false) {
    setLines(prev => {
      const last = prev[prev.length - 1];
      const base: LineItem = copyPrev && last
        ? { vehicleId: '', tire: last.tire || '', filter: last.filter || '', extras: {} }
        : { vehicleId: '', tire: '', filter: '', extras: {} };
      return [...prev, base];
    });
  }
  function removeLine(i: number) { setLines(prev => prev.filter((_, idx) => idx !== i)); }
  function updateLine<K extends keyof LineItem>(i: number, key: K, value: LineItem[K]) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [key]: value } : l));
    if (key === 'vehicleId') {
      const v = vehicles.find(v => v.id === value);
      if (v && v.make.toLowerCase() === 'tesla') {
        const model = v.model.toLowerCase();
        const map: Record<string, FilterKey> = {
          'model 3': 'tesla_m3',
          'model y': 'tesla_my',
          'model s': 'tesla_ms',
          'model x': 'tesla_mx',
        };
        const keyGuess = Object.keys(map).find(k => model.includes(k));
        if (typeof i === 'number' && keyGuess) {
          setLines(prev => prev.map((l, idx) => idx === i ? { ...l, filter: map[keyGuess!] } : l));
        }
      }
    }
  }
  function toggleExtra(i: number, key: ExtraKey, checked: boolean) {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l;
      const extras: ExtraSelection = { ...l.extras };
      if (checked) {
        const def = EXTRAS.find(e => e.key === key)!;
        extras[key] = { qty: def.defaultQty ?? 1 };
      } else {
        delete extras[key];
      }
      return { ...l, extras };
    }));
  }
  function setExtraQty(i: number, key: ExtraKey, qty: number) {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l;
      const extras: ExtraSelection = { ...l.extras };
      if (extras[key]) extras[key]!.qty = Math.max(0, Math.floor(qty || 0));
      return { ...l, extras };
    }));
  }
  function setExtraPrice(i: number, key: ExtraKey, price: number) {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l;
      const extras: ExtraSelection = { ...l.extras };
      if (extras[key]) extras[key]!.unitPrice = Math.max(0, Math.round(price || 0));
      return { ...l, extras };
    }));
  }

  function validateStep(s: Step): string | null {
    if (s === 1) {
      if (!customerName.trim()) return 'Please enter customer name.';
      const email = customerEmail.trim();
      const emailOk = !!email && /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
      if (!emailOk) return 'Please enter a valid email.';
      if (!slotStartLocal || !slotEndLocal) return 'Please pick start/end time.';
      const start = new Date(slotStartLocal), end = new Date(slotEndLocal);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 'Invalid time range.';
      if (!address.trim()) return 'Please enter the service address.';
    }
    if (s === 2) {
      if (lines.length === 0) return 'Add at least one vehicle.';
      for (let i = 0; i < lines.length; i++) {
        const L = lines[i];
        if (!L.vehicleId) return `Line ${i+1}: select a vehicle.`;
        const hasPrimary = !!L.tire || !!L.filter;
        const hasExtras  = Object.keys(L.extras).length > 0;
        if (!hasPrimary && !hasExtras) return `Line ${i+1}: choose a service (tire/filter/extra).`;
      }
    }
    return null;
  }

  async function submitAll() {
    const err = validateStep(1) || validateStep(2);
    if (err) { setError(err); setStep( err.includes('Line') ? 2 : 1 ); return; }
    setError(null); setSubmitting(true); setSuccessMsg(null); setResetCountdown(null);

    try {
      const startISO = new Date(slotStartLocal).toISOString();
      const endISO   = new Date(slotEndLocal).toISOString();

      const requests = lines.map((line, idx) => {
        const tireText   = line.tire   ? `${TIRE_SERVICES[line.tire].label} - $${TIRE_SERVICES[line.tire].price}` : 'None';
        const filterText = line.filter ? `${FILTER_SERVICES[line.filter].label} - $${FILTER_SERVICES[line.filter].price}` : 'None';
        const extrasList: string[] = [];
        for (const item of EXTRAS) {
          const sel = line.extras[item.key];
          if (!sel) continue;
          const unit = sel.unitPrice ?? item.unitPrice;
          const qty  = Math.max(1, Math.floor(sel.qty || 1));
          const total = unit * qty;
          extrasList.push(`${item.label} x${qty} @$${unit} = $${total}`);
        }
        const extrasText = extrasList.length ? extrasList.join('; ') : 'None';
        const perLine =
          `Vehicle Line #${idx+1}\n- Tire: ${tireText}\n- TESLA Filter: ${filterText}\n- Extras: ${extrasText}\n- Subtotal: $${lineSubtotal(line)}\n`;
        const finalNotes = (orderNotes?.trim() ? `Order Notes: ${orderNotes.trim()}\n` : '') + perLine;

        return apiPost<Appointment>('/appointments', {
          userId,
          vehicleId: line.vehicleId,
          slotStart: startISO,
          slotEnd:   endISO,
          address,
          notes: finalNotes,
        });
      });

      const results = await Promise.allSettled(requests);
      const ok = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<Appointment>[];
      const fail = results.filter(r => r.status === 'rejected')  as PromiseRejectedResult[];

      const summary = fail.length
        ? `Created ${ok.length} appointment(s). Failed ${fail.length}.`
        : `Created ${ok.length} appointment(s).`;
      setSuccessMsg(summary);
      if (ok.length > 0 && fail.length === 0) {
        setResetCountdown(3);
      }
      if (onSuccess) onSuccess(ok.map(r => r.value));
      setStep(3);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create appointments');
    } finally {
      setSubmitting(false);
    }
  }

  async function createVehicleForLine(lineIndex: number) {
    if (!userId) { setError('Create customer first.'); return; }
    const mk = newVehicle.make.trim();
    const md = newVehicle.model.trim();
    const yr = parseInt(newVehicle.year, 10);
    if (!mk || !md || !Number.isFinite(yr)) {
      setError('Please fill make, model, and year.');
      return;
    }
    setError(null);
    setCreatingVehicle(true);
    try {
      const created = await apiPost<Vehicle>('/vehicles', {
        userId,
        make: mk,
        model: md,
        year: yr,
        trim: 'Standard',
        tireSize: 'N/A',
      });
      setVehicles(prev => [...prev, created]);
      updateLine(lineIndex, 'vehicleId', created.id);
      setShowAddVehicleForLine(null);
      setNewVehicle({ make: '', model: '', year: '' });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create vehicle');
    } finally {
      setCreatingVehicle(false);
    }
  }

  async function ensureUser(name: string, email: string, phone?: string): Promise<string> {
    const list = await apiGet<User[]>('/users');
    const found = list.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) return found.id;
    const tempPassword = Math.random().toString(36).slice(2, 10) + 'Aa1!';
    const created = await apiPost<User>('/users', { name, email, password: tempPassword, phone });
    return created.id;
  }

  if (loading) return <div className="info">Loading…</div>;

  return (
    <div className="page">
      <div className="header">
        <div className="steps">
          <span className={step>=1?'active':''}>1. Customer & Time</span>
          <span className={step>=2?'active':''}>2. Vehicles & Services</span>
          <span className={step>=3?'active':''}>3. Review & Submit</span>
        </div>
        {error && <div className="error">{error}</div>}
        {successMsg && (
          <div className="success">
            {successMsg}
            {resetCountdown !== null && resetCountdown > 0 && (
              <div className="countdown">Returning to Step 1 in {resetCountdown}s…</div>
            )}
          </div>
        )}
      </div>

      <div className="content">
        <div className="main">
          {step === 1 && (
            <section className="card">
              <h2>Customer & Schedule</h2>
              <div className="grid2">
                <label>
                  Customer Name
                  <input type="text" placeholder="Jane Doe" value={customerName}
                         onChange={(e)=>{ setCustomerName(e.target.value); }} />
                </label>
                <label>
                  Email
                  <input type="email" placeholder="jane@example.com" value={customerEmail}
                         onChange={(e)=>{ setCustomerEmail(e.target.value); }} />
                </label>
              </div>
              <label>
                Phone (optional)
                <input type="text" placeholder="555-123-4567" value={customerPhone}
                       onChange={(e)=>{ setCustomerPhone(e.target.value); }} />
              </label>

              <div className="grid2">
                <label>
                  Start time
                  <input type="datetime-local" value={slotStartLocal} onChange={(e)=>setSlotStartLocal(e.target.value)} />
                </label>
                <label>
                  End time
                  <input type="datetime-local" value={slotEndLocal} onChange={(e)=>setSlotEndLocal(e.target.value)} />
                </label>
              </div>

              <label>
                Address
                <input type="text" placeholder="123 Main St, Toronto, ON" value={address} onChange={(e)=>setAddress(e.target.value)} />
              </label>

              <div className="nav">
                <button className="primary" onClick={async ()=>{
                  const err = validateStep(1);
                  if (err) { setError(err); return; }
                  try {
                    setCreatingUser(true);
                    const id = await ensureUser(customerName.trim(), customerEmail.trim(), customerPhone.trim() || undefined);
                    setUserId(id);
                    setError(null);
                    setStep(2);
                  } catch (e:any) {
                    setError(e?.message ?? 'Failed to create customer');
                  } finally {
                    setCreatingUser(false);
                  }
                }} disabled={creatingUser}>
                  {creatingUser ? 'Saving customer…' : 'Next →'}
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="card">
              <h2>Vehicles & Services</h2>
              {lines.map((line, idx) => {
                const vlist = vehiclesForUser;
                const subtotal = lineSubtotal(line);
                return (
                  <div key={idx} className="lineCard">
                    <div className="lineHeader">
                      <strong>Vehicle #{idx+1}</strong>
                      <div className="lineActions">
                        <button type="button" className="ghost" onClick={()=>addLine(true)}>Duplicate previous</button>
                        {lines.length>1 && <button type="button" className="link" onClick={()=>removeLine(idx)}>Remove</button>}
                      </div>
                    </div>

                    <label>
                      Vehicle
                      <select value={line.vehicleId} onChange={(e)=>updateLine(idx,'vehicleId',e.target.value)}>
                        <option value="">-- Select vehicle --</option>
                        {vlist.map(v => (
                          <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
                        ))}
                      </select>
                    </label>
                    <div className="mini" style={{display:'flex', gap:8, alignItems:'center'}}>
                      <span>{line.vehicleId ? 'Selected.' : 'No vehicle selected.'}</span>
                      <button
                        type="button"
                        className="link small"
                        onClick={()=>{ setShowAddVehicleForLine(showAddVehicleForLine===idx ? null : idx); setError(null); }}
                      >{showAddVehicleForLine===idx ? 'Cancel add' : '+ Add new vehicle'}</button>
                    </div>
                    {showAddVehicleForLine===idx && (
                      <div className="addVehicle">
                        <label>
                          Year
                          <input type="number" placeholder="e.g., 2023" value={newVehicle.year}
                                 onChange={(e)=>setNewVehicle(v=>({ ...v, year:e.target.value }))} />
                        </label>
                        <label>
                          Make
                          <input type="text" placeholder="e.g., Tesla" value={newVehicle.make}
                                 onChange={(e)=>setNewVehicle(v=>({ ...v, make:e.target.value }))} />
                        </label>
                        <label>
                          Model
                          <input type="text" placeholder="e.g., Model Y" value={newVehicle.model}
                                 onChange={(e)=>setNewVehicle(v=>({ ...v, model:e.target.value }))} />
                        </label>
                        <div className="nav" style={{justifyContent:'flex-start'}}>
                          <button type="button" className="primary" disabled={creatingVehicle}
                                  onClick={()=>createVehicleForLine(idx)}>
                            {creatingVehicle ? 'Adding…' : 'Save vehicle'}
                          </button>
                          <button type="button" className="secondary" onClick={()=>setShowAddVehicleForLine(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                    {(!line.vehicleId) && (
                      <div className="mini" style={{marginTop:4}}>
                        Vehicles are filtered by the created customer. Add the customer first in Step 1.
                      </div>
                    )}

                    <div className="grid2">
                      <div>
                        <div className="groupLabel">Tire Service (optional)</div>
                        <div className="seg">
                          <button type="button" aria-pressed={line.tire==='tire_on_sedan'}   onClick={()=>updateLine(idx,'tire','tire_on_sedan')}>On Rim · Sedan/SUV {money(60)}</button>
                          <button type="button" aria-pressed={line.tire==='tire_off_sedan'}  onClick={()=>updateLine(idx,'tire','tire_off_sedan')}>Off Rim · Sedan/SUV {money(120)}</button>
                          <button type="button" aria-pressed={line.tire==='tire_on_pickup'}  onClick={()=>updateLine(idx,'tire','tire_on_pickup')}>On Rim · Pickup {money(70)}</button>
                          <button type="button" aria-pressed={line.tire==='tire_off_pickup'} onClick={()=>updateLine(idx,'tire','tire_off_pickup')}>Off Rim · Pickup {money(130)}</button>
                          {line.tire && <button type="button" className="link small" onClick={()=>updateLine(idx,'tire','')}>Clear</button>}
                        </div>
                      </div>

                      <div>
                        <div className="groupLabel">TESLA Filters (optional)</div>
                        <div className="seg">
                          <button type="button" aria-pressed={line.filter==='tesla_m3'} onClick={()=>updateLine(idx,'filter','tesla_m3')}>Model 3 {money(95)}</button>
                          <button type="button" aria-pressed={line.filter==='tesla_my'} onClick={()=>updateLine(idx,'filter','tesla_my')}>Model Y {money(150)}</button>
                          <button type="button" aria-pressed={line.filter==='tesla_ms'} onClick={()=>updateLine(idx,'filter','tesla_ms')}>Model S {money(100)}+</button>
                          <button type="button" aria-pressed={line.filter==='tesla_mx'} onClick={()=>updateLine(idx,'filter','tesla_mx')}>Model X {money(100)}+</button>
                          {line.filter && <button type="button" className="link small" onClick={()=>updateLine(idx,'filter','')}>Clear</button>}
                        </div>
                      </div>
                    </div>

                    <div className="extras">
                      <div className="groupLabel">Additional Services</div>
                      {EXTRAS.map(item => {
                        const sel = line.extras[item.key];
                        const selected = !!sel;
                        const qty = sel?.qty ?? item.defaultQty ?? 1;
                        const unit = sel?.unitPrice ?? item.unitPrice;
                        return (
                          <div key={item.key} className="extraRow">
                            <label className="extraLeft">
                              <input type="checkbox" checked={selected} onChange={(e)=>toggleExtra(idx,item.key,e.target.checked)} />
                              <span>{item.label}</span>
                            </label>
                            <div className="extraRight">
                              {item.editablePrice ? (
                                <input type="number" className="priceInput" min={0} value={unit}
                                  onChange={(e)=>setExtraPrice(idx,item.key,Number(e.target.value))} />
                              ) : (
                                <span className="price">{money(unit)}</span>
                              )}
                              {selected && item.unit!=='flat' && (
                                <input type="number" className="qtyInput" min={0} value={qty}
                                  onChange={(e)=>setExtraQty(idx,item.key,Number(e.target.value))} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <small>* Rotation per set; Balancing/Mount/Dismount per tire; TPMS/Hub Clean per wheel.</small>
                    </div>

                    <div className="lineTotal">Subtotal: <strong>{money(subtotal)}</strong></div>
                  </div>
                );
              })}

              <div className="rowBtns">
                <button type="button" className="ghost" onClick={()=>addLine(false)}>+ Add another vehicle</button>
                <button type="button" className="ghost" onClick={()=>addLine(true)}>+ Duplicate previous</button>
              </div>

              <div className="nav">
                <button className="secondary" onClick={()=>setStep(1)}>← Back</button>
                <button className="primary"  onClick={()=>{ const err = validateStep(2); if (err) setError(err); else { setError(null); setStep(3);} }}>Next →</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="card">
              <h2>Review & Submit</h2>
              <label>
                Order Notes (optional)
                <textarea
                  placeholder="e.g., parking code / call on arrival"
                  value={orderNotes} onChange={(e)=>setOrderNotes(e.target.value)}
                />
              </label>
              <div className="nav">
                <button className="secondary" onClick={()=>setStep(2)}>← Back</button>
                <button className="primary" onClick={submitAll} disabled={submitting}>
                  {submitting ? 'Submitting…' : `Create ${lines.length} Appointment(s)`}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="side">
          <div className="card">
            <h3>Estimate</h3>
            {lines.map((l, i) => (
              <div key={i} className="sumRow">
                <span>Vehicle #{i+1}</span>
                <span>{money(lineSubtotal(l))}</span>
              </div>
            ))}
            <div className="sumRow total">
              <strong>Total</strong>
              <strong>{money(orderTotal)}</strong>
            </div>
            <hr />
            <div className="mini">
              <div><b>When</b> {slotStartLocal || '—'} → {slotEndLocal || '—'}</div>
              <div><b>Address</b> {address || '—'}</div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .page { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
        .steps { display:flex; gap:12px; font-size:13px; color:#6b7280; margin-bottom:8px; }
        .steps span { padding:6px 10px; border-radius:999px; background:#f3f4f6; }
        .steps .active { background:#111827; color:#fff; }
        .content { display:grid; grid-template-columns: 2fr 1fr; gap:16px; }
        @media (max-width: 900px){ .content { grid-template-columns: 1fr; } }
        .main { display:flex; flex-direction:column; gap:16px; }
        .side { position: sticky; top: 16px; align-self: start; }
        .card { border:1px solid #e5e7eb; border-radius:12px; padding:14px; background:#fff; }
        h2 { font-size:18px; margin-bottom:12px; }
        h3 { font-size:16px; margin-bottom:8px; }
        label { display:grid; gap:6px; font-size:14px; margin:8px 0; }
        select, input[type="text"], input[type="datetime-local"], textarea, input[type="number"] {
          padding:10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;
        }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .nav { display:flex; justify-content:flex-end; gap:8px; margin-top:8px; }
        .primary { background:#111827; color:#fff; border:none; border-radius:8px; padding:10px 14px; cursor:pointer; }
        .secondary { background:#f3f4f6; color:#111827; border:none; border-radius:8px; padding:10px 14px; cursor:pointer; }
        .ghost { background:#fff; border:1px dashed #9ca3af; color:#111827; border-radius:8px; padding:8px 12px; cursor:pointer; }
        .link { background:none; border:none; color:#2563eb; cursor:pointer; }
        .link.small { font-size:12px; }
        .lineCard { border:1px solid #e5e7eb; border-radius:10px; padding:10px; margin:10px 0; }
        .lineHeader { display:flex; justify-content:space-between; align-items:center; }
        .lineActions { display:flex; gap:8px; }
        .groupLabel { font-weight:600; margin:8px 0 6px; }
        .seg { display:flex; flex-wrap:wrap; gap:6px; }
        .seg button { padding:8px 10px; border:1px solid #d1d5db; border-radius:999px; background:#fff; cursor:pointer; }
        .seg button[aria-pressed="true"] { background:#111827; color:#fff; border-color:#111827; }
        .extras { border-top:1px dashed #e5e7eb; margin-top:8px; padding-top:8px; }
        .extraRow { display:flex; justify-content:space-between; align-items:center; padding:4px 0; }
        .extraLeft { display:flex; align-items:center; gap:8px; }
        .extraRight { display:flex; align-items:center; gap:8px; }
        .price { min-width:72px; text-align:right; display:inline-block; }
        .priceInput, .qtyInput { width:90px; }
        .lineTotal { text-align:right; font-weight:700; padding-top:6px; }
        .rowBtns { display:flex; gap:8px; }
        .sumRow { display:flex; justify-content:space-between; padding:4px 0; }
        .sumRow.total { border-top:1px dashed #e5e7eb; margin-top:6px; padding-top:6px; }
        .mini { color:#6b7280; font-size:12px; display:grid; gap:2px; }
        .error { background:#fee2e2; color:#991b1b; padding:8px 10px; border-radius:8px; margin-bottom:8px; }
        .success { background:#ecfdf5; color:#065f46; padding:8px 10px; border-radius:8px; margin-bottom:8px; }
        .countdown { font-size:12px; margin-top:4px; color:#047857; }
        .addVehicle { border:1px dashed #e5e7eb; border-radius:8px; padding:10px; margin:8px 0; background:#fafafa; }
      `}</style>
    </div>
  );
}
