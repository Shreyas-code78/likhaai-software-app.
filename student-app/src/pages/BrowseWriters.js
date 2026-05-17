import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

function WriterCard({ writer }) {
  const stars = '★'.repeat(Math.round(writer.rating || 0)) + '☆'.repeat(5 - Math.round(writer.rating || 0));
  return (
    <div className="card fade-in" style={{ padding: 24, transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          fontSize: '1.3rem', fontWeight: 700, flexShrink: 0
        }}>
          {writer.profilePic
            ? <img src={writer.profilePic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : writer.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 2 }}>{writer.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {writer.city || 'Location not set'}{writer.distance ? ` • ${writer.distance} km away` : ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span className="stars" style={{ fontSize: '0.8rem' }}>{stars}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({writer.totalReviews || 0} reviews)</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>₹{writer.pricePerPage || 8}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>per page</div>
        </div>
      </div>

      {writer.bio && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {writer.bio}
        </p>
      )}

      {writer.subjects?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {writer.subjects.slice(0, 4).map(s => (
            <span key={s} style={{ padding: '3px 10px', background: 'var(--cream)', borderRadius: 100, fontSize: '0.75rem', color: 'var(--navy)', fontWeight: 500 }}>{s}</span>
          ))}
          {writer.subjects.length > 4 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{writer.subjects.length - 4} more</span>}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: writer.available ? 'var(--success)' : '#e5e7eb' }} />
          <span style={{ fontSize: '0.8rem', color: writer.available ? 'var(--success)' : 'var(--text-light)' }}>
            {writer.available ? 'Available' : 'Busy'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>✅ {writer.completedTasks || 0} tasks done</span>
        </div>
        <Link to={`/writer/${writer.id}`} className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>View Profile</Link>
      </div>
    </div>
  );
}

export default function BrowseWriters() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterAvail, setFilterAvail] = useState(false);

  useEffect(() => {
    API.get('/writers').then(r => { setWriters(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = writers
    .filter(w => !filterAvail || w.available)
    .filter(w => !search || w.name?.toLowerCase().includes(search.toLowerCase()) || w.city?.toLowerCase().includes(search.toLowerCase()) || w.subjects?.some(s => s.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price') return (a.pricePerPage || 0) - (b.pricePerPage || 0);
      if (sortBy === 'tasks') return (b.completedTasks || 0) - (a.completedTasks || 0);
      return 0;
    });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: 8 }}>Find Writers</h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse verified writers available to complete your assignments.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city, or subject..."
            style={{ flex: 1, minWidth: 220 }} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 180 }}>
            <option value="rating">Sort: Top Rated</option>
            <option value="price">Sort: Lowest Price</option>
            <option value="tasks">Sort: Most Experienced</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: filterAvail ? 'var(--navy)' : 'white',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            color: filterAvail ? 'white' : 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>
            <input type="checkbox" checked={filterAvail} onChange={e => setFilterAvail(e.target.checked)} style={{ display: 'none' }} />
            Available Only
          </label>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="icon">🔍</div><h3>No writers found</h3><p>Try adjusting your search filters.</p></div></div>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>{filtered.length} writer{filtered.length !== 1 ? 's' : ''} found</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filtered.map(w => <WriterCard key={w.id} writer={w} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
