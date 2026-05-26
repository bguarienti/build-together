import { useAppContext } from '../../hooks/useAppContext';
import { HOURS, formatDateBR, getDayNameShort, isToday } from '../../utils/date';
import TimeSlot from './TimeSlot';
import ScheduleBlock from './ScheduleBlock';
import './DayColumn.css';

export default function DayColumn({ date }) {
  const { state } = useAppContext();
  const dateStr = date.toISOString().split('T')[0];
  const isCurrentDay = isToday(date);

  const daySchedules = state.schedules.filter(
    (s) => s.ativo && s.data === dateStr
  );

  const getProjectColor = (projectId) => {
    const project = state.projects.find((p) => p.id === projectId && p.ativo);
    return project?.cor || '#999';
  };

  const getSchedulesForHour = (hour) => {
    const hourSchedules = daySchedules.filter((s) => {
      const [startHour] = s.hora_inicio.split(':').map(Number);
      return startHour === hour;
    });

    return hourSchedules.map((schedule, index) => (
      <ScheduleBlock
        key={schedule.id}
        schedule={schedule}
        projectColor={getProjectColor(
          state.tasks.find((t) => t.id === schedule.tarefa_id)?.projeto_id
        )}
        index={index}
      />
    ));
  };

  return (
    <div className={`day-column ${isCurrentDay ? 'today' : ''}`}>
      <div className="day-header">
        <div className="day-name">{getDayNameShort(date)}</div>
        <div className={`day-date ${isCurrentDay ? 'highlight' : ''}`}>
          {formatDateBR(date)}
        </div>
      </div>
      <div className="day-slots">
        {HOURS.map((hour) => (
          <TimeSlot
            key={`${dateStr}-${hour}`}
            hour={hour}
            date={dateStr}
            blocks={getSchedulesForHour(hour)}
          />
        ))}
      </div>
    </div>
  );
}
