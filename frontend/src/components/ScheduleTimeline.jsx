const typeStyles = {
  class: { color: '#6366f1', bg: '#eef2ff', label: 'Class' },
  task: { color: '#f59e0b', bg: '#fffbeb', label: 'Task' },
  break: { color: '#22c55e', bg: '#f0fdf4', label: 'Break' },
};

const ScheduleTimeline = ({ schedule }) => {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="empty-state">
        <p>No schedule generated yet. Make sure you have timetable entries and tasks added.</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {schedule.map((item, index) => {
        const style = typeStyles[item.type] || typeStyles.task;
        return (
          <div className="timeline-item" key={index}>
            <div className="timeline-marker" style={{ backgroundColor: style.color }}></div>
            <div className="timeline-connector"></div>
            <div className="timeline-card" style={{ borderLeftColor: style.color }}>
              <div className="timeline-header">
                <span className="timeline-type" style={{ backgroundColor: style.bg, color: style.color }}>
                  {style.label}
                </span>
                <span className="timeline-time">
                  {item.startTime} — {item.endTime}
                </span>
              </div>
              <h4 className="timeline-title">{item.title}</h4>
              {item.subject && item.type !== 'break' && (
                <p className="timeline-subject">{item.subject}</p>
              )}
              {item.priorityStatus && (
                <span className={`timeline-priority priority-${item.priorityStatus.toLowerCase()}`}>
                  {item.priorityStatus} Priority
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleTimeline;
