import { Droppable } from '@hello-pangea/dnd';
import './TimeSlot.css';

export default function TimeSlot({ hour, date, children, blocks, onClick }) {
  return (
    <Droppable droppableId={`timeslot-${date}-${hour}`} type="SCHEDULE">
      {(provided, snapshot) => (
        <div
          className={`time-slot ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
          onClick={onClick}
          data-hour={hour}
          data-date={date}
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ position: 'relative', ...provided.droppableProps.style }}
        >
          {blocks}
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
