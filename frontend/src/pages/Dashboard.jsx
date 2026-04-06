import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayClasses, setTodayClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, tasksRes] = await Promise.all([
          axiosInstance.get('/timetables/v1/get/todaytimetable'),
          axiosInstance.get('/tasks/v1/fetch'),
        ]);
        setTodayClasses(classesRes.data.TimeTable || []);
        setTasks(tasksRes.data.tasks || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingTasks = tasks.filter((t) => t.completionStatus === 'Pending');
  const completedTasks = tasks.filter((t) => t.completionStatus === 'Completed');
  const highPriority = pendingTasks.filter((t) => t.priorityStatus === 'High');

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
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your study overview for today</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/schedule')}>
          View Schedule
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eef2ff' }}>📚</div>
          <div className="stat-info">
            <span className="stat-number">{todayClasses.length}</span>
            <span className="stat-label">Today's Classes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>📝</div>
          <div className="stat-info">
            <span className="stat-number">{pendingTasks.length}</span>
            <span className="stat-label">Pending Tasks</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4' }}>✅</div>
          <div className="stat-info">
            <span className="stat-number">{completedTasks.length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2' }}>🔴</div>
          <div className="stat-info">
            <span className="stat-number">{highPriority.length}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Today's Classes</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/timetable')}>View All</button>
          </div>
          {todayClasses.length === 0 ? (
            <div className="empty-state-small">No classes today</div>
          ) : (
            <div className="mini-list">
              {todayClasses.map((c, i) => (
                <div className="mini-list-item" key={i}>
                  <div className="mini-time">{c.startTime} - {c.endTime}</div>
                  <div className="mini-content">
                    <span className="mini-title">{c.title}</span>
                    <span className="mini-sub">{c.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Urgent Tasks</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/tasks')}>View All</button>
          </div>
          {highPriority.length === 0 ? (
            <div className="empty-state-small">No urgent tasks 🎉</div>
          ) : (
            <div className="mini-list">
              {highPriority.slice(0, 5).map((t, i) => (
                <div className="mini-list-item" key={i}>
                  <div className="mini-badge high">High</div>
                  <div className="mini-content">
                    <span className="mini-title">{t.title}</span>
                    <span className="mini-sub">{t.subject} · {t.deadline} day{t.deadline !== 1 ? 's' : ''} left</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
