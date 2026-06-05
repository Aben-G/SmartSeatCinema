import { useState, useEffect } from 'react';
import '../styles/SnacksPage.css';

const API_BASE = 'http://localhost:5000/api';

const CATEGORIES = ['Food', 'Drink', 'Combo', 'Dessert', 'Other'];

const EMPTY_FORM = {
  name: '',
  category: '',
  price: '',
  stock: '',
  description: '',
  image: '',
  available: true,
};

function SnacksPage() {
  const [snacks, setSnacks] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSnacks();
  }, []);

  const fetchSnacks = async () => {
    try {
      const response = await fetch(`${API_BASE}/snacks`);
      const data = await response.json();
      setSnacks(data);
    } catch (error) {
      console.error('Error fetching snacks:', error);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImagePreview('');
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditTarget(s._id);
    setForm({ ...s });
    setImagePreview(s.image || '');
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); setErrors({}); };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImageURL = (val) => { set('image', val); setImagePreview(val); };
  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    set('image', url);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.category)     e.category = 'Category is required';
    if (!form.price.toString().trim()) e.price = 'Price is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (editTarget !== null) {
        const response = await fetch(`${API_BASE}/snacks/${editTarget}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (response.ok) {
          fetchSnacks();
        }
      } else {
        const response = await fetch(`${API_BASE}/snacks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (response.ok) {
          fetchSnacks();
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving snack:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/snacks/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchSnacks();
      }
    } catch (error) {
      console.error('Error deleting snack:', error);
    }
    setDeleteConfirm(null);
  };

  const toggleAvailable = (id) => {
    setSnacks((p) => p.map((s) => s.id === id ? { ...s, available: !s.available } : s));
  };

  const filtered = snacks.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = filterCat === 'All' || s.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="sn-page">

    
      <div className="sn-topbar">
        <div className="sn-topbar-left">
          
          <select className="sn-filter" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="sn-add-btn" onClick={openAdd}>+ Add Snack</button>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="sn-empty">
          <p className="sn-empty-title">{snacks.length === 0 ? 'No snacks yet' : 'No results found'}</p>
          <p className="sn-empty-sub">
            {snacks.length === 0 ? 'Add your first snack item to get started' : 'Try adjusting your search or filters'}
          </p>
          {snacks.length === 0 && <button className="sn-add-btn" onClick={openAdd}>+ Add Snack</button>}
        </div>
      ) : (
        <div className="sn-grid">
          {filtered.map((s) => (
            <div className={`sn-card${!s.available ? ' sn-card--unavailable' : ''}`} key={s.id}>

              {/* IMAGE */}
              <div className="sn-card-img">
                {s.image
                  ? <img src={s.image} alt={s.name} />
                  : <div className="sn-card-img-ph">—</div>
                }
                <span className={`sn-cat-badge`}>{s.category}</span>
              </div>

              {/* BODY */}
              <div className="sn-card-body">
                <div className="sn-card-top">
                  <p className="sn-card-name">{s.name}</p>
                  <p className="sn-card-price">ETB {s.price}</p>
                </div>
                {s.description && <p className="sn-card-desc">{s.description}</p>}
                <div className="sn-card-meta">
                  {s.stock !== '' && (
                    <span className={`sn-stock${Number(s.stock) === 0 ? ' sn-stock--out' : Number(s.stock) < 10 ? ' sn-stock--low' : ''}`}>
                      {Number(s.stock) === 0 ? 'Out of stock' : `${s.stock} in stock`}
                    </span>
                  )}
                  <button
                    className={`sn-avail-toggle${s.available ? ' active' : ''}`}
                    onClick={() => toggleAvailable(s.id)}
                  >
                    {s.available ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="sn-card-actions">
                <button className="sn-action-edit" onClick={() => openEdit(s)}>Edit</button>
                <button className="sn-action-delete" onClick={() => setDeleteConfirm(s._id)}>Delete</button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="sn-overlay" onClick={closeModal}>
          <div className="sn-modal" onClick={(e) => e.stopPropagation()}>

            <div className="sn-modal-head">
              <h2 className="sn-modal-title">{editTarget !== null ? 'EDIT SNACK' : 'ADD SNACK'}</h2>
              <button className="sn-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="sn-modal-body">

              {/* LEFT: IMAGE */}
              <div className="sn-modal-left">
                <div className="sn-img-preview">
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" />
                    : <div className="sn-img-ph">No Image</div>
                  }
                </div>
                <div className="sn-field">
                  <label className="sn-label">Image URL</label>
                  <input className="sn-input" placeholder="https://..." value={form.image}
                    onChange={(e) => handleImageURL(e.target.value)} />
                </div>
                <div className="sn-field">
                  <label className="sn-label">Or Upload</label>
                  <label className="sn-file-btn">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleImageFile} hidden />
                  </label>
                </div>
                <div className="sn-field">
                  <label className="sn-label">Availability</label>
                  <div className="sn-toggle-row">
                    <span className="sn-toggle-label">{form.available ? 'Available' : 'Unavailable'}</span>
                    <button
                      className={`sn-toggle${form.available ? ' active' : ''}`}
                      onClick={() => set('available', !form.available)}
                    >
                      <span className="sn-toggle-knob" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: FIELDS */}
              <div className="sn-modal-right">

                <div className={`sn-field${errors.name ? ' sn-field--err' : ''}`}>
                  <label className="sn-label">Item Name *</label>
                  <input className="sn-input" placeholder="e.g. Large Popcorn"
                    value={form.name} onChange={(e) => set('name', e.target.value)} />
                  {errors.name && <span className="sn-err">{errors.name}</span>}
                </div>

                <div className="sn-field-row">
                  <div className={`sn-field${errors.category ? ' sn-field--err' : ''}`}>
                    <label className="sn-label">Category *</label>
                    <select className="sn-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                      <option value="">Select</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    {errors.category && <span className="sn-err">{errors.category}</span>}
                  </div>
                  <div className={`sn-field${errors.price ? ' sn-field--err' : ''}`}>
                    <label className="sn-label">Price (ETB) *</label>
                    <input className="sn-input" type="number" placeholder="e.g. 45"
                      value={form.price} onChange={(e) => set('price', e.target.value)} />
                    {errors.price && <span className="sn-err">{errors.price}</span>}
                  </div>
                </div>

                <div className="sn-field">
                  <label className="sn-label">Stock Quantity</label>
                  <input className="sn-input" type="number" placeholder="e.g. 50"
                    value={form.stock} onChange={(e) => set('stock', e.target.value)} />
                </div>

                <div className="sn-field">
                  <label className="sn-label">Description</label>
                  <textarea className="sn-input sn-textarea" rows={3}
                    placeholder="Short description of the item..."
                    value={form.description} onChange={(e) => set('description', e.target.value)} />
                </div>

              </div>
            </div>

            <div className="sn-modal-foot">
              <button className="sn-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="sn-btn-save" onClick={handleSave}>
                {editTarget !== null ? 'Save Changes' : 'Add Snack'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm !== null && (
        <div className="sn-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="sn-delete-modal" onClick={(e) => e.stopPropagation()}>
            <p className="sn-delete-title">Delete Item?</p>
            <p className="sn-delete-sub">This action cannot be undone.</p>
            <div className="sn-delete-actions">
              <button className="sn-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="sn-btn-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SnacksPage;