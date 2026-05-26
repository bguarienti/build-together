import { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './TaskForm.css';

export default function TaskForm({ onTaskCreated, onCancel }) {
  const { addTask, getProjects, getTaskTypes } = useAppContext();
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskTypeId, setTaskTypeId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projects = getProjects();
  const taskTypes = getTaskTypes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome da tarefa é obrigatório');
      return;
    }

    if (name.trim().length > 255) {
      setError('Nome da tarefa não pode ter mais de 255 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      addTask(name.trim(), projectId || null, taskTypeId || null);
      setName('');
      setProjectId('');
      setTaskTypeId('');
      onTaskCreated?.();
    } catch (err) {
      setError(err.message || 'Erro ao criar tarefa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>Nova Tarefa</h3>

      <div className="form-group">
        <label htmlFor="task-name">Nome</label>
        <input
          id="task-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Revisar proposta"
          maxLength="255"
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-project">Projeto (Opcional)</label>
        <select
          id="task-project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Sem Projeto (Ofensora)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="task-type">Tipo (Opcional)</label>
        <select
          id="task-type"
          value={taskTypeId}
          onChange={(e) => setTaskTypeId(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="">Sem Tipo</option>
          {taskTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-buttons">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Criando...' : 'Criar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
