const TimetableCard = ({ entry }) => {
  return (
    <div className="timetable-card">
      <div className="tt-time-block">
        <span className="tt-start">{entry.startTime}</span>
        <span className="tt-separator">—</span>
        <span className="tt-end">{entry.endTime}</span>
      </div>
      <div className="tt-content">
        <h4 className="tt-title">{entry.title}</h4>
        <div className="tt-meta">
          {entry.venue && (
            <span className="tt-venue">
              <span className="tt-icon">📍</span> {entry.venue}
            </span>
          )}
          {entry.dayOfWeek && (
            <span className="tt-day">
              <span className="tt-icon">📅</span> {entry.dayOfWeek}
            </span>
          )}
          {entry.isRecurring && <span className="tt-recurring">🔁 Recurring</span>}
        </div>
      </div>
    </div>
  );
};

export default TimetableCard;
