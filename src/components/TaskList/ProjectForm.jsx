import { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import './ProjectForm.css';

export default function ProjectForm({ onProjectCreated, editingProject, onCancel }) {
  const { addProject, updateProject } = useAppContext();
  const [name, setName] = useState(editingProject?.nome || '');
  const [color, setColor] = useState(editingProject?.cor || '#3b82f6');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Nome do projeto é obrigatório');
      return;
    }

    if (name.trim().length > 100) {
      setError('Nome do projeto não pode ter mais de 100 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingProject) {
        updateProject(editingProject.id, { nome: name.trim(), cor: color });
      } else {
        addProject(name.trim(), color);
      }
      setName('');
      setColor('#3b82f6');
      onProjectCreated?.();
    } catch (err) {
      setError(err.message || 'Erro ao salvar projeto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!editingProject;

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h3>{isEditing ? 'Editar Projeto' : 'Novo Projeto'}</h3>

      <div className="form-group">
        <label htmlFor="project-name">Nome</label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Marketing"
          maxLength="100"
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="project-color">Cor</label>
        <div className="color-input-wrapper">
          <input
            id="project-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={isSubmitting}
          />
          <span className="color-preview" style={{ backgroundColor: color }} />
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-buttons">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
