import { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import ProjectMetrics from './ProjectMetrics';
import { calculateHoursByTaskType } from '../../utils/metrics';
import './MetricsPanel.css';

export default function MetricsPanel() {
  const { state, getAllMetrics, getTaskTypes } = useAppContext();
  const metrics = getAllMetrics();
  const projects = state.projects.filter((p) => p.ativo);
  const taskTypes = getTaskTypes();

  const typeMetrics = useMemo(
    () => calculateHoursByTaskType(state.tasks, state.taskTypes),
    [state.tasks, state.taskTypes]
  );

  return (
    <div className="metrics-panel">
      <h2>📊 Relatório de Métricas</h2>

      {/* Métricas por Projeto */}
      <section className="metrics-by-project">
        <h3>Por Projeto</h3>
        {projects.length === 0 ? (
          <p className="empty-state">Nenhum projeto ainda</p>
        ) : (
          <div className="metrics-grid">
            {metrics.por_projeto.map((metric) => (
              <ProjectMetrics
                key={metric.projeto_id}
                metric={metric}
                projectColor={metric.projeto_cor}
                projectName={metric.projeto_nome}
              />
            ))}
          </div>
        )}
      </section>

      {/* Tarefas Ofensoras */}
      <section className="metrics-offenders">
        <h3>⚠️ Tarefas sem Projeto</h3>
        <div className="offender-metrics-card">
          <ProjectMetrics
            metric={metrics.ofensoras}
            projectColor="#f59e0b"
            projectName="Tarefas Ofensoras"
          />
        </div>
      </section>

      {/* Horas por Tipo de Tarefa */}
      {typeMetrics.length > 0 && (
        <section className="metrics-by-type">
          <h3>🏷️ Horas por Tipo de Tarefa</h3>
          <div className="type-metrics-table">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Horas</th>
                  <th style={{ textAlign: 'right' }}>Tarefas</th>
                </tr>
              </thead>
              <tbody>
                {typeMetrics.map((typeMetric) => (
                  <tr key={typeMetric.name}>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '2px',
                          backgroundColor: typeMetric.color,
                          marginRight: '8px',
                          verticalAlign: 'middle',
                        }}
                      />
                      {typeMetric.name}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {typeMetric.hours.toFixed(1)}h
                    </td>
                    <td style={{ textAlign: 'right', color: '#666' }}>
                      {typeMetric.count}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                  <td>Total</td>
                  <td style={{ textAlign: 'right' }}>
                    {typeMetrics.reduce((sum, t) => sum + t.hours, 0).toFixed(1)}h
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {typeMetrics.reduce((sum, t) => sum + t.count, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {projects.length === 0 && metrics.ofensoras.tarefas_abertas === 0 && (
        <div className="empty-state">
          <p>Nenhuma métrica disponível ainda</p>
          <small>Crie projetos, tarefas e conclua-as para ver as métricas</small>
        </div>
      )}
    </div>
  );
}
