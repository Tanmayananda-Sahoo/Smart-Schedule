import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import ScheduleTimeline from '../components/ScheduleTimeline';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/timetables/v1/get/schedule');
      setSchedule(res.data.schedule || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
          <h1>Today's Schedule</h1>
          <p className="page-subtitle">{today}</p>
        </div>
        <button className="btn btn-primary" onClick={fetchSchedule}>
          ↻ Regenerate
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="schedule-summary">
        <div className="schedule-stat">
          <span className="schedule-stat-num">{schedule.filter((s) => s.type === 'class').length}</span>
          <span className="schedule-stat-label">Classes</span>
        </div>
        <div className="schedule-stat">
          <span className="schedule-stat-num">{schedule.filter((s) => s.type === 'task').length}</span>
          <span className="schedule-stat-label">Tasks</span>
        </div>
        <div className="schedule-stat">
          <span className="schedule-stat-num">{schedule.filter((s) => s.type === 'break').length}</span>
          <span className="schedule-stat-label">Breaks</span>
        </div>
      </div>

      <ScheduleTimeline schedule={schedule} />
    </div>
  );
};

export default Schedule;
