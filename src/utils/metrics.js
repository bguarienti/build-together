export function calculateHoursByTaskType(tasks, taskTypes) {
  const typeHours = {};

  tasks
    .filter((t) => t.ativo && t.estado === 'concluída' && t.tempo_gasto)
    .forEach((task) => {
      const typeKey = task.task_type_id || 'sem-tipo';
      const typeName = task.task_type_id
        ? taskTypes.find((tt) => tt.id === task.task_type_id)?.nome || 'Desconhecido'
        : 'Sem Tipo';

      if (!typeHours[typeKey]) {
        typeHours[typeKey] = {
          name: typeName,
          hours: 0,
          count: 0,
          color: task.task_type_id
            ? taskTypes.find((tt) => tt.id === task.task_type_id)?.cor || '#3498db'
            : '#95a5a6',
        };
      }

      typeHours[typeKey].hours += task.tempo_gasto;
      typeHours[typeKey].count += 1;
    });

  return Object.values(typeHours).sort((a, b) => b.hours - a.hours);
}

// Calcula o tempo planejado (em horas) de uma tarefa a partir do agendamento ativo
function getPlannedHoursForTask(task, schedules) {
  if (task.tempo_planejado) return task.tempo_planejado;
  const sch = schedules.find((s) => s.ativo && s.tarefa_id === task.id);
  if (!sch) return null;
  const [h1, m1] = sch.hora_inicio.split(':').map(Number);
  const [h2, m2] = sch.hora_fim.split(':').map(Number);
  return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
}

// Métricas de atraso (planejado vs realizado) para um conjunto de tarefas
export function calculateDelayMetrics(tasks, schedules) {
  const completed = tasks.filter(
    (t) => t.ativo && t.estado === 'concluída' && t.tempo_gasto
  );

  let withPlan = 0;
  let lateCount = 0;
  let onTimeCount = 0;
  let totalDelta = 0; // soma em horas (positivo = atraso)
  let totalPlanned = 0;
  let totalActual = 0;

  completed.forEach((task) => {
    const planned = getPlannedHoursForTask(task, schedules);
    if (planned == null || planned <= 0) return;
    withPlan += 1;
    const actual = task.tempo_gasto;
    const delta = actual - planned;
    totalDelta += delta;
    totalPlanned += planned;
    totalActual += actual;
    // tolerância: até 5 min considera no prazo
    if (delta > 5 / 60) lateCount += 1;
    else onTimeCount += 1;
  });

  return {
    avaliadas: withPlan,
    atrasadas: lateCount,
    no_prazo: onTimeCount,
    atraso_total_horas: parseFloat(totalDelta.toFixed(2)),
    atraso_medio_horas: withPlan > 0 ? parseFloat((totalDelta / withPlan).toFixed(2)) : 0,
    desvio_pct: totalPlanned > 0 ? parseFloat((((totalActual - totalPlanned) / totalPlanned) * 100).toFixed(1)) : 0,
  };
}
