import axiosInstance from '../utils/axiosInstance';

const priorityColors = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
};

const TaskCard = ({ task, onUpdate }) => {
  const handleToggleStatus = async () => {
    const newStatus = task.completionStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      await axiosInstance.patch(`/tasks/v1/update/status/${task._id}`, {
        completionStatus: newStatus,
      });
      onUpdate();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  return (
    <div className={`task-card ${task.completionStatus === 'Completed' ? 'completed' : ''}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span
          className="priority-badge"
          style={{ backgroundColor: priorityColors[task.priorityStatus] || '#94a3b8' }}
        >
          {task.priorityStatus}
        </span>
      </div>

      <div className="task-card-body">
        <div className="task-detail">
          <span className="task-label">Subject</span>
          <span className="task-value">{task.subject}</span>
        </div>
        <div className="task-detail">
          <span className="task-label">Duration</span>
          <span className="task-value">{task.time} min</span>
        </div>
        <div className="task-detail">
          <span className="task-label">Deadline</span>
          <span className="task-value">{task.deadline} day{task.deadline !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="task-card-footer">
        <span className={`status-badge ${task.completionStatus.toLowerCase()}`}>
          {task.completionStatus}
        </span>
        <button className="toggle-status-btn" onClick={handleToggleStatus}>
          {task.completionStatus === 'Pending' ? 'Mark Complete' : 'Mark Pending'}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
