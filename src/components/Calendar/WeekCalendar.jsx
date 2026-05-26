import { useState } from 'react';
import { getWeekDates, getWeekRange, addDays, HOURS, formatTime } from '../../utils/date';
import DayColumn from './DayColumn';
import './WeekCalendar.css';

export default function WeekCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekDates = getWeekDates(currentWeek);

  const goToPreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="week-calendar">
      <div className="calendar-header">
        <button className="nav-btn" onClick={goToPreviousWeek}>
          ← Anterior
        </button>
        <div className="week-info">
          <h3>Semana de {getWeekRange(currentWeek)}</h3>
          <button className="btn-today" onClick={goToToday}>
            Hoje
          </button>
        </div>
        <button className="nav-btn" onClick={goToNextWeek}>
          Próxima →
        </button>
      </div>

      <div className="calendar-container">
        <div className="hours-column">
          <div className="hours-spacer" />
          {HOURS.map((hour) => (
            <div key={`hour-${hour}`} className="hour-label">
              {formatTime(hour)}
            </div>
          ))}
        </div>

        <div className="days-grid">
          {weekDates.map((date) => (
            <DayColumn key={date.toISOString()} date={date} />
          ))}
        </div>
      </div>
    </div>
  );
}
