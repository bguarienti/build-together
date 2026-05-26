import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { useAppContext } from '../../hooks/useAppContext';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import './TaskList.css';

export default function TaskList() {
  const { getTasks, getProjects } = useAppContext();
  const [showForm, setShowForm] = useState(false);

  const tasks = getTasks();
  const openTasks = tasks.filter((t) => t.estado === 'aberta');
  const projects = getProjects();

  const getProjectColor = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.cor || '#999';
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Tarefas Abertas</h2>
        <button
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Nova'}
        </button>
      </div>

      {showForm && (
        <TaskForm
          onTaskCreated={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {openTasks.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma tarefa aberta</p>
          <small>Clique em "+ Nova" para criar uma</small>
        </div>
      ) : (
        <Droppable droppableId="tasks-list" type="SCHEDULE">
          {(provided, snapshot) => (
            <div
              className={`tasks-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {openTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projectColor={getProjectColor(task.projeto_id)}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}
