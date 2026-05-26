import { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import ProjectForm from './ProjectForm';
import './ProjectList.css';

export default function ProjectList() {
  const { getProjects, deleteProject } = useAppContext();
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const projects = getProjects();

  const handleDelete = (project) => {
    if (window.confirm(`Deletar projeto "${project.nome}"?`)) {
      deleteProject(project.id);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingProject(null);
    setShowForm(false);
  };

  const handleFormSubmit = () => {
    setEditingProject(null);
    setShowForm(false);
  };

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2>Projetos</h2>
        <button
          className="btn-add"
          onClick={() => {
            setEditingProject(null);
            setShowForm(!showForm);
          }}
        >
          {showForm && !editingProject ? '✕ Cancelar' : '+ Novo'}
        </button>
      </div>

      {showForm && (
        <ProjectForm
          onProjectCreated={handleFormSubmit}
          editingProject={editingProject}
          onCancel={handleCancel}
        />
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum projeto criado ainda</p>
          <small>Clique em "+ Novo" para começar</small>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
            <div key={project.id} className="project-item">
              <div className="project-color" style={{ backgroundColor: project.cor }} />
              <div className="project-info">
                <span className="project-name">{project.nome}</span>
              </div>
              <div className="project-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEdit(project)}
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(project)}
                  title="Deletar"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
