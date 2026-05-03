import { useState, useMemo } from 'react';
import '../styles/HistoryPage.css';

const sales = [];
// ──────────────────────────────────────────────────

const PAYMENT_METHODS = ['All', 'Cash', 'Card', 'Telebirr', 'CBE Birr'];

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function printReceipt(sale) {
  const w = window.open('', '_blank', 'width=380,height=600');
  const snackRows = (sale.items || []).map(i =>
    `<tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">ETB ${i.price * i.qty}</td></tr>`
  ).join('');
  w.document.write(`
    <html><head><title>Receipt #${sale.id}</title>
    <style>
      body { font-family: 'Courier New', monospace; padding: 24px; color: #111; font-size: 13px; }
      h2 { text-align:center; letter-spacing:0.1em; margin-bottom:4px; }
      .center { text-align:center; color:#555; margin-bottom:16px; font-size:11px; }
      hr { border:none; border-top:1px dashed #ccc; margin:12px 0; }
      table { width:100%; border-collapse:collapse; }
      td { padding:4px 0; }
      .total { font-weight:bold; font-size:14px; }
      .footer { text-align:center; color:#888; margin-top:16px; font-size:11px; }
    </style></head><body>
    <h2>SMARTSEAT CINEMA</h2>
    <div class="center">Receipt #${sale.id} · ${fmt(sale.date)}</div>
    <hr/>
    ${sale.type === 'ticket' ? `
      <table>
        <tr><td>Movie</td><td style="text-align:right">${sale.movie || '—'}</td></tr>
        <tr><td>Hall</td><td style="text-align:right">${sale.hall || '—'}</td></tr>
        <tr><td>Showtime</td><td style="text-align:right">${sale.time || '—'}</td></tr>
        <tr><td>Seats</td><td style="text-align:right">${(sale.seats || []).join(', ') || '—'}</td></tr>
        <tr><td>Customer</td><td style="text-align:right">${sale.customer || 'Walk-in'}</td></tr>
      </table>
    ` : `
      <table>
        <tr><td><b>Item</b></td><td style="text-align:center"><b>Qty</b></td><td style="text-align:right"><b>Amount</b></td></tr>
        ${snackRows}
      </table>
    `}
    <hr/>
    <table>
      <tr><td>Payment</td><td style="text-align:right">${sale.payment}</td></tr>
      <tr class="total"><td>TOTAL</td><td style="text-align:right">ETB ${sale.total}</td></tr>
    </table>
    <div class="footer">Thank you for visiting!</div>
    </body></html>
  `);
  w.document.close();
  w.print();
}

function exportCSV(data) {
  const headers = ['ID', 'Type', 'Date', 'Movie', 'Hall', 'Showtime', 'Seats', 'Customer', 'Snack Items', 'Payment', 'Total (ETB)'];
  const rows = data.map(s => [
    s.id, s.type, fmt(s.date),
    s.movie || '', s.hall || '', s.time || '',
    (s.seats || []).join(' '),
    s.customer || '',
    (s.items || []).map(i => `${i.name}×${i.qty}`).join(' | '),
    s.payment, s.total,
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sales-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

export default function HistoryPage() {
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('All');   // All | ticket | snack
  const [payFilter, setPayFilter]   = useState('All');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');
  const [detail, setDetail]         = useState(null);
  const [page, setPage]             = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    return sales.filter(s => {
      const q = search.toLowerCase();
      const matchSearch =
        (s.movie  || '').toLowerCase().includes(q) ||
        (s.customer || '').toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        (s.items || []).some(i => i.name.toLowerCase().includes(q));
      const matchType = typeFilter === 'All' || s.type === typeFilter;
      const matchPay  = payFilter  === 'All' || s.payment === payFilter;
      const d = new Date(s.date);
      const matchFrom = !dateFrom || d >= new Date(dateFrom);
      const matchTo   = !dateTo   || d <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchType && matchPay && matchFrom && matchTo;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [search, typeFilter, payFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalRevenue = filtered.reduce((s, r) => s + Number(r.total || 0), 0);
  const ticketCount  = filtered.filter(r => r.type === 'ticket').length;
  const snackCount   = filtered.filter(r => r.type === 'snack').length;

  const resetFilters = () => {
    setSearch(''); setTypeFilter('All'); setPayFilter('All');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  return (
    <div className="hy-page">

    
      <div className="hy-topbar">
        <div className="hy-filters">
         

          <select className="hy-filter" value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="All">All Types</option>
            <option value="ticket">Tickets</option>
            <option value="snack">Snacks</option>
          </select>

          <select className="hy-filter" value={payFilter}
            onChange={e => { setPayFilter(e.target.value); setPage(1); }}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>

          <input className="hy-filter hy-date" type="date" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          <span className="hy-date-sep">→</span>
          <input className="hy-filter hy-date" type="date" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }} />

          {(search || typeFilter !== 'All' || payFilter !== 'All' || dateFrom || dateTo) && (
            <button className="hy-reset-btn" onClick={resetFilters}>Clear</button>
          )}
        </div>

        <button className="hy-export-btn" onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}>
          ↓ Export CSV
        </button>
      </div>

     
      <div className="hy-summary">
        <div className="hy-sum-card">
          <span className="hy-sum-label">Total Records</span>
          <span className="hy-sum-val">{filtered.length}</span>
        </div>
        <div className="hy-sum-card">
          <span className="hy-sum-label">Ticket Sales</span>
          <span className="hy-sum-val">{ticketCount}</span>
        </div>
        <div className="hy-sum-card">
          <span className="hy-sum-label">Snack Sales</span>
          <span className="hy-sum-val">{snackCount}</span>
        </div>
        <div className="hy-sum-card hy-sum-card--accent">
          <span className="hy-sum-label">Total Revenue</span>
          <span className="hy-sum-val">ETB {totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      
      {filtered.length === 0 ? (
        <div className="hy-empty">
          <p className="hy-empty-title">{sales.length === 0 ? 'No sales recorded yet' : 'No results found'}</p>
          <p className="hy-empty-sub">
            {sales.length === 0
              ? 'Sales will appear here once tickets or snacks are sold'
              : 'Try adjusting your filters'}
          </p>
          {sales.length > 0 && <button className="hy-reset-btn" onClick={resetFilters}>Clear Filters</button>}
        </div>
      ) : (
        <>
          <div className="hy-table-wrap">
            <table className="hy-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th>Details</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(s => (
                  <tr key={s.id} className="hy-row" onClick={() => setDetail(s)}>
                    <td className="hy-id">#{s.id}</td>
                    <td>
                      <span className={`hy-type-badge hy-type--${s.type}`}>
                        {s.type === 'ticket' ? 'Ticket' : 'Snack'}
                      </span>
                    </td>
                    <td className="hy-date-cell">{fmt(s.date)}</td>
                    <td className="hy-details-cell">
                      {s.type === 'ticket'
                        ? <>{s.movie || '—'} <span className="hy-sub">· {s.hall} · {s.time}</span></>
                        : <span className="hy-sub">{(s.items || []).map(i => `${i.name} ×${i.qty}`).join(', ') || '—'}</span>
                      }
                    </td>
                    <td className="hy-customer">{s.customer || <span className="hy-sub">Walk-in</span>}</td>
                    <td><span className="hy-pay-tag">{s.payment}</span></td>
                    <td className="hy-total">ETB {Number(s.total).toLocaleString()}</td>
                    <td>
                      <button className="hy-view-btn" onClick={e => { e.stopPropagation(); setDetail(s); }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

         
          {totalPages > 1 && (
            <div className="hy-pagination">
              <button className="hy-page-btn" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}>← Prev</button>
              <div className="hy-page-nums">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n}
                    className={`hy-page-num${page === n ? ' active' : ''}`}
                    onClick={() => setPage(n)}>{n}</button>
                ))}
              </div>
              <button className="hy-page-btn" disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

     
      {detail && (
        <div className="hy-overlay" onClick={() => setDetail(null)}>
          <div className="hy-modal" onClick={e => e.stopPropagation()}>

            <div className="hy-modal-head">
              <div>
                <span className={`hy-type-badge hy-type--${detail.type}`}>
                  {detail.type === 'ticket' ? 'Ticket Sale' : 'Snack Sale'}
                </span>
                <h2 className="hy-modal-title">Sale #{detail.id}</h2>
              </div>
              <div className="hy-modal-head-right">
                <button className="hy-print-btn" onClick={() => printReceipt(detail)}>
                  🖨 Print Receipt
                </button>
                <button className="hy-modal-close" onClick={() => setDetail(null)}>✕</button>
              </div>
            </div>

            <div className="hy-modal-body">
              <div className="hy-modal-section">
                <p className="hy-modal-section-title">Transaction Info</p>
                <div className="hy-dlist">
                  <div className="hy-drow"><span>Date & Time</span><strong>{fmt(detail.date)}</strong></div>
                  <div className="hy-drow"><span>Payment</span><strong>{detail.payment}</strong></div>
                  <div className="hy-drow"><span>Customer</span><strong>{detail.customer || 'Walk-in'}</strong></div>
                </div>
              </div>

              {detail.type === 'ticket' && (
                <div className="hy-modal-section">
                  <p className="hy-modal-section-title">Ticket Details</p>
                  <div className="hy-dlist">
                    <div className="hy-drow"><span>Movie</span><strong>{detail.movie || '—'}</strong></div>
                    <div className="hy-drow"><span>Hall</span><strong>{detail.hall || '—'}</strong></div>
                    <div className="hy-drow"><span>Showtime</span><strong>{detail.time || '—'}</strong></div>
                    <div className="hy-drow"><span>Seats</span>
                      <strong>
                        <div className="hy-seat-tags">
                          {(detail.seats || []).map(s => <span key={s} className="hy-seat-tag">{s}</span>)}
                        </div>
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {detail.type === 'snack' && (detail.items || []).length > 0 && (
                <div className="hy-modal-section">
                  <p className="hy-modal-section-title">Snack Items</p>
                  <table className="hy-items-table">
                    <thead>
                      <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                      {detail.items.map((it, i) => (
                        <tr key={i}>
                          <td>{it.name}</td>
                          <td className="hy-center">{it.qty}</td>
                          <td className="hy-center">ETB {it.price}</td>
                          <td className="hy-right">ETB {it.price * it.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="hy-modal-total">
                <span>GRAND TOTAL</span>
                <span className="hy-modal-total-val">ETB {Number(detail.total).toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}