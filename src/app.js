import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  'https://owbjstdqmjicnwiomqfd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93YmpzdGRxbWppY253aW9tcWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzM4MDcsImV4cCI6MjA5NjUwOTgwN30.hEE3NIaCuVA0lflCANCsh8uCTcITpQmfoqKyVLpOLUY'
);

const STATUS_COLORS = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  resolved: '#10b981',
  rejected: '#ef4444',
};

export default function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    setIssues(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await supabase.from('issues').update({ status }).eq('id', id);
    setIssues(issues.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filtered = issues.filter(i => {
    const matchFilter = filter === 'All' || i.category === filter;
    const matchSearch = i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.address?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    'in-progress': issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📍</span>
          <div>
            <div style={styles.logoName}>SmartShehar</div>
            <div style={styles.logoSub}>Admin Dashboard</div>
          </div>
        </div>

        <div style={styles.stats}>
          {[
            { label: 'Total', value: counts.total, color: '#fff' },
            { label: 'Pending', value: counts.pending, color: '#f59e0b' },
            { label: 'In Progress', value: counts['in-progress'], color: '#3b82f6' },
            { label: 'Resolved', value: counts.resolved, color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>CATEGORY</div>
          {['All', 'Road', 'Water', 'Electricity', 'Sanitation', 'Other'].map(cat => (
            <div
              key={cat}
              style={{ ...styles.filterItem, background: filter === cat ? '#1a8a4a' : 'transparent' }}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Issues</h1>
          <div style={styles.headerRight}>
            <input
              style={styles.search}
              placeholder="Search by title or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button style={styles.refreshBtn} onClick={fetchIssues}>↻ Refresh</button>
          </div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>No issues found</div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div style={{ flex: 2 }}>Title</div>
              <div style={{ flex: 1 }}>Category</div>
              <div style={{ flex: 1 }}>Status</div>
              <div style={{ flex: 2 }}>Address</div>
              <div style={{ flex: 1 }}>Date</div>
              <div style={{ flex: 1 }}>Actions</div>
            </div>
            {filtered.map(issue => (
              <div key={issue.id} style={styles.tableRow} onClick={() => setSelected(issue)}>
                <div style={{ flex: 2, fontWeight: 600 }}>{issue.title || 'Untitled'}</div>
                <div style={{ flex: 1, color: '#888' }}>{issue.category || '-'}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ ...styles.badge, background: STATUS_COLORS[issue.status] || '#888' }}>
                    {issue.status}
                  </span>
                </div>
                <div style={{ flex: 2, color: '#888', fontSize: 13 }}>{issue.address || '-'}</div>
                <div style={{ flex: 1, color: '#888', fontSize: 13 }}>
                  {new Date(issue.created_at).toLocaleDateString('en-IN')}
                </div>
                <div style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                  <select
                    style={styles.select}
                    value={issue.status}
                    onChange={e => updateStatus(issue.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
            <h2 style={styles.modalTitle}>{selected.title || 'Untitled'}</h2>
            <div style={styles.modalMeta}>
              <span style={{ ...styles.badge, background: STATUS_COLORS[selected.status] || '#888' }}>
                {selected.status}
              </span>
              <span style={styles.modalCat}>{selected.category}</span>
            </div>
            {selected.photo_url && (
              <img src={selected.photo_url} alt="issue" style={styles.modalImg} />
            )}
            <div style={styles.modalField}><b>Description:</b> {selected.description || '-'}</div>
            <div style={styles.modalField}><b>Address:</b> {selected.address || '-'}</div>
            <div style={styles.modalField}><b>Phone:</b> {selected.phone || '-'}</div>
            <div style={styles.modalField}><b>Reported:</b> {new Date(selected.created_at).toLocaleString('en-IN')}</div>
            <div style={styles.modalField}><b>Coordinates:</b> {selected.latitude}, {selected.longitude}</div>
            <div style={styles.modalActions}>
              {['pending', 'in-progress', 'resolved', 'rejected'].map(s => (
                <button
                  key={s}
                  style={{ ...styles.actionBtn, background: selected.status === s ? STATUS_COLORS[s] : '#eee', color: selected.status === s ? '#fff' : '#333' }}
                  onClick={() => updateStatus(selected.id, s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  app: { display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#f5f7fa' },
  sidebar: { width: 240, background: '#0a1931', color: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 32 },
  logoName: { fontWeight: 700, fontSize: 18 },
  logoSub: { fontSize: 12, color: '#7a9cc0' },
  stats: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  statCard: { background: '#1a2e4a', borderRadius: 8, padding: '10px 8px', textAlign: 'center' },
  statValue: { fontSize: 22, fontWeight: 700 },
  statLabel: { fontSize: 11, color: '#7a9cc0', marginTop: 2 },
  filterSection: { display: 'flex', flexDirection: 'column', gap: 4 },
  filterLabel: { fontSize: 11, color: '#7a9cc0', marginBottom: 4, letterSpacing: 1 },
  filterItem: { padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#fff' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#fff', borderBottom: '1px solid #eee' },
  headerTitle: { margin: 0, fontSize: 22, color: '#0a1931' },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  search: { padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: 280 },
  refreshBtn: { padding: '8px 16px', background: '#0a1931', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  table: { flex: 1, overflow: 'auto', padding: 24 },
  tableHeader: { display: 'flex', padding: '10px 16px', fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#fff', borderRadius: 10, marginBottom: 8, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, color: '#fff', fontWeight: 600 },
  select: { padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, cursor: 'pointer' },
  empty: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#888', fontSize: 16 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, width: 500, maxHeight: '80vh', overflow: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' },
  modalTitle: { margin: '0 0 12px', fontSize: 20, color: '#0a1931' },
  modalMeta: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' },
  modalCat: { background: '#f0f4f0', padding: '3px 10px', borderRadius: 20, fontSize: 12, color: '#555' },
  modalImg: { width: '100%', borderRadius: 10, marginBottom: 16, maxHeight: 200, objectFit: 'cover' },
  modalField: { marginBottom: 10, fontSize: 14, color: '#444' },
  modalActions: { display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' },
  actionBtn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' },
};