import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Gig } from '../../types';

export default function AdminGigs() {
  const qc = useQueryClient();

  const { data: gigs, isLoading } = useQuery({
    queryKey: ['admin-gigs'],
    queryFn: () => adminApi.getGigs(),
    select: r => r.data.gigs as Gig[],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteGig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-gigs'] }),
  });

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Manage Gigs</h1>
        <p className="section-subtitle">View and remove platform gigs</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Title</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gigs?.map((g) => (
                  <tr key={g._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#e2e8f0' }}>{g.title}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span className={`badge badge-${g.status.toLowerCase().replace(' ', '')}`}>{g.status}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <button
                        className="btn-danger"
                        onClick={() => { if (confirm('Delete gig?')) deleteMutation.mutate(g._id) }}
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
