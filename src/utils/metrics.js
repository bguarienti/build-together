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
