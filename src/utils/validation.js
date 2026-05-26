export function validateProjectName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Nome do projeto é obrigatório');
  }
  if (name.trim().length === 0) {
    throw new Error('Nome do projeto não pode estar vazio');
  }
  if (name.trim().length > 100) {
    throw new Error('Nome do projeto não pode ter mais de 100 caracteres');
  }
  return true;
}

export function validateTaskName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Nome da tarefa é obrigatório');
  }
  if (name.trim().length === 0) {
    throw new Error('Nome da tarefa não pode estar vazio');
  }
  if (name.trim().length > 255) {
    throw new Error('Nome da tarefa não pode ter mais de 255 caracteres');
  }
  return true;
}

export function validateScheduleTime(horaInicio, horaFim) {
  const timeRegex = /^\d{2}:\d{2}$/;

  if (!timeRegex.test(horaInicio)) {
    throw new Error('Hora inicial deve estar no formato HH:MM');
  }
  if (!timeRegex.test(horaFim)) {
    throw new Error('Hora final deve estar no formato HH:MM');
  }

  const [horaI, minI] = horaInicio.split(':').map(Number);
  const [horaF, minF] = horaFim.split(':').map(Number);

  const minutosTotalI = horaI * 60 + minI;
  const minutosTotalF = horaF * 60 + minF;

  if (minutosTotalF <= minutosTotalI) {
    throw new Error('Hora final deve ser depois da hora inicial');
  }

  return true;
}

export function validateDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    throw new Error('Data deve estar no formato YYYY-MM-DD');
  }

  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }

  return true;
}
