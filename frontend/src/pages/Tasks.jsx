import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import TaskCard from '../components/TaskCard';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    subject: '',
    time: '',
    deadline: '',
  });

  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get('/tasks/v1/fetch');
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim() || !form.subject.trim() || !form.time.trim() || !form.deadline) {
      setError('All fields are required.');
      return;
    }

    if (Number(form.deadline) < 0 || Number(form.time) <= 0) {
      setError('Deadline and duration must be positive values.');
      return;
    }

    try {
      const res = await axiosInstance.post('/tasks/v1/add', {
        ...form,
        deadline: Number(form.deadline),
      });
      setSuccess(res.data.message);
      setForm({ title: '', subject: '', time: '', deadline: '' });
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'Pending') return t.completionStatus === 'Pending';
    if (filter === 'Completed') return t.completionStatus === 'Completed';
    return true;
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
          <h1>Tasks</h1>
          <p className="page-subtitle">Manage and track your study tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="form-card">
          <h3>New Task</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-title">Title</label>
                <input id="task-title" type="text" name="title" placeholder="e.g. Complete Assignment" value={form.title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="task-subject">Subject</label>
                <input id="task-subject" type="text" name="subject" placeholder="e.g. Mathematics" value={form.subject} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-time">Duration (minutes)</label>
                <input id="task-time" type="number" name="time" placeholder="e.g. 60" value={form.time} onChange={handleChange} min="1" />
              </div>
              <div className="form-group">
                <label htmlFor="task-deadline">Deadline (days from now)</label>
                <input id="task-deadline" type="number" name="deadline" placeholder="e.g. 3" value={form.deadline} onChange={handleChange} min="0" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add Task</button>
          </form>
        </div>
      )}

      <div className="filter-tabs">
        {['All', 'Pending', 'Completed'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="filter-count">
              {f === 'All'
                ? tasks.length
                : tasks.filter((t) => t.completionStatus === f).length}
            </span>
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No {filter !== 'All' ? filter.toLowerCase() : ''} tasks found</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
