import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminLayout from '../../layouts/AdminLayout';
import { type User } from '../../types';

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  client: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  freelancer: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    select: r => r.data.users as (User & { isBanned?: boolean; _id: string })[],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminApi.banUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const filtered = users?.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const thStyle: React.CSSProperties = {
    padding: '0.875rem 1.25rem',
    color: 'var(--color-text-faint)',
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
  };

  const tdStyle: React.CSSProperties = {
    padding: '1rem 1.25rem',
    borderTop: '1px solid var(--color-border)',
    verticalAlign: 'middle',
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem 2.5rem', maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            Manage Users
          </h1>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.9rem' }}>
            {users?.length ?? 0} total users — change roles, ban accounts, or remove users
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 220,
              padding: '0.6rem 1rem', borderRadius: 8,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem', borderRadius: 8,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Roles</option>
            <option value="client">Clients</option>
            <option value="freelancer">Freelancers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Change Role</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-faint)' }}>
                        No users found
                      </td>
                    </tr>
                  )}
                  {filtered?.map((u) => {
                    const uid = (u as any)._id || u.id;
                    const roleStyle = ROLE_COLORS[u.role] || { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8' };
                    return (
                      <tr key={uid}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, color: 'white', fontSize: '0.8rem',
                            }}>
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{u.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            fontSize: '0.75rem', fontWeight: 600,
                            background: roleStyle.bg, color: roleStyle.color,
                            textTransform: 'capitalize',
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {(u as any).isBanned ? (
                            <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                              Banned
                            </span>
                          ) : (
                            <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                              Active
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {u.role !== 'admin' ? (
                            <select
                              defaultValue={u.role}
                              onChange={e => {
                                if (confirm(`Change ${u.name}'s role to ${e.target.value}?`)) {
                                  roleMutation.mutate({ id: uid, role: e.target.value });
                                }
                              }}
                              style={{
                                padding: '0.35rem 0.6rem', borderRadius: 6,
                                background: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="client">Client</option>
                              <option value="freelancer">Freelancer</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>—</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {u.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => {
                                    if (confirm(`${(u as any).isBanned ? 'Unban' : 'Ban'} ${u.name}?`)) banMutation.mutate(uid);
                                  }}
                                  style={{
                                    padding: '0.35rem 0.7rem', borderRadius: 6, border: 'none',
                                    background: (u as any).isBanned ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                    color: (u as any).isBanned ? '#10b981' : '#f59e0b',
                                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                    transition: 'opacity 0.15s',
                                  }}
                                >
                                  {(u as any).isBanned ? 'Unban' : 'Ban'}
                                </button>
                                <button
                                  onClick={() => { if (confirm(`Delete ${u.name}? This cannot be undone.`)) deleteMutation.mutate(uid); }}
                                  style={{
                                    padding: '0.35rem 0.7rem', borderRadius: 6, border: 'none',
                                    background: 'rgba(239,68,68,0.12)',
                                    color: '#ef4444',
                                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            {u.role === 'admin' && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>Protected</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
