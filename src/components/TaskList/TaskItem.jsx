import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useAppContext } from '../../hooks/useAppContext';
import CompleteTaskModal from '../Common/CompleteTaskModal';
import './TaskItem.css';

export default function TaskItem({ task, projectColor, index = 0 }) {
  const { deleteTask, getProjects, completeTask, cancelTask, getTaskTypes } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const projects = getProjects();
  const taskTypes = getTaskTypes();

  const project = projects.find((p) => p.id === task.projeto_id);
  const taskType = task.task_type_id ? taskTypes.find((t) => t.id === task.task_type_id) : null;

  const handleDelete = () => {
    if (window.confirm(`Deletar tarefa "${task.nome}"?`)) {
      setIsDeleting(true);
      try {
        deleteTask(task.id);
      } catch (err) {
        console.error('Erro ao deletar:', err);
        setIsDeleting(false);
      }
    }
  };

  const handleCompleteSubmit = (tempo_gasto) => {
    try {
      completeTask(task.id, tempo_gasto);
      setShowCompleteModal(false);
    } catch (err) {
      console.error('Erro ao concluir:', err);
    }
  };

  const handleCancel = () => {
    if (window.confirm(`Cancelar tarefa "${task.nome}"?`)) {
      try {
        cancelTask(task.id);
      } catch (err) {
        console.error('Erro ao cancelar:', err);
      }
    }
  };

  const isOffender = !task.projeto_id;

  return (
    <>
      <Draggable draggableId={task.id} index={index} type="SCHEDULE">
        {(provided, snapshot) => (
          <div
            className={`task-item ${isOffender ? 'offender' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="task-color" style={{ backgroundColor: projectColor }} />
            <div className="task-info">
              <span className="task-name">{task.nome}</span>
              {project && (
                <span className="task-project">{project.nome}</span>
              )}
              {taskType && (
                <span
                  className="task-type-badge"
                  style={{
                    backgroundColor: taskType.cor || '#3498db',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {taskType.nome}
                </span>
              )}
              {isOffender && (
                <span className="task-offender-badge">⚠️ Sem Projeto</span>
              )}
            </div>
            <div className="task-actions">
              <button
                className="action-btn complete"
                onClick={() => setShowCompleteModal(true)}
                title="Concluir"
              >
                ✓
              </button>
              <button
                className="action-btn cancel"
                onClick={handleCancel}
                title="Cancelar"
              >
                ✘
              </button>
              <button
                className="action-btn delete"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Deletar"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </Draggable>

      {showCompleteModal && (
        <CompleteTaskModal
          task={task}
          onComplete={handleCompleteSubmit}
          onCancel={() => setShowCompleteModal(false)}
        />
      )}
    </>
  );
}
