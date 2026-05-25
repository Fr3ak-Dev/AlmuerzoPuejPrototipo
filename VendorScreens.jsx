// VendorScreens.jsx — Panel vendedora AlmuerzoPuej
// Depends on window: MENU_ITEMS_DATA, MOCK_ORDERS, MOCK_CLIENTS, StatusBar

const { useState } = React;

// ─── BottomNav ───────────────────────────────────────────────────────────────
const BottomNav = ({ tab, setTab }) => {
  const tabs = [
    { id: 'orders', label: 'Pedidos', icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#F97316' : '#B8A090'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    )},
    { id: 'menu', label: 'Menú', icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#F97316' : '#B8A090'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>
    )},
    { id: 'share', label: 'Compartir', icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#F97316' : 'none'} stroke={active ? '#F97316' : '#B8A090'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.95 3.35 2 2 0 0 1 3.93 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    )},
    { id: 'clients', label: 'Clientes', icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#F97316' : '#B8A090'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
  ];

  return (
    <div style={{ display: 'flex', borderTop: '1px solid #F0D8C0', background: '#fff', paddingBottom: 4, flexShrink: 0 }}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 0 6px', background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, position: 'relative',
          }}>
            {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: '#F97316', borderRadius: '0 0 3px 3px' }} />}
            {t.icon(active)}
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? '#F97316' : '#B8A090', fontFamily: 'var(--font)', letterSpacing: 0.2 }}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Flow: pending → received → delivered → confirmed (con método de pago)
const SC = {
  pending:   { label: 'Pendiente',  color: '#EA580C', bg: '#FFF7ED', dot: '#F97316' },
  received:  { label: 'Recibido',   color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
  delivered: { label: 'Entregado',  color: '#6D28D9', bg: '#F5F3FF', dot: '#8B5CF6' },
  confirmed: { label: 'Confirmado', color: '#15803D', bg: '#F0FDF4', dot: '#22C55E' },
  rejected:  { label: 'Rechazado',  color: '#DC2626', bg: '#FEF2F2', dot: '#EF4444' },
};

const PAYMENT = {
  cash: { label: 'Efectivo', short: 'EFECTIVO', icon: '💵', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  qr:   { label: 'QR',       short: 'QR',       icon: '📱', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
};

// ─── OrderCard ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onStatusChange }) => {
  const [open, setOpen] = useState(order.status === 'pending');
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const sc = SC[order.status] || SC.pending;
  const pm = order.payment ? PAYMENT[order.payment] : null;
  const total = order.items.reduce((s, i) => s + i.qty * i.price, 0);
  // Always show initial from name, even for isNewClient
  const initial = (order.name || '?').replace(/^\+/, '')[0].toUpperCase();

  const pickPayment = (method) => {
    setShowPaymentPicker(false);
    onStatusChange(order.id, 'confirmed', method);
  };

  const doReject = () => {
    setShowRejectModal(false);
    onStatusChange(order.id, 'rejected');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(234,88,12,0.07)', border: order.isNew ? '2px solid #F97316' : '2px solid #F0D8C0', transition: 'border-color 0.3s' }}>
      {/* Header row */}
      <div onClick={() => setOpen(!open)} style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: sc.color, flexShrink: 0 }}>
          {order.isNewClient ? initial : order.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1C0A00' }}>{order.name}</span>
            {order.isNewClient && <span style={{ fontSize: 10, fontWeight: 700, background: '#F97316', color: '#fff', borderRadius: 100, padding: '2px 7px' }}>NUEVO</span>}
          </div>
          <div style={{ fontSize: 12, color: '#9A5A2A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{order.items.length} plato{order.items.length > 1 ? 's' : ''} · Bs. {total} · {order.time}</span>
            {pm && (
              <span style={{ background: pm.bg, color: pm.color, borderRadius: 100, padding: '1px 7px', fontSize: 10, fontWeight: 700, border: `1px solid ${pm.border}`, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {pm.icon} {pm.short}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ background: sc.bg, color: sc.color, borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{sc.label}</span>
          <span style={{ color: '#C4956A', fontSize: 14, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop: '1px solid #F5E8D6', padding: '12px 15px 14px', background: '#FFFBF5' }}>
          <a href={`https://wa.me/${order.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, padding: '8px 12px', background: '#DCF8C6', borderRadius: 10, border: '1px solid #B8E7A0', width: 'fit-content', textDecoration: 'none', cursor: 'pointer', transition: 'transform .12s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#075E54"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a6 6 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.054 23.5a.5.5 0 0 0 .614.614l5.738-1.463A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.518-5.166-1.418l-.374-.222-3.854.984.997-3.759-.245-.386A9.954 9.954 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#075E54', letterSpacing: 0.3 }}>{order.phone}</span>
            <span style={{ fontSize: 10, color: '#15803D', fontWeight: 600, marginLeft: 4 }}>↗ chat</span>
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ fontSize: 14, color: '#6B3A1F', display: 'flex', gap: 8 }}>
                <span style={{ color: '#C4956A', fontWeight: 600 }}>×{item.qty}</span>
                <span>{item.name}</span>
                <span style={{ marginLeft: 'auto', color: '#C4956A' }}>Bs. {item.qty * item.price}</span>
              </div>
            ))}
          </div>

          {/* Status-specific hints */}
          {order.status === 'pending' && (
            <div style={{ marginTop: 11, padding: '8px 11px', background: '#F0FDF4', borderRadius: 10, fontSize: 11, color: '#15803D', display: 'flex', gap: 7, alignItems: 'center', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: 13 }}>🔔</span>
              <span style={{ lineHeight: 1.35 }}>Al recibir, el cliente recibirá una notificación automática.</span>
            </div>
          )}

          {/* Pending action */}
          {order.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onStatusChange(order.id, 'received')} style={{ flex: 1, padding: '11px', background: '#F97316', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                ✓ Recibir pedido
              </button>
              <button onClick={() => setShowRejectModal(true)} style={{ padding: '11px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>✕</button>
            </div>
          )}

          {/* Received → Deliver action */}
          {order.status === 'received' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onStatusChange(order.id, 'delivered')} style={{ flex: 1, padding: '11px', background: '#F97316', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                ✓ Marcar entregado
              </button>
              <button onClick={() => setShowRejectModal(true)} style={{ padding: '11px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>✕</button>
            </div>
          )}

          {/* Delivered → Confirm action (with payment picker) */}
          {order.status === 'delivered' && !showPaymentPicker && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowPaymentPicker(true)} style={{ flex: 1, padding: '11px', background: '#22C55E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', boxShadow: '0 2px 8px rgba(34,197,94,.25)' }}>
                ✓ Confirmar pago
              </button>
              <button onClick={() => setShowRejectModal(true)} style={{ padding: '11px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>✕</button>
            </div>
          )}

          {/* Payment picker (shown after pressing Confirmar pago) */}
          {order.status === 'delivered' && showPaymentPicker && (
            <div style={{ marginTop: 12, padding: 12, background: '#FFF7ED', borderRadius: 13, border: '2px solid #FED7AA', animation: 'fadeUp .2s ease' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B3A1F', marginBottom: 9 }}>
                ¿Cómo pagó el cliente?
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => pickPayment('cash')} style={{ flex: 1, padding: '12px 6px', background: '#fff', color: '#15803D', border: '2px solid #BBF7D0', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 22 }}>💵</span>
                  <span>Efectivo</span>
                </button>
                <button onClick={() => pickPayment('qr')} style={{ flex: 1, padding: '12px 6px', background: '#fff', color: '#6D28D9', border: '2px solid #DDD6FE', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 22 }}>📱</span>
                  <span>QR</span>
                </button>
              </div>
              <button onClick={() => setShowPaymentPicker(false)} style={{ marginTop: 8, width: '100%', padding: 8, background: 'transparent', color: '#9A5A2A', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                Cancelar
              </button>
            </div>
          )}

          {order.status === 'confirmed' && (
            <div style={{ marginTop: 12, padding: '11px', textAlign: 'center', color: '#15803D', fontWeight: 700, fontSize: 14, background: '#F0FDF4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ✓ Confirmado {pm && <span style={{ fontSize: 12, opacity: .85 }}>· pago {pm.icon} {pm.label}</span>}
            </div>
          )}
          {order.status === 'rejected' && (
            <div style={{ marginTop: 12, padding: '11px', textAlign: 'center', color: '#DC2626', fontWeight: 700, fontSize: 14, background: '#FEF2F2', borderRadius: 12 }}>✕ Rechazado</div>
          )}
        </div>
      )}

      {/* Reject confirmation bottom-sheet */}
      {showRejectModal && (
        <div onClick={() => setShowRejectModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,4,0,0.52)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '20px 18px 28px', width: '100%', animation: 'fadeUp .18s ease', boxShadow: '0 -6px 28px rgba(0,0,0,.18)' }}>
            <div style={{ width: 36, height: 4, background: '#D4B9A0', borderRadius: 4, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1C0A00', marginBottom: 7 }}>Rechazar pedido</div>
            <div style={{ fontSize: 14, color: '#6B3A1F', lineHeight: 1.55, marginBottom: 20 }}>
              ¿Segura que quieres rechazar el pedido de <strong>{order.name}</strong>?<br/>El cliente será notificado automáticamente.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowRejectModal(false)} style={{ flex: 1, padding: '13px', background: '#F9F4EE', color: '#6B3A1F', border: '2px solid #F0D8C0', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancelar</button>
              <button onClick={doReject} style={{ flex: 1, padding: '13px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>✕ Sí, rechazar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── VendorOrdersScreen ───────────────────────────────────────────────────────
const VendorOrdersScreen = ({ orders, onStatusChange }) => {
  const counts = { pending: 0, received: 0, delivered: 0, confirmed: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F9F4EE' }}>
      <div style={{ background: '#fff', padding: '14px 18px', borderBottom: '1px solid #F0D8C0' }}>
        <div style={{ fontSize: 12, color: '#9A5A2A', fontWeight: 500, marginBottom: 2 }}>Lunes, 25 de mayo</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1C0A00', marginBottom: 12 }}>Pedidos de hoy</div>
        <div style={{ display: 'flex', gap: 7 }}>
          {[
            { label: 'Pendientes',  count: counts.pending,   color: '#EA580C', bg: '#FFF7ED' },
            { label: 'Recibidos',   count: counts.received,  color: '#1D4ED8', bg: '#EFF6FF' },
            { label: 'Entregados',  count: counts.delivered, color: '#6D28D9', bg: '#F5F3FF' },
            { label: 'Confirmados', count: counts.confirmed, color: '#15803D', bg: '#F0FDF4' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 12, padding: '10px 2px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: s.color, lineHeight: 1.3, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.map(o => <OrderCard key={o.id} order={o} onStatusChange={onStatusChange} />)}
      </div>
    </div>
  );
};

// ─── VendorMenuScreen ─────────────────────────────────────────────────────────
const VendorMenuScreen = () => {
  const items = window.useMenu();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('Segundo');
  const [saved, setSaved] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const CATS = ['Segundo', 'Postre', 'Otro'];
  const inp = { padding: '9px 12px', border: '2px solid #F0D8C0', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font)', color: '#1C0A00', background: '#fff', outline: 'none' };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F9F4EE' }}>
      <div style={{ background: '#fff', padding: '14px 18px', borderBottom: '1px solid #F0D8C0' }}>
        <div style={{ fontSize: 12, color: '#9A5A2A', fontWeight: 500, marginBottom: 2 }}>Lunes, 25 de mayo</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1C0A00' }}>Menú de hoy</div>
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Photo placeholder */}
        <div style={{ height: 130, borderRadius: 18, background: 'repeating-linear-gradient(-45deg,#FED7AA,#FED7AA 9px,#FFEDD5 9px,#FFEDD5 18px)', border: '2px dashed #F97316', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer' }}>
          <span style={{ fontSize: 30 }}>📸</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#C2652A', fontFamily: 'monospace' }}>toca para agregar foto del menú</span>
        </div>

        {/* Dishes */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(234,88,12,0.07)' }}>
          <div style={{ padding: '12px 15px', borderBottom: '1px solid #F0D8C0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1C0A00' }}>Platos del día</span>
            <span style={{ fontSize: 13, color: '#9A5A2A' }}>{items.length} platos</span>
          </div>

          {items.map((item, idx) => (
            <div key={item.id} style={{ padding: '11px 15px', borderBottom: idx < items.length - 1 ? '1px solid #F5EDE3' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input defaultValue={item.name} style={{ ...inp, fontWeight: 600, fontSize: 14, width: '100%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#9A5A2A', fontWeight: 600 }}>Bs.</span>
                  <input defaultValue={item.price} type="number" style={{ ...inp, width: 72 }} />
                  <span style={{ fontSize: 11, color: '#C4956A' }}></span>
                </div>
              </div>
              <button onClick={() => setDeleteTarget({ id: item.id, name: item.name })} style={{ padding: '6px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>✕</button>
            </div>
          ))}

          {showAdd ? (
            <div style={{ padding: '12px 15px', background: '#FFF7ED', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input style={{ ...inp, width: '100%' }} placeholder="Nombre del plato" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" style={{ ...inp, flex: 1 }} placeholder="Precio Bs. *" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
                <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ ...inp, flex: 1, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path fill='%23C4956A' d='M0 0l5 6 5-6z'/></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28 }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { if (newName && newPrice) { window.setMenu([...items, { id: Date.now(), name: newName, price: parseFloat(newPrice), emoji: '🍽️', cat: newCat, stock: 10 }]); setNewName(''); setNewPrice(''); setNewCat('Segundo'); setShowAdd(false); } }} disabled={!newName || !newPrice} style={{ flex: 1, padding: '9px 14px', background: newName && newPrice ? '#F97316' : '#FED7AA', color: '#fff', border: 'none', borderRadius: 10, cursor: newName && newPrice ? 'pointer' : 'default', fontWeight: 700, fontFamily: 'var(--font)', transition: 'background .15s' }}>+ Agregar</button>
                <button onClick={() => { setShowAdd(false); setNewName(''); setNewPrice(''); setNewCat('Segundo'); }} style={{ padding: '9px 12px', background: '#fff', color: '#9A5A2A', border: '2px solid #F0D8C0', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font)' }}>✕</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '13px', background: 'none', border: 'none', cursor: 'pointer', color: '#F97316', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              + Agregar plato
            </button>
          )}
        </div>

        <button onClick={handleSave} style={{ padding: '16px', background: saved ? '#15803D' : '#F97316', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'background 0.35s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {saved ? '✓ Menú guardado' : 'Guardar menú'}
        </button>
      </div>

      {/* Delete dish confirmation modal */}
      {deleteTarget && (
        <div onClick={() => setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,4,0,0.52)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '20px 18px 28px', width: '100%', animation: 'fadeUp .18s ease', boxShadow: '0 -6px 28px rgba(0,0,0,.18)' }}>
            <div style={{ width: 36, height: 4, background: '#D4B9A0', borderRadius: 4, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1C0A00', marginBottom: 7 }}>Eliminar plato</div>
            <div style={{ fontSize: 14, color: '#6B3A1F', lineHeight: 1.55, marginBottom: 20 }}>
              ¿Segura que quieres eliminar <strong>{deleteTarget.name}</strong> del menú de hoy?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '13px', background: '#F9F4EE', color: '#6B3A1F', border: '2px solid #F0D8C0', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancelar</button>
              <button onClick={() => { window.setMenu(items.filter(i => i.id !== deleteTarget.id)); setDeleteTarget(null); }} style={{ flex: 1, padding: '13px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>✕ Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── VendorShareScreen ────────────────────────────────────────────────────────
const DEFAULT_INTRO = `🍲 Hola 👋\n\nYa está listo el menú de hoy.`;

const VendorShareScreen = ({ businessName }) => {
  const [useDefault, setUseDefault] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [attachPhoto, setAttachPhoto] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [shared, setShared] = useState(false);

  const intro = (useDefault ? DEFAULT_INTRO : customMsg).trim();
  const menuText = window.__menuStore.items.map(i => `• ${i.name} — Bs. ${i.price}`).join('\n');
  const fullMessage = `${intro || DEFAULT_INTRO} de *${businessName || 'El Sabor de René (Kimberly)'}*:\n\n${menuText}\n\n👇 Haz tu pedido aquí:\nalmuerzopuej.com/kimberly`;

  const canPreview = useDefault || customMsg.trim().length > 0;

  const handleSend = () => {
    setShared(true);
    setTimeout(() => { setShared(false); setShowPreview(false); }, 1800);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F9F4EE', position: 'relative' }}>
      <div style={{ background: '#fff', padding: '14px 18px', borderBottom: '1px solid #F0D8C0' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1C0A00' }}>Compartir menú</div>
        <div style={{ fontSize: 13, color: '#9A5A2A', marginTop: 2 }}>Comparte el menú de hoy por WhatsApp</div>
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Message composer */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px 16px 14px', boxShadow: '0 2px 12px rgba(234,88,12,0.07)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1C0A00' }}>Tu mensaje</div>
          <div style={{ fontSize: 12, color: '#9A5A2A', marginTop: 3, lineHeight: 1.45 }}>
            Lo que escribas será el saludo. El menú y el link se agregan automáticamente.
          </div>

          {/* Textarea */}
          <div style={{ marginTop: 12 }}>
            <textarea
              value={useDefault ? DEFAULT_INTRO : customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              disabled={useDefault}
              placeholder={`Ej:\n¡Hola! Hoy tenemos algo riquísimo 😋`}
              style={{ width: '100%', minHeight: 110, padding: '12px 14px', border: '2px solid #F0D8C0', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font)', color: useDefault ? '#9A5A2A' : '#1C0A00', background: useDefault ? '#FAF6F0' : '#FFFBF5', resize: 'none', outline: 'none', lineHeight: 1.55, boxSizing: 'border-box', transition: 'background .15s, color .15s' }}
            />
            {!useDefault && (
              <div style={{ fontSize: 11, color: '#C4956A', marginTop: 5, paddingLeft: 4 }}>
                {customMsg.length} caracteres
              </div>
            )}
          </div>

          {/* Default checkbox — below textarea */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 12, padding: '10px 12px', background: useDefault ? '#FFF7ED' : '#FAF6F0', borderRadius: 12, border: useDefault ? '2px solid #FED7AA' : '2px solid #F0D8C0', cursor: 'pointer', transition: 'all .15s' }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: useDefault ? '#F97316' : '#fff', border: useDefault ? 'none' : '2px solid #C4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
              {useDefault && <span style={{ color: '#fff', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>✓</span>}
            </div>
            <input type="checkbox" checked={useDefault} onChange={e => setUseDefault(e.target.checked)} style={{ display: 'none' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1C0A00' }}>Usar mensaje por defecto</div>
              <div style={{ fontSize: 11, color: '#9A5A2A', marginTop: 1 }}>🍲 Hola 👋 · Ya está listo el menú de hoy.</div>
            </div>
          </label>

          {/* Attach photo checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 8, padding: '10px 12px', background: attachPhoto ? '#FFF7ED' : '#FAF6F0', borderRadius: 12, border: attachPhoto ? '2px solid #FED7AA' : '2px solid #F0D8C0', cursor: 'pointer', transition: 'all .15s' }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: attachPhoto ? '#F97316' : '#fff', border: attachPhoto ? 'none' : '2px solid #C4956A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
              {attachPhoto && <span style={{ color: '#fff', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>✓</span>}
            </div>
            <input type="checkbox" checked={attachPhoto} onChange={e => setAttachPhoto(e.target.checked)} style={{ display: 'none' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1C0A00' }}>Adjuntar foto del menú 📸</div>
              <div style={{ fontSize: 11, color: '#9A5A2A', marginTop: 1 }}>La imagen del menú de hoy se enviará con el mensaje.</div>
            </div>
          </label>
        </div>

        {/* Info hint */}
        <div style={{ background: '#FFF7ED', borderRadius: 14, padding: '11px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', border: '1px solid #FED7AA' }}>
          <span style={{ fontSize: 18 }}>ℹ️</span>
          <div style={{ fontSize: 12, color: '#6B3A1F', lineHeight: 1.5 }}>
            Al compartir verás una <strong>vista previa</strong> con el menú completo y el link de pedidos antes de enviar.
          </div>
        </div>

        {/* Share CTA */}
        <button
          onClick={() => canPreview && setShowPreview(true)}
          disabled={!canPreview}
          style={{ padding: '17px', background: canPreview ? '#25D366' : '#A7E3BD', color: '#fff', border: 'none', borderRadius: 16, fontSize: 17, fontWeight: 800, cursor: canPreview ? 'pointer' : 'default', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: canPreview ? '0 4px 18px rgba(37,211,102,0.30)' : 'none', transition: 'background 0.25s' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a6 6 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.054 23.5a.5.5 0 0 0 .614.614l5.738-1.463A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.65-.518-5.166-1.418l-.374-.222-3.854.984.997-3.759-.245-.386A9.954 9.954 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/></svg>
          Compartir en WhatsApp
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div onClick={() => !shared && setShowPreview(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 4, 0, 0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 200, animation: 'fadeUp .18s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#F9F4EE', borderRadius: '24px 24px 0 0', padding: '12px 14px 16px', maxHeight: '88%', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 30px rgba(0,0,0,0.20)' }}>
            {/* Grabber */}
            <div style={{ width: 40, height: 4, background: '#D4B9A0', borderRadius: 4, margin: '2px auto 12px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1C0A00' }}>Vista previa</div>
                <div style={{ fontSize: 12, color: '#9A5A2A', marginTop: 1 }}>¿Está bien? Confirma para enviar.</div>
              </div>
              <button onClick={() => setShowPreview(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#FFF7ED', color: '#9A5A2A', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* WhatsApp-style preview */}
            <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(234,88,12,0.07)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ background: '#075E54', padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>DC</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{businessName || 'El Sabor de René (Kimberly)'}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>almuerzopuej.com/kimberly</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px', background: '#E5DDD5', flex: 1, overflowY: 'auto' }}>
                <div style={{ background: '#DCF8C6', borderRadius: '4px 14px 14px 14px', padding: attachPhoto ? '5px 5px 8px' : '10px 14px', maxWidth: '92%' }}>
                  {attachPhoto && (
                    <div style={{ height: 130, borderRadius: '10px 10px 4px 4px', background: 'repeating-linear-gradient(-45deg,#FED7AA,#FED7AA 9px,#FFEDD5 9px,#FFEDD5 18px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 6, position: 'relative', overflow: 'hidden' }}>
                      <span style={{ fontSize: 28 }}>📸</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#C2652A', fontFamily: 'monospace' }}>foto del menú de hoy</span>
                      <div style={{ position: 'absolute', bottom: 5, right: 7, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 600 }}>📷 IMG</div>
                    </div>
                  )}
                  <div style={{ padding: attachPhoto ? '4px 9px 0' : '0' }}>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#1A1A1A', fontFamily: 'var(--font)', lineHeight: 1.55, margin: 0 }}>{fullMessage}</pre>
                    <div style={{ fontSize: 11, color: '#777', textAlign: 'right', marginTop: 5 }}>12:05</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setShowPreview(false)}
                disabled={shared}
                style={{ padding: '13px 18px', background: '#fff', color: '#9A5A2A', border: '2px solid #F0D8C0', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: shared ? 'default' : 'pointer', fontFamily: 'var(--font)' }}>
                ← Editar
              </button>
              <button
                onClick={handleSend}
                disabled={shared}
                style={{ flex: 1, padding: '13px', background: shared ? '#166534' : '#25D366', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: shared ? 'default' : 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 4px 16px rgba(37,211,102,.30)', transition: 'background .25s' }}>
                {shared ? '✓ ¡Abriendo WhatsApp!' : 'Sí, enviar →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── VendorClientsScreen ──────────────────────────────────────────────────────
const VendorClientsScreen = () => {
  const [clients, setClients] = useState(window.MOCK_CLIENTS.map(c => ({ ...c })));
  const [invited, setInvited] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const doInvite = (id) => {
    setInvited(p => [...p, id]);
    setTimeout(() => setInvited(p => p.filter(i => i !== id)), 2200);
  };

  const fmt = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    return d.length <= 4 ? d : d.slice(0, 4) + ' ' + d.slice(4);
  };

  const openEdit = (c) => { setEditId(c.id); setEditName(c.name); setEditPhone(c.phone.replace('+591 ', '')); setShowAdd(false); };
  const saveEdit = () => {
    setClients(prev => prev.map(c => c.id === editId ? { ...c, name: editName.trim() || c.name, phone: '+591 ' + editPhone } : c));
    setEditId(null);
  };

  const phoneDigits = newPhone.replace(/\D/g, '');
  const canAdd = newName.trim().length > 1 && phoneDigits.length === 8;

  const addClient = () => {
    if (!canAdd) return;
    setClients(prev => [
      { id: Date.now(), name: newName.trim(), phone: '+591 ' + fmt(phoneDigits), orders: 0, lastOrder: 'nunca', isNew: true, isFrequent: false },
      ...prev,
    ]);
    setNewName(''); setNewPhone(''); setShowAdd(false);
  };

  const newCount = clients.filter(c => c.isNew).length;

  const inp = { padding: '11px 13px', border: '2px solid #F0D8C0', borderRadius: 11, fontSize: 14, fontFamily: 'var(--font)', color: '#1C0A00', background: '#fff', outline: 'none' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F9F4EE' }}>
      <div style={{ background: '#fff', padding: '14px 18px', borderBottom: '1px solid #F0D8C0', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1C0A00' }}>Clientes</div>
        </div>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} style={{ padding: '9px 14px', background: '#F97316', color: '#fff', border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 8px rgba(249,115,22,.25)' }}>
            + Agregar
          </button>
        )}
      </div>

      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Total',      count: clients.length, color: '#EA580C', bg: '#FFF7ED' },
            { label: 'Nuevos hoy', count: newCount,       color: '#6D28D9', bg: '#F5F3FF' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '14px 8px', textAlign: 'center', boxShadow: '0 2px 10px rgba(234,88,12,0.06)', border: `2px solid ${s.bg}` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginTop: 5, lineHeight: 1.2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add client form */}
        {showAdd && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '15px', boxShadow: '0 2px 12px rgba(234,88,12,0.07)', border: '2px solid #FED7AA', animation: 'fadeUp .18s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>👤</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1C0A00' }}>Nuevo cliente</span>
            </div>

            <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }} placeholder="Nombre" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />

            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, border: '2px solid #F0D8C0', borderRadius: 11, background: '#fff', padding: '4px 4px 4px 12px' }}>
              <span style={{ fontSize: 16 }}>🇧🇴</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#6B3A1F' }}>+591</span>
              <input type="tel" inputMode="numeric" maxLength={9} placeholder="7XXX XXXX" value={newPhone} onChange={e => setNewPhone(fmt(e.target.value))} style={{ flex: 1, padding: '11px 10px', border: 'none', fontSize: 15, fontFamily: 'var(--font)', fontWeight: 700, color: '#1C0A00', background: 'transparent', outline: 'none', letterSpacing: 0.5, minWidth: 0 }} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => { setShowAdd(false); setNewName(''); setNewPhone(''); }} style={{ padding: '10px 16px', background: '#fff', color: '#9A5A2A', border: '2px solid #F0D8C0', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancelar</button>
              <button onClick={addClient} disabled={!canAdd} style={{ flex: 1, padding: '10px', background: canAdd ? '#F97316' : '#FED7AA', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: canAdd ? 'pointer' : 'default', fontFamily: 'var(--font)', transition: 'background .15s' }}>
                ✓ Guardar cliente
              </button>
            </div>
          </div>
        )}

        {/* Invite config hint */}
        <div style={{ background: '#FFF7ED', borderRadius: 14, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #FED7AA' }}>
          <span style={{ fontSize: 22 }}>💬</span>
          <div style={{ fontSize: 13, color: '#6B3A1F', lineHeight: 1.45 }}>
            <strong>Invitar al grupo:</strong> Toca "Invitar" para enviar el link de tu grupo de WhatsApp a un cliente.
          </div>
        </div>

        {/* Client list */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(234,88,12,0.07)' }}>
          {clients.map((c, i) => (
            <React.Fragment key={c.id}>
              <div style={{ padding: '13px 15px', borderBottom: (editId === c.id || i < clients.length - 1) ? '1px solid #F5EDE3' : 'none', display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: c.isNew ? '#F5F3FF' : '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: c.isNew ? '#6D28D9' : '#EA580C', flexShrink: 0 }}>
                {c.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1C0A00' }}>{c.name}</span>
                  {c.isNew && <span style={{ fontSize: 9, fontWeight: 700, background: '#6D28D9', color: '#fff', borderRadius: 100, padding: '2px 6px' }}>NUEVO</span>}
                </div>
                {c.orders > 0 ? (
                  <div style={{ fontSize: 12, color: '#9A5A2A', marginTop: 2 }}>{c.orders} pedido{c.orders === 1 ? '' : 's'} · Último: {c.lastOrder}</div>
                ) : (
                  <div style={{ fontSize: 12, color: '#C4956A', marginTop: 2 }}>Sin pedidos aún</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => editId === c.id ? setEditId(null) : openEdit(c)} style={{ padding: '8px 10px', background: editId === c.id ? '#FFF7ED' : '#FFF7ED', color: '#EA580C', border: '2px solid #FED7AA', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>✏️</button>
                <button onClick={() => doInvite(c.id)} style={{ padding: '8px 11px', background: '#F0FDF4', color: '#15803D', border: '2px solid #BBF7D0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap' }}>
                  {invited.includes(c.id) ? '✓' : '💬'}
                </button>
              </div>
            </div>
            {editId === c.id && (
              <div style={{ padding: '0 15px 14px', background: '#FFFBF5', borderTop: '1px solid #F5EDE3', animation: 'fadeUp .15s ease' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
                  <input style={{ padding: '10px 12px', border: '2px solid #F0D8C0', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font)', color: '#1C0A00', background: '#fff', outline: 'none' }} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, border: '2px solid #F0D8C0', borderRadius: 10, background: '#fff', padding: '4px 4px 4px 11px' }}>
                    <span style={{ fontSize: 14 }}>🇧🇴</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#6B3A1F' }}>+591</span>
                    <input type="tel" inputMode="numeric" maxLength={9} value={editPhone} onChange={e => setEditPhone(fmt(e.target.value))} style={{ flex: 1, padding: '9px 8px', border: 'none', fontSize: 14, fontFamily: 'var(--font)', fontWeight: 700, color: '#1C0A00', background: 'transparent', outline: 'none', letterSpacing: 0.4, minWidth: 0 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditId(null)} style={{ flex: 1, padding: '9px', background: '#fff', color: '#9A5A2A', border: '2px solid #F0D8C0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancelar</button>
                    <button onClick={saveEdit} style={{ flex: 1, padding: '9px', background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>✓ Guardar</button>
                  </div>
                </div>
              </div>
            )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── VendorApp ────────────────────────────────────────────────────────────────
const VendorApp = ({ businessName }) => {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState(window.MOCK_ORDERS.map(o => ({ ...o })));
  const [toast, setToast] = useState(null);

  const updateStatus = (id, status, payment) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, isNew: false, payment: payment || o.payment } : o));
    const order = orders.find(o => o.id === id);
    if (order) {
      if (status === 'received')                         setToast({ kind: 'ok',   icon: '✓',  text: `Pedido recibido · ${order.phone} notificado` });
      if (status === 'delivered')                        setToast({ kind: 'ok',   icon: '🎉', text: `${order.name} marcado como entregado` });
      if (status === 'confirmed' && payment === 'cash')  setToast({ kind: 'ok',   icon: '💵', text: `Pago confirmado en efectivo` });
      if (status === 'confirmed' && payment === 'qr')    setToast({ kind: 'ok',   icon: '📱', text: `Pago confirmado por QR` });
      if (status === 'rejected')                         setToast({ kind: 'warn', icon: '✕',  text: `Pedido rechazado · Cliente notificado` });
      setTimeout(() => setToast(null), 3200);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case 'orders':  return <VendorOrdersScreen orders={orders} onStatusChange={updateStatus} />;
      case 'menu':    return <VendorMenuScreen />;
      case 'share':   return <VendorShareScreen businessName={businessName} />;
      case 'clients': return <VendorClientsScreen />;
      default:        return null;
    }
  };

  const SB = window.StatusBar;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F9F4EE', overflow: 'hidden' }}>
      {/* Vendor header — status bar lives inside so it sits on orange */}
      <div style={{ background: '#F97316', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {SB && <SB light={true} />}
        <div style={{ position: 'absolute', top: 10, right: -25, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 60, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'relative', padding: '0 18px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>DC</div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Panel vendedora</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{businessName || 'El Sabor de René (Kimberly)'}</div>
          </div>
          <div style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 100, padding: '5px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86EFAC' }} />
            Abierta
          </div>
        </div>
      </div>
      {renderContent()}
      {toast && (
        <div style={{ position: 'absolute', top: 78, left: 14, right: 14, background: toast.kind === 'ok' ? '#15803D' : '#B91C1C', color: '#fff', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,.25)', zIndex: 100, animation: 'fadeUp .25s ease' }}>
          <span style={{ fontSize: 16 }}>{toast.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>{toast.text}</span>
        </div>
      )}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
};

Object.assign(window, { VendorApp });
