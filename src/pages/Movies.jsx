import { useState, useEffect } from 'react';
import '../styles/MoviesPage.css';

const API_BASE = 'http://localhost:5000/api';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy', 'Crime', 'Adventure'];
const AGE_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
const LANGUAGES = ['English', 'Amharic', 'French', 'Arabic', 'Spanish', 'Korean', 'Hindi'];
const HALLS = ['Hall A', 'Hall B', 'Hall C', 'Hall D', 'Hall E'];

const EMPTY_FORM = {
  title: '',
  poster: '',
  hall: '',
  genre: '',
  ageRating: '',
  language: '',
  duration: '',
  director: '',
  cast: '',
  synopsis: '',
  ticketPrice: '',
  showtimes: '',
  status: 'Now Showing',
};

const toMovieForm = (movie = EMPTY_FORM) => ({
  title: movie.title || '',
  poster: movie.poster || '',
  hall: movie.hall || '',
  genre: movie.genre || '',
  ageRating: movie.ageRating || '',
  language: movie.language || '',
  duration: movie.duration !== undefined && movie.duration !== null ? String(movie.duration) : '',
  director: movie.director || '',
  cast: movie.cast || '',
  synopsis: movie.synopsis || '',
  ticketPrice: movie.ticketPrice !== undefined && movie.ticketPrice !== null ? String(movie.ticketPrice) : '',
  showtimes: movie.showtimes || '',
  status: movie.status || 'Now Showing',
});

const sameMovieForm = (left, right) => Object.keys(EMPTY_FORM).every((key) => (left?.[key] || '') === (right?.[key] || ''));

const buildMoviePayload = (movieForm) => ({
  title: movieForm.title.trim(),
  poster: movieForm.poster.trim(),
  hall: movieForm.hall,
  genre: movieForm.genre,
  ageRating: movieForm.ageRating,
  language: movieForm.language,
  duration: movieForm.duration.trim(),
  director: movieForm.director.trim(),
  cast: movieForm.cast.trim(),
  synopsis: movieForm.synopsis.trim(),
  ticketPrice: movieForm.ticketPrice.trim(),
  showtimes: movieForm.showtimes.trim(),
  status: movieForm.status,
});

const BULK_PLACEHOLDER = `[
  {
    "title": "Avatar: The Way of Water",
    "poster": "https://...",
    "hall": "Hall A",
    "genre": "Adventure",
    "ageRating": "PG",
    "language": "English",
    "duration": 192,
    "director": "James Cameron",
    "cast": "Sam Worthington, Zoe Saldana",
    "synopsis": "...",
    "ticketPrice": 360,
    "showtimes": "4:00, 7:00",
    "status": "Now Showing"
  }
]`;

function MoviesPage() {
  const [movies, setMovies] = useState([]); // ← be database ekeyrewalehu
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null new mihonew for now
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState(EMPTY_FORM);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [posterPreview, setPosterPreview] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE}/movies`);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

 
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setInitialForm(EMPTY_FORM);
    setBulkMode(false);
    setBulkJson('');
    setBulkError('');
    setPosterPreview('');
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (movie) => {
    setEditTarget(movie._id);
    const nextForm = toMovieForm(movie);
    setForm(nextForm);
    setInitialForm(nextForm);
    setBulkMode(false);
    setBulkJson('');
    setBulkError('');
    setPosterPreview(movie.poster || '');
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setErrors({});
    setBulkError('');
  };

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handlePosterURL = (val) => {
    set('poster', val);
    setPosterPreview(val);
  };

  const handlePosterFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPosterPreview(url);
    set('poster', url); 
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Title is required';
    if (!form.hall)            e.hall     = 'Hall is required';
    if (!form.genre)           e.genre    = 'Genre is required';
    if (!form.ageRating)       e.ageRating = 'Age rating is required';
    if (!form.duration.trim()) e.duration = 'Duration is required';
    if (!form.ticketPrice.trim()) e.ticketPrice = 'Ticket price is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const parseBulkMovies = (value) => {
    let parsed;

    try {
      parsed = JSON.parse(value);
    } catch {
      return { error: 'Paste valid JSON. Use one object or an array of movie objects.' };
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];

    if (items.length === 0) {
      return { error: 'Add at least one movie object.' };
    }

    try {
      const moviesToCreate = items.map((item, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error(`Item ${index + 1} must be a movie object.`);
        }

        const payload = buildMoviePayload({ ...EMPTY_FORM, ...item });

        if (!payload.title || !payload.hall || !payload.genre || !payload.ageRating || !payload.duration || !payload.ticketPrice) {
          throw new Error(`Movie ${index + 1} is missing required fields.`);
        }

        return payload;
      });

      return { movies: moviesToCreate };
    } catch (error) {
      return { error: error.message || 'Invalid bulk movie data.' };
    }
  };

  const handleSave = async () => {
    try {
      if (editTarget !== null) {
        if (!validate()) return;
        if (sameMovieForm(form, initialForm)) return;
        const response = await fetch(`${API_BASE}/movies/${editTarget}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildMoviePayload(form)),
        });
        if (response.ok) {
          fetchMovies(); // Refresh list
        }
      } else if (bulkMode) {
        setBulkError('');
        const parsed = parseBulkMovies(bulkJson);
        if (parsed.error) {
          setBulkError(parsed.error);
          return;
        }

        const response = await fetch(`${API_BASE}/movies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.movies),
        });
        if (response.ok) {
          fetchMovies();
        }
      } else {
        if (!validate()) return;
        const response = await fetch(`${API_BASE}/movies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildMoviePayload(form)),
        });
        if (response.ok) {
          fetchMovies(); // Refresh list
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/movies/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchMovies(); // Refresh list
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
    setDeleteConfirm(null);
  };

  const filtered = movies.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre  = filterGenre  === 'All' || m.genre  === filterGenre;
    const matchStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchSearch && matchGenre && matchStatus;
  });

  const isEditDirty = editTarget !== null && !sameMovieForm(form, initialForm);
  const canSaveMovie = editTarget === null ? (bulkMode ? bulkJson.trim().length > 0 : true) : isEditDirty;
  const saveButtonLabel = editTarget !== null ? 'Save Changes' : bulkMode ? 'Add Movies' : 'Add Movie';

  return (
    <div className="mv-page">

     
      <div className="mv-topbar">
        <div className="mv-topbar-left">
          
          <select className="mv-filter" value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
            <option value="All">All Genres</option>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
          <select className="mv-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option>Now Showing</option>
            <option>Coming Soon</option>
            <option>Ended</option>
          </select>
        </div>
        <button className="mv-add-btn" onClick={openAdd}>+ Add Movie</button>
      </div>

      {/* ── MOVIE GRID ── */}
      {filtered.length === 0 ? (
        <div className="mv-empty">
          <p className="mv-empty-title">{movies.length === 0 ? 'No movies yet' : 'No results found'}</p>
          <p className="mv-empty-sub">
            {movies.length === 0
              ? 'Add your first movie to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {movies.length === 0 && (
            <button className="mv-add-btn" onClick={openAdd}>+ Add Movie</button>
          )}
        </div>
      ) : (
        <div className="mv-grid">
          {filtered.map((m) => (
            <div className="mv-card" key={m._id}>
              <div className="mv-card-poster">
                {m.poster
                  ? <img src={m.poster} alt={m.title} />
                  : <div className="mv-card-poster-placeholder"><span>🎬</span></div>
                }
                <span className={`mv-status-badge mv-status--${m.status.replace(' ', '-').toLowerCase()}`}>
                  {m.status}
                </span>
                {m.ageRating && <span className="mv-age-badge">{m.ageRating}</span>}
              </div>
              <div className="mv-card-body">
                <p className="mv-card-title">{m.title}</p>
                <div className="mv-card-meta">
                  {m.genre    && <span className="mv-tag">{m.genre}</span>}
                  {m.language && <span className="mv-tag">{m.language}</span>}
                </div>
                <div className="mv-card-details">
                  {m.hall         && <div className="mv-detail-row"><span>Hall</span><strong>{m.hall}</strong></div>}
                  {m.duration     && <div className="mv-detail-row"><span>Duration</span><strong>{m.duration} min</strong></div>}
                  {m.ticketPrice  && <div className="mv-detail-row"><span>Ticket</span><strong className="mv-price">ETB {m.ticketPrice}</strong></div>}
                  {m.director     && <div className="mv-detail-row"><span>Director</span><strong>{m.director}</strong></div>}
                </div>
                {m.synopsis && <p className="mv-synopsis">{m.synopsis}</p>}
              </div>
              <div className="mv-card-actions">
                <button className="mv-action-edit" onClick={() => openEdit(m)}>Edit</button>
                <button className="mv-action-delete" onClick={() => setDeleteConfirm(m._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {showModal && (
        <div className="mv-overlay" onClick={closeModal}>
          <div className={`mv-modal${bulkMode ? ' mv-modal--bulk' : ''}`} onClick={(e) => e.stopPropagation()}>

            <div className="mv-modal-head">
              <h2 className="mv-modal-title">{editTarget !== null ? 'EDIT MOVIE' : 'ADD MOVIE'}</h2>
              <button className="mv-modal-close" onClick={closeModal}>✕</button>
            </div>

            {editTarget === null && (
              <div className="mv-mode-switch">
                <button
                  type="button"
                  className={`mv-mode-btn${!bulkMode ? ' active' : ''}`}
                  onClick={() => {
                    setBulkMode(false);
                    setBulkError('');
                  }}
                >
                  Single Movie
                </button>
                <button
                  type="button"
                  className={`mv-mode-btn${bulkMode ? ' active' : ''}`}
                  onClick={() => {
                    setBulkMode(true);
                    setErrors({});
                  }}
                >
                  Bulk JSON
                </button>
              </div>
            )}

            <div className="mv-modal-body">

              {/* LEFT: POSTER */}
              <div className="mv-modal-left">
                {bulkMode ? (
                  <div className="mv-bulk-guide">
                    <p className="mv-bulk-title">Bulk add movies with JSON</p>
                    <p className="mv-bulk-copy">
                      Paste one movie object or an array of movie objects. Required fields are title, hall, genre,
                      ageRating, duration and ticketPrice.
                    </p>
                    <p className="mv-bulk-copy mv-bulk-copy--muted">
                      Optional fields: poster, language, director, cast, synopsis, showtimes, status.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mv-poster-preview">
                      {posterPreview
                        ? <img src={posterPreview} alt="Poster preview" />
                        : <div className="mv-poster-ph"><span>No Poster</span></div>
                      }
                    </div>
                    <div className="mv-field">
                      <label className="mv-label">Poster URL</label>
                      <input
                        className="mv-input"
                        placeholder="https://..."
                        value={form.poster}
                        onChange={(e) => handlePosterURL(e.target.value)}
                      />
                    </div>
                    <div className="mv-field">
                      <label className="mv-label">Or Upload Image</label>
                      <label className="mv-file-btn">
                        Choose File
                        <input type="file" accept="image/*" onChange={handlePosterFile} hidden />
                      </label>
                    </div>
                    <div className="mv-field">
                      <label className="mv-label">Status</label>
                      <div className="mv-radio-group">
                        {['Now Showing', 'Coming Soon', 'Ended'].map((s) => (
                          <label key={s} className={`mv-radio${form.status === s ? ' active' : ''}`}>
                            <input type="radio" name="status" value={s} checked={form.status === s}
                              onChange={() => set('status', s)} hidden />
                            {s}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

             
              <div className="mv-modal-right">

                {bulkMode ? (
                  <>
                    <div className={`mv-field${bulkError ? ' mv-field--err' : ''}`}>
                      <label className="mv-label">Bulk JSON *</label>
                      <textarea
                        className="mv-input mv-textarea mv-bulk-textarea"
                        rows={16}
                        placeholder={BULK_PLACEHOLDER}
                        value={bulkJson}
                        onChange={(e) => {
                          setBulkJson(e.target.value);
                          setBulkError('');
                        }}
                      />
                      {bulkError && <span className="mv-err">{bulkError}</span>}
                    </div>
                    <p className="mv-bulk-note">You can paste a single object or a JSON array of multiple movies.</p>
                  </>
                ) : (
                  <>

                {/* TITLE */}
                <div className={`mv-field${errors.title ? ' mv-field--err' : ''}`}>
                  <label className="mv-label">Movie Title *</label>
                  <input className="mv-input" placeholder="e.g. Dune: Messiah"
                    value={form.title} onChange={(e) => set('title', e.target.value)} />
                  {errors.title && <span className="mv-err">{errors.title}</span>}
                </div>

              
                <div className="mv-field-row">
                  <div className={`mv-field${errors.hall ? ' mv-field--err' : ''}`}>
                    <label className="mv-label">Hall *</label>
                    <select className="mv-input" value={form.hall} onChange={(e) => set('hall', e.target.value)}>
                      <option value="">Select Hall</option>
                      {HALLS.map((h) => <option key={h}>{h}</option>)}
                    </select>
                    {errors.hall && <span className="mv-err">{errors.hall}</span>}
                  </div>
                  <div className={`mv-field${errors.duration ? ' mv-field--err' : ''}`}>
                    <label className="mv-label">Duration (min) *</label>
                    <input className="mv-input" type="number" placeholder="e.g. 145"
                      value={form.duration} onChange={(e) => set('duration', e.target.value)} />
                    {errors.duration && <span className="mv-err">{errors.duration}</span>}
                  </div>
                </div>

                {/* GENRE + AGE RATING */}
                <div className="mv-field-row">
                  <div className={`mv-field${errors.genre ? ' mv-field--err' : ''}`}>
                    <label className="mv-label">Genre *</label>
                    <select className="mv-input" value={form.genre} onChange={(e) => set('genre', e.target.value)}>
                      <option value="">Select Genre</option>
                      {GENRES.map((g) => <option key={g}>{g}</option>)}
                    </select>
                    {errors.genre && <span className="mv-err">{errors.genre}</span>}
                  </div>
                  <div className={`mv-field${errors.ageRating ? ' mv-field--err' : ''}`}>
                    <label className="mv-label">Age Rating *</label>
                    <div className="mv-rating-group">
                      {AGE_RATINGS.map((r) => (
                        <label key={r} className={`mv-rating-btn${form.ageRating === r ? ' active' : ''}`}>
                          <input type="radio" name="ageRating" value={r} checked={form.ageRating === r}
                            onChange={() => set('ageRating', r)} hidden />
                          {r}
                        </label>
                      ))}
                    </div>
                    {errors.ageRating && <span className="mv-err">{errors.ageRating}</span>}
                  </div>
                </div>

                {/* LANGUAGE + TICKET PRICE */}
                <div className="mv-field-row">
                  <div className="mv-field">
                    <label className="mv-label">Language</label>
                    <select className="mv-input" value={form.language} onChange={(e) => set('language', e.target.value)}>
                      <option value="">Select Language</option>
                      {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className={`mv-field${errors.ticketPrice ? ' mv-field--err' : ''}`}>
                    <label className="mv-label">Ticket Price (ETB) *</label>
                    <input className="mv-input" type="number" placeholder="e.g. 180"
                      value={form.ticketPrice} onChange={(e) => set('ticketPrice', e.target.value)} />
                    {errors.ticketPrice && <span className="mv-err">{errors.ticketPrice}</span>}
                  </div>
                </div>

                {/* DIRECTOR + CAST */}
                <div className="mv-field-row">
                  <div className="mv-field">
                    <label className="mv-label">Director</label>
                    <input className="mv-input" placeholder="e.g. Denis Villeneuve"
                      value={form.director} onChange={(e) => set('director', e.target.value)} />
                  </div>
                  <div className="mv-field">
                    <label className="mv-label">Cast</label>
                    <input className="mv-input" placeholder="e.g. Timothée Chalamet, ..."
                      value={form.cast} onChange={(e) => set('cast', e.target.value)} />
                  </div>
                </div>

                {/* SHOWTIMES */}
                <div className="mv-field">
                  <label className="mv-label">Showtimes</label>
                  <input className="mv-input" placeholder="e.g. 10:00, 14:30, 19:00"
                    value={form.showtimes} onChange={(e) => set('showtimes', e.target.value)} />
                </div>

                {/* SYNOPSIS */}
                <div className="mv-field">
                  <label className="mv-label">Synopsis</label>
                  <textarea className="mv-input mv-textarea" rows={3}
                    placeholder="Brief description of the movie..."
                    value={form.synopsis} onChange={(e) => set('synopsis', e.target.value)} />
                </div>

                  </>
                )}

              </div>
            </div>

            {/* FOOTER */}
            <div className="mv-modal-foot">
              <button className="mv-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="mv-btn-save" onClick={handleSave} disabled={!canSaveMovie}>
                {saveButtonLabel}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm !== null && (
        <div className="mv-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="mv-delete-modal" onClick={(e) => e.stopPropagation()}>
            <p className="mv-delete-title">Delete Movie?</p>
            <p className="mv-delete-sub">This action cannot be undone.</p>
            <div className="mv-delete-actions">
              <button className="mv-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="mv-btn-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MoviesPage;