import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from './users/usersApi';
import { profileUpdated, selectCurrentUser } from './authSlice';
import Avatar from '../../components/common/Avatar';

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.name || '');
  const [cohort, setCohort] = useState(user?.cohort || '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');
    try {
      const updatedUser = await updateUserProfile({ name, cohort }, localStorage.getItem('token'));
      dispatch(profileUpdated(updatedUser));
      setStatus('Profile updated successfully.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page profile-page">
      <div className="page-title-header">
        <div>
          <h1>Your profile</h1>
          <p>Manage the details shown to the MoringaDesk community.</p>
        </div>
      </div>

      <section className="profile-layout">
        <div className="profile-summary card">
          <Avatar name={user?.name} size={86} />
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className="badge badge-open">{user?.role || 'student'}</span>
        </div>

        <form className="profile-form card" onSubmit={handleSubmit}>
          <h2>Edit profile</h2>
          {error && <p className="error-message">{error}</p>}
          {status && <p className="profile-success">{status}</p>}
          <div className="form-group">
            <label htmlFor="profile-name">Full name</label>
            <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="profile-cohort">Cohort</label>
            <input id="profile-cohort" value={cohort} onChange={(event) => setCohort(event.target.value)} placeholder="e.g. FT-09" />
          </div>
          <button type="submit" className="btn btn-primary">Save changes</button>
        </form>
      </section>
    </div>
  );
}