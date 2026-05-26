import { useAppContext } from '../../hooks/useAppContext';
import ExportButton from '../ExportButton';
import './Header.css';

export default function Header() {
  const { getTasks, getProjects } = useAppContext();

  const tasks = getTasks();
  const projects = getProjects();
  const openTasks = tasks.filter((t) => t.estado === 'aberta').length;
  const offenderTasks = tasks.filter((t) => t.ativo && t.projeto_id === null && t.estado === 'aberta').length;

  return (
    <header className="header">
      <div className="header-left">
        <h1>⏱️ Time Blocking System</h1>
      </div>
      <div className="header-right">
        <div className="stat">
          <span className="stat-label">Projetos</span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Tarefas</span>
          <span className="stat-value">{openTasks}</span>
        </div>
        {offenderTasks > 0 && (
          <div className="stat warning">
            <span className="stat-label">⚠️ Offensoras</span>
            <span className="stat-value">{offenderTasks}</span>
          </div>
        )}
        <ExportButton />
      </div>
    </header>
  );
}
