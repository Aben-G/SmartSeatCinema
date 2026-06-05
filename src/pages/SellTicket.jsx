import { useState, useEffect } from "react";
import "../styles/sellTicket.css";

const API_BASE = 'http://localhost:5000/api';

// ✅ These are constants — they belong outside the component (correct)
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const COLS = Array.from({ length: 16 }, (_, i) => i + 1);
const PAYMENT_METHODS = ["Cash", "Card", "Telebirr", "CBE Birr"];

function SellTicket() {
  // ✅ ALL useState hooks must be inside the component function
  const [customerName, setCustomerName] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [payment, setPayment] = useState("");
  const [showMoviePicker, setShowMoviePicker] = useState(false);
  const [showSnacks, setShowSnacks] = useState(false);
  const [snackCart, setSnackCart] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null); // ✅ moved inside
  const [movies, setMovies] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());

  useEffect(() => {
    fetchMovies();
    fetchSnacks();
  }, []);

  useEffect(() => {
    const loadOccupiedSeats = async () => {
      if (!selectedMovie?._id) {
        setOccupiedSeats(new Set());
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/tickets`);
        const tickets = await response.json();
        const nextOccupiedSeats = new Set();
        tickets
          .filter((ticket) => String(ticket.movieId?._id || ticket.movieId) === String(selectedMovie._id))
          .forEach((ticket) => {
            (ticket.seats || []).forEach((seat) => nextOccupiedSeats.add(seat));
          });
        setOccupiedSeats(nextOccupiedSeats);
      } catch (error) {
        console.error('Error loading occupied seats:', error);
      }
    };
    loadOccupiedSeats();
  }, [selectedMovie]);

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE}/movies`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchSnacks = async () => {
    try {
      const response = await fetch(`${API_BASE}/snacks`);
      const data = await response.json();
      setSnacks(data);
    } catch (error) {
      console.error('Error fetching snacks:', error);
    }
  };

  const toggleSeat = (seat) => {
    if (!selectedMovie || occupiedSeats.has(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const adjustSnack = (id, delta) => {
    setSnackCart((prev) => {
      const qty = Math.max(0, (prev[id] || 0) + delta);
      const next = { ...prev, [id]: qty };
      if (qty === 0) delete next[id];
      return next;
    });
  };

  const getSnackId = (snack) => snack._id || snack.id;

  const getSnackCartQty = (snack) => {
    const snackId = getSnackId(snack);
    return snackCart[snackId] || 0;
  };

  const buildSnackCardStyle = (snack) => {
    const image = snack.image;
    return {
      backgroundImage: image
        ? `linear-gradient(180deg, rgba(8, 8, 10, 0.06) 0%, rgba(8, 8, 10, 0.28) 55%, rgba(8, 8, 10, 0.72) 100%), url("${image}")`
        : 'linear-gradient(180deg, rgba(32, 32, 39, 0.95) 0%, rgba(22, 22, 26, 1) 100%)',
    };
  };

  const getMovieArtwork = (movie) => movie?.poster || movie?.banner || '';

  const pageBackdropStyle = selectedMovie?.poster
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(6, 6, 8, 0.76) 0%, rgba(6, 6, 8, 0.88) 100%), url("${getMovieArtwork(selectedMovie)}")`,
      }
    : undefined;

  const clearSnackSelection = () => {
    setSnackCart({});
  };

  const snackTotal = Object.entries(snackCart).reduce((sum, [id, qty]) => {
    const s = snacks.find((x) => (x._id || x.id) === id);
    return sum + (s ? s.price * qty : 0);
  }, 0);

  const ticketTotal = selectedSeats.length * (selectedMovie?.ticketPrice || 0);
  const grandTotal = ticketTotal + snackTotal;
  const canConfirm = selectedMovie && selectedSeats.length > 0 && payment;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    try {
      const ticketData = {
        customerName,
        movieId: selectedMovie._id,
        movieTitle: selectedMovie.title,
        seats: selectedSeats,
        snacks: snackCart,
        payment,
        total: grandTotal,
      };
      const response = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      if (response.ok) {
        // ✅ Snapshot everything BEFORE clearing state
        setConfirmedBooking({
          customerName,
          movie: selectedMovie,
          seats: [...selectedSeats],
          snackTotal,
          grandTotal,
          payment,
        });
        setOccupiedSeats((prev) => {
          const next = new Set(prev);
          selectedSeats.forEach((seat) => next.add(seat));
          return next;
        });
        setSelectedSeats([]);
        setConfirmed(true);
      }
    } catch (error) {
      console.error('Error confirming ticket:', error);
    }
  };

  const handleReset = () => {
    setConfirmed(false);
    setConfirmedBooking(null);
    setSelectedSeats([]);
    setSelectedMovie(null);
    setSnackCart({});
    setCustomerName("");
    setPayment("");
  };

  const confirmLabel = !selectedMovie
    ? "Select a Movie First"
    : selectedSeats.length === 0
    ? "Select Seats to Continue"
    : !payment
    ? "Choose Payment Method"
    : "✓  Confirm Ticket";

  return (
    <div className="st-page" style={pageBackdropStyle}>

      {/* ════════════════ LEFT ════════════════ */}
      <div className="st-left">

        {/* TOP BAR */}
        <div className="st-topbar">
          <input
            className="st-input"
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <button
            className={`st-movie-trigger${selectedMovie ? " is-active" : ""}`}
            onClick={() => setShowMoviePicker(true)}
          >
            <span></span>
            <span className="st-trigger-label">
              {selectedMovie ? selectedMovie.title : "Select Movie"}
            </span>
            <span className="st-trigger-chevron">▾</span>
          </button>
        </div>

        {/* BANNER */}
        <div className={`st-banner${!selectedMovie ? " st-banner--empty" : ""}`}>
          {selectedMovie ? (
            <div className="st-banner-layout">
              {getMovieArtwork(selectedMovie) ? (
                <div className="st-banner-art">
                  <img src={getMovieArtwork(selectedMovie)} alt={selectedMovie.title} className="st-banner-img" />
                </div>
              ) : null}
              <div className="st-banner-copy">
                <p className="st-banner-genre">{selectedMovie.genre}</p>
                <h2 className="st-banner-title">{selectedMovie.title}</h2>
                <div className="st-banner-meta">
                  <div className="st-banner-meta-row"><span>Director</span><strong>{selectedMovie.director || '—'}</strong></div>
                  <div className="st-banner-meta-row"><span>Cast</span><strong>{selectedMovie.cast || '—'}</strong></div>
                  <div className="st-banner-meta-row"><span>Showtimes</span><strong>{selectedMovie.showtimes || selectedMovie.time || '—'}</strong></div>
                </div>
                {selectedMovie.synopsis && <p className="st-banner-synopsis">{selectedMovie.synopsis}</p>}
                <div className="st-chips">
                  <span className="st-chip">{selectedMovie.hall}</span>
                  <span className="st-chip">{selectedMovie.ageRating || '—'}</span>
                  <span className="st-chip st-chip--red">ETB {selectedMovie.ticketPrice} / seat</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="st-banner-hint">
              Select a movie to view session details
            </p>
          )}
        </div>

        {/* SCREEN */}
        <div className="st-screen-wrap">
          <div className="st-screen-bar" />
          <p className="st-screen-label">SCREEN</p>
        </div>

        {/* SEAT GRID */}
        <div className="st-seat-area">
          {ROWS.map((row) => (
            <div key={row} className="st-seat-row">
              <span className="st-row-lbl">{row}</span>
              {COLS.map((col) => {
                const seat = `${row}${col}`;
                const sel = selectedSeats.includes(seat);
                const occ = occupiedSeats.has(seat);
                const dis = !selectedMovie;
                return (
                  <button
                    key={seat}
                    className={`st-seat${sel ? " st-seat--sel" : ""}${occ ? " st-seat--occ" : ""}${dis && !occ ? " st-seat--dis" : ""}`}
                    onClick={() => toggleSeat(seat)}
                    disabled={occ || dis}
                    title={occ ? "Occupied" : dis ? "Select a movie first" : seat}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* LEGEND */}
        <div className="st-legend">
          <div className="st-legend-item"><span className="st-ldot st-ldot--empty" />Available</div>
          <div className="st-legend-item"><span className="st-ldot st-ldot--sel" />Selected</div>
          <div className="st-legend-item"><span className="st-ldot st-ldot--occ" />Occupied</div>
        </div>
      </div>

      {/* ════════════════ RIGHT ════════════════ */}
      <div className="st-right">

        {/* MOVIE CARD */}
        <div className="st-panel">
          <p className="st-panel-label">NOW BOOKING</p>
          {selectedMovie ? (
            <>
              <p className="st-panel-movie-name">{selectedMovie.title}</p>
              <div className="st-dlist">
                <div className="st-drow"><span>Hall</span><strong>{selectedMovie.hall}</strong></div>
                <div className="st-drow"><span>Time</span><strong>{selectedMovie.time}</strong></div>
                <div className="st-drow"><span>Per seat</span><strong className="st-red">ETB {selectedMovie.ticketPrice}</strong></div>
              </div>
            </>
          ) : (
            <p className="st-panel-empty">No movie selected</p>
          )}
        </div>

        {/* SEATS */}
        <div className="st-panel">
          <p className="st-panel-label">SELECTED SEATS</p>
          <div className="st-tag-wrap">
            {selectedSeats.length > 0
              ? selectedSeats.map((s) => <span key={s} className="st-tag">{s}</span>)
              : <span className="st-panel-empty">None selected</span>
            }
          </div>
        </div>

        {/* PAYMENT */}
        <div className="st-panel">
          <p className="st-panel-label">PAYMENT METHOD</p>
          <div className="st-pay-grid">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                className={`st-pay-btn${payment === m ? " is-active" : ""}`}
                onClick={() => setPayment(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* SNACKS */}
        <button className="st-snacks-trigger" onClick={() => setShowSnacks(true)}>
          <span>Add Snacks</span>
          {snackTotal > 0 && <span className="st-snack-badge">ETB {snackTotal}</span>}
        </button>

        {/* TOTAL */}
        <div className="st-panel st-total-panel">
          <p className="st-panel-label">ORDER SUMMARY</p>
          <div className="st-sum-rows">
            <div className="st-sum-row">
              <span>Tickets × {selectedSeats.length}</span>
              <span>ETB {ticketTotal}</span>
            </div>
            {snackTotal > 0 && (
              <div className="st-sum-row">
                <span>Snacks</span>
                <span>ETB {snackTotal}</span>
              </div>
            )}
          </div>
          <div className="st-sum-total">
            <span>TOTAL</span>
            <span className="st-sum-amount">{grandTotal ? `ETB ${grandTotal}` : "—"}</span>
          </div>
        </div>

        {/* CONFIRM */}
        <button
          className={`st-confirm-btn${canConfirm ? " is-ready" : ""}`}
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          {confirmLabel}
        </button>
      </div>

      {/* ════════════════ MOVIE PICKER MODAL ════════════════ */}
      {showMoviePicker && (
        <div className="st-overlay" onClick={() => setShowMoviePicker(false)}>
          <div className="st-modal" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-head">
              <h3 className="st-modal-title">SELECT MOVIE</h3>
              <button className="st-modal-close" onClick={() => setShowMoviePicker(false)}>✕</button>
            </div>
            {movies.length === 0 ? (
              <div className="st-modal-empty">
                <p className="st-modal-empty-title">No movies loaded</p>
                <p className="st-modal-empty-sub">Connect to the database to populate the movie catalog.</p>
              </div>
            ) : (
              <div className="st-movie-grid">
                {movies.map((m) => (
                  <div
                    key={m._id}
                    className={`st-movie-card${selectedMovie?._id === m._id ? " is-active" : ""}`}
                    onClick={() => {
                      setSelectedMovie(m);
                      setSelectedSeats([]);
                      setShowMoviePicker(false);
                    }}
                  >
                    <div className="st-movie-card-poster">
                      {getMovieArtwork(m)
                        ? <img src={getMovieArtwork(m)} alt={m.title} className="st-movie-card-img" />
                        : <div className="st-movie-card-ph">No Poster</div>
                      }
                    </div>
                    <div className="st-movie-card-body">
                      <p className="st-movie-card-title">{m.title}</p>
                      <p className="st-movie-card-genre">{m.genre}</p>
                      <div className="st-movie-card-meta">
                        <span>{m.hall}</span>
                        <span>ETB {m.ticketPrice || m.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ SNACKS MODAL ════════════════ */}
      {showSnacks && (
        <div className="st-overlay" onClick={() => setShowSnacks(false)}>
          <div className="st-modal st-modal--snacks" onClick={(e) => e.stopPropagation()}>
            <div className="st-modal-head">
              <h3 className="st-modal-title">SNACKS & DRINKS</h3>
              <button className="st-modal-close" onClick={() => setShowSnacks(false)}>✕</button>
            </div>
            {snacks.length === 0 ? (
              <div className="st-modal-empty">
                <p className="st-modal-empty-title">No snack items loaded</p>
                <p className="st-modal-empty-sub">Connect to the database to load the snack menu.</p>
              </div>
            ) : (
              <div className="st-snack-grid">
                {snacks.map((s) => (
                  <div
                    key={getSnackId(s)}
                    className={`st-snack-card${getSnackCartQty(s) > 0 ? ' is-selected' : ''}`}
                    style={buildSnackCardStyle(s)}
                    onClick={() => adjustSnack(getSnackId(s), 1)}
                  >
                    <div className="st-snack-card-content">
                      <div className="st-snack-card-head">
                        <p className="st-snack-name">{s.name}</p>
                        <p className="st-snack-price">ETB {s.price}</p>
                      </div>
                      <div className="st-snack-card-meta">
                        <div className="st-snack-counter" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="st-counter-btn"
                            onClick={(e) => { e.stopPropagation(); adjustSnack(getSnackId(s), -1); }}
                          >
                            −
                          </button>
                          <span className="st-counter-val">{getSnackCartQty(s)}</span>
                          <button
                            type="button"
                            className="st-counter-btn"
                            onClick={(e) => { e.stopPropagation(); adjustSnack(getSnackId(s), 1); }}
                          >
                            +
                          </button>
                        </div>
                        <div className="st-snack-footer-row">
                          <span>Total</span>
                          <strong>ETB {(s.price || 0) * getSnackCartQty(s)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="st-snack-footer">
              <div className="st-snack-footer-actions">
                <button
                  type="button"
                  className="st-snack-clear"
                  onClick={clearSnackSelection}
                  disabled={snackTotal === 0}
                >
                  Clear selection
                </button>
                <span className="st-snack-total">Total: <strong>ETB {snackTotal}</strong></span>
              </div>
              <button
                type="button"
                className="st-confirm-btn is-ready"
                style={{ width: "auto", padding: "10px 24px" }}
                onClick={() => setShowSnacks(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ CONFIRMATION SCREEN ════════════════ */}
      {confirmed && confirmedBooking && (
        <div className="st-overlay st-overlay--dark">
          <div className="st-receipt-card">
            <div className="st-receipt-icon">✓</div>
            <h2 className="st-receipt-title">BOOKING CONFIRMED</h2>
            {confirmedBooking.customerName && (
              <p className="st-receipt-sub">Thank you, {confirmedBooking.customerName}!</p>
            )}
            <div className="st-receipt-body">
              <div className="st-rrow"><span>Movie</span><strong>{confirmedBooking.movie?.title}</strong></div>
              <div className="st-rrow"><span>Hall</span><strong>{confirmedBooking.movie?.hall}</strong></div>
              <div className="st-rrow"><span>Time</span><strong>{confirmedBooking.movie?.time}</strong></div>
              <div className="st-rrow"><span>Seats</span><strong>{confirmedBooking.seats.join(", ")}</strong></div>
              {confirmedBooking.snackTotal > 0 && (
                <div className="st-rrow"><span>Snacks</span><strong>ETB {confirmedBooking.snackTotal}</strong></div>
              )}
              <div className="st-rrow"><span>Payment</span><strong>{confirmedBooking.payment}</strong></div>
              <div className="st-rdivider" />
              <div className="st-rrow st-rrow--total">
                <span>GRAND TOTAL</span>
                <strong className="st-red">ETB {confirmedBooking.grandTotal}</strong>
              </div>
            </div>
            <button className="st-confirm-btn is-ready" onClick={handleReset}>
              + New Booking
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default SellTicket;