import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import TimetableCard from '../components/TimetableCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Timetable = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeDay, setActiveDay] = useState(
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  );
  const [form, setForm] = useState({
    title: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    isRecurring: true,
    venue: '',
  });

  const fetchTimetable = async () => {
    try {
      const res = await axiosInstance.get('/timetables/v1/get');
      setEntries(res.data.TimeTable || []);
    } catch (err) {
      console.error('Fetch timetable error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim() || !form.startTime.trim() || !form.endTime.trim() || !form.venue.trim()) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await axiosInstance.post('/timetables/v1/add', form);
      setSuccess(res.data.message);
      setForm({ title: '', day: 'Monday', startTime: '', endTime: '', isRecurring: true, venue: '' });
      setShowForm(false);
      fetchTimetable();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add timetable entry.');
    }
  };

  const groupedByDay = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter((e) => e.dayOfWeek === day);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Timetable</h1>
          <p className="page-subtitle">Manage your weekly class schedule</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="form-card">
          <h3>New Timetable Entry</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tt-title">Title</label>
                <input id="tt-title" type="text" name="title" placeholder="e.g. Data Structures" value={form.title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="tt-venue">Venue</label>
                <input id="tt-venue" type="text" name="venue" placeholder="e.g. Room 301" value={form.venue} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tt-day">Day</label>
                <select id="tt-day" name="day" value={form.day} onChange={handleChange}>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tt-start">Start Time</label>
                <input id="tt-start" type="time" name="startTime" value={form.startTime} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="tt-end">End Time</label>
                <input id="tt-end" type="time" name="endTime" value={form.endTime} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
                <span>Recurring weekly</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Add Entry</button>
          </form>
        </div>
      )}

      <div className="day-tabs">
        {DAYS.map((day) => (
          <button
            key={day}
            className={`day-tab ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day.slice(0, 3)}
            {groupedByDay[day].length > 0 && (
              <span className="day-count">{groupedByDay[day].length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="timetable-list">
        {groupedByDay[activeDay].length === 0 ? (
          <div className="empty-state">
            <p>No classes on {activeDay}</p>
          </div>
        ) : (
          groupedByDay[activeDay]
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((entry) => <TimetableCard key={entry._id} entry={entry} />)
        )}
      </div>
    </div>
  );
};

export default Timetable;
