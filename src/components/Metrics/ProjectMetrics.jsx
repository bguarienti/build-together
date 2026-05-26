export default function ProjectMetrics({ metric, projectColor, projectName }) {
  return (
    <div className="project-metric-card">
      <div className="card-header">
        <div className="color-indicator" style={{ backgroundColor: projectColor }} />
        <h4>{projectName}</h4>
      </div>

      <div className="metrics-grid-small">
        <div className="metric-item">
          <span className="metric-label">Tempo Gasto</span>
          <span className="metric-value">{metric.tempo_gasto_total.toFixed(1)}h</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Concluídas</span>
          <span className="metric-value stat-completed">{metric.tarefas_concluidas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Canceladas</span>
          <span className="metric-value stat-canceled">{metric.tarefas_canceladas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Abertas</span>
          <span className="metric-value stat-open">{metric.tarefas_abertas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Agendadas</span>
          <span className="metric-value stat-scheduled">{metric.tarefas_agendadas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Replanejamentos</span>
          <span className="metric-value stat-reschedule">{metric.total_replanejamentos}</span>
        </div>
      </div>

      {metric.tempo_gasto_total === 0 && metric.tarefas_concluidas === 0 && (
        <p className="empty-state">Nenhuma tarefa concluída ainda</p>
      )}
    </div>
  );
}
