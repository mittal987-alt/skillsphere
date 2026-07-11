import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User } from '../../types';

export default function AdminUsers() {
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    select: r => r.data.users as User[],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">Manage Users</h1>
        <p className="section-subtitle">View and manage platform users</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id || (u as any)._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#e2e8f0' }}>{u.name}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {u.role !== 'admin' && (
                        <button
                          className="btn-danger"
                          onClick={() => { if (confirm('Delete user?')) deleteMutation.mutate(u.id || (u as any)._id) }}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          Delete
                        </button>
                      )}
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
