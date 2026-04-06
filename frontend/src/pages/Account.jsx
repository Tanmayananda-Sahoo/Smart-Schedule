import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const Account = () => {
  const { user, fetchUser } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordForm.oldPassword || !passwordForm.password || !passwordForm.confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (passwordForm.password.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.patch('/users/auth/v1/update/password', passwordForm);
      setSuccess(res.data.message);
      setPasswordForm({ oldPassword: '', password: '', confirmPassword: '' });
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Account</h1>
          <p className="page-subtitle">Manage your profile and security</p>
        </div>
      </div>

      <div className="account-grid">
        <div className="account-card">
          <div className="account-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h2 className="account-name">{user?.name}</h2>
          <p className="account-email">{user?.email}</p>

          <div className="account-details">
            <div className="account-detail-row">
              <span className="detail-label">Department</span>
              <span className="detail-value">{user?.department}</span>
            </div>
            <div className="account-detail-row">
              <span className="detail-label">Academic Year</span>
              <span className="detail-value">Year {user?.academicYear}</span>
            </div>
            {user?.bio && (
              <div className="account-detail-row">
                <span className="detail-label">Bio</span>
                <span className="detail-value">{user.bio}</span>
              </div>
            )}
            <div className="account-detail-row">
              <span className="detail-label">Joined</span>
              <span className="detail-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3>Change Password</h3>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <input
                id="oldPassword"
                type="password"
                name="oldPassword"
                placeholder="Enter current password"
                value={passwordForm.oldPassword}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="password"
                placeholder="Min 4 characters"
                value={passwordForm.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
