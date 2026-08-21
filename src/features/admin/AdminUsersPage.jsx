import { useSelector } from 'react-redux';
import { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from '../users/usersApi';
import { selectCurrentUser } from '../auth/authSlice';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import { sameId } from '../../utils/id';

export default function AdminUsersPage() {
  const currentUser = useSelector(selectCurrentUser);
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const toggleRole = (user) => {
    const nextRole = user.role === 'admin' ? 'student' : 'admin';
    updateUser({ id: user.id, role: nextRole });
  };

  const handleDelete = (user) => {
    if (sameId(user.id, currentUser.id)) return;
    if (window.confirm(`Remove ${user.name}'s account? This can't be undone.`)) {
      deleteUser(user.id);
    }
  };

  if (isLoading) return <Loading label="Loading users…" />;
  if (error) return <ErrorMessage error={error} fallback="Couldn't load users." />;

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Cohort</th>
            <th>Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.cohort ?? '—'}</td>
              <td>
                <span className={`badge ${user.role === 'admin' ? 'badge-solved' : 'badge-open'}`}>
                  {user.role}
                </span>
              </td>
              <td className="admin-row-actions">
                <button type="button" className="btn btn-ghost" onClick={() => toggleRole(user)}>
                  Make {user.role === 'admin' ? 'student' : 'admin'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => handleDelete(user)}
                  disabled={sameId(user.id, currentUser.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}