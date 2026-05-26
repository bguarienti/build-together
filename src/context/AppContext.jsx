import { createContext, useState, useCallback, useEffect } from 'react';
import { generateUUID } from '../utils/uuid';
import { validateProjectName, validateTaskName, validateScheduleTime, validateDate } from '../utils/validation';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [state, setState] = useState({
    projects: [],
    tasks: [],
    schedules: [],
    taskTypes: [], // NOVO v1.1
  });

  const addProject = useCallback((nome, cor = null) => {
    validateProjectName(nome);

    const newProject = {
      id: generateUUID(),
      nome: nome.trim(),
      cor: cor || null,
      data_criacao: Date.now(),
      ativo: true,
    };

    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));

    return newProject;
  }, []);

  const updateProject = useCallback((id, updates) => {
    if (updates.nome) {
      validateProjectName(updates.nome);
    }

    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const deleteProject = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ativo: false } : p
      ),
    }));
  }, []);

  const getProjects = useCallback(() => {
    return state.projects.filter((p) => p.ativo);
  }, [state.projects]);

  const addTask = useCallback((nome, projeto_id = null, task_type_id = null) => {
    validateTaskName(nome);

    const newTask = {
      id: generateUUID(),
      nome: nome.trim(),
      projeto_id: projeto_id || null,
      task_type_id: task_type_id || null,
      estado: 'aberta',
      tempo_planejado: null,
      tempo_gasto: null,
      data_agendado: null,
      data_conclusao: null,
      data_cancelamento: null,
      historico_replanejamentos: 0,
      datas_replanejamento: [],
      data_criacao: Date.now(),
      ativo: true,
    };

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));

    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    if (updates.nome) {
      validateTaskName(updates.nome);
    }

    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, ativo: false } : t
      ),
    }));
  }, []);

  const getTasks = useCallback(() => {
    return state.tasks.filter((t) => t.ativo);
  }, [state.tasks]);

  const getTasksByProject = useCallback((projeto_id) => {
    return state.tasks.filter((t) => t.ativo && t.projeto_id === projeto_id);
  }, [state.tasks]);

  const getOffenderTasks = useCallback(() => {
    return state.tasks.filter((t) => t.ativo && t.projeto_id === null && t.estado === 'aberta');
  }, [state.tasks]);

  const addSchedule = useCallback((tarefa_id, data, hora_inicio, hora_fim) => {
    validateDate(data);
    validateScheduleTime(hora_inicio, hora_fim);

    const newSchedule = {
      id: generateUUID(),
      tarefa_id,
      data,
      hora_inicio,
      hora_fim,
      data_criacao: Date.now(),
      ativo: true,
    };

    setState((prev) => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule],
    }));

    updateTask(tarefa_id, { estado: 'agendada', data_agendado: Date.now() });

    return newSchedule;
  }, [updateTask]);

  const rescheduleTask = useCallback((tarefa_id, nova_data, nova_hora_inicio, nova_hora_fim) => {
    validateDate(nova_data);
    validateScheduleTime(nova_hora_inicio, nova_hora_fim);

    setState((prev) => {
      const oldSchedule = prev.schedules.find(
        (s) => s.tarefa_id === tarefa_id && s.ativo
      );

      if (!oldSchedule) {
        return prev; // Retorna estado anterior sem mudanças
      }

      return {
        ...prev,
        schedules: [
          ...prev.schedules.map((s) =>
            s.id === oldSchedule.id ? { ...s, ativo: false } : s
          ),
          {
            id: generateUUID(),
            tarefa_id,
            data: nova_data,
            hora_inicio: nova_hora_inicio,
            hora_fim: nova_hora_fim,
            data_criacao: Date.now(),
            ativo: true,
          },
        ],
        tasks: prev.tasks.map((t) =>
          t.id === tarefa_id
            ? {
                ...t,
                historico_replanejamentos: t.historico_replanejamentos + 1,
                datas_replanejamento: [...t.datas_replanejamento, Date.now()],
              }
            : t
        ),
      };
    });
  }, []);

  useEffect(() => {
    const savedState = loadFromLocalStorage();
    if (savedState) {
      setState(savedState);
    }
  }, []);

  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

  const unscheduleTask = useCallback((tarefa_id) => {
    setState((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.tarefa_id === tarefa_id && s.ativo ? { ...s, ativo: false } : s
      ),
      tasks: prev.tasks.map((t) =>
        t.id === tarefa_id ? { ...t, estado: 'aberta' } : t
      ),
    }));
  }, []);

  const completeTask = useCallback((tarefa_id, tempo_gasto) => {
    if (!tempo_gasto || tempo_gasto <= 0) {
      throw new Error('Tempo gasto deve ser um número positivo');
    }

    setState((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.tarefa_id === tarefa_id && s.ativo ? { ...s, ativo: false } : s
      ),
      tasks: prev.tasks.map((t) =>
        t.id === tarefa_id
          ? {
              ...t,
              estado: 'concluída',
              tempo_gasto: parseFloat(tempo_gasto),
              data_conclusao: Date.now(),
            }
          : t
      ),
    }));
  }, []);

  const cancelTask = useCallback((tarefa_id) => {
    setState((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.tarefa_id === tarefa_id && s.ativo ? { ...s, ativo: false } : s
      ),
      tasks: prev.tasks.map((t) =>
        t.id === tarefa_id
          ? {
              ...t,
              estado: 'cancelada',
              data_cancelamento: Date.now(),
            }
          : t
      ),
    }));
  }, []);

  const reopenTask = useCallback((tarefa_id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === tarefa_id
          ? {
              ...t,
              estado: 'aberta',
              data_conclusao: null,
              data_cancelamento: null,
              tempo_gasto: null,
            }
          : t
      ),
    }));
  }, []);

  const getTasksByProjectId = useCallback(
    (projectId) => {
      return state.tasks.filter(
        (task) => task.ativo && task.projeto_id === projectId
      );
    },
    [state.tasks]
  );

  const getMetricsForProject = useCallback(
    (projectId) => {
      const projectTasks = getTasksByProjectId(projectId);

      const completedTasks = projectTasks.filter((t) => t.estado === 'concluída');
      const canceledTasks = projectTasks.filter((t) => t.estado === 'cancelada');
      const openTasks = projectTasks.filter((t) => t.estado === 'aberta');
      const scheduledTasks = projectTasks.filter((t) => t.estado === 'agendada');

      const totalTimeSpent = completedTasks.reduce((sum, task) => {
        return sum + (task.tempo_gasto || 0);
      }, 0);

      const totalReschedules = projectTasks.reduce((sum, task) => {
        return sum + (task.historico_replanejamentos || 0);
      }, 0);

      return {
        projeto_id: projectId,
        tempo_gasto_total: parseFloat(totalTimeSpent.toFixed(2)),
        tarefas_concluidas: completedTasks.length,
        tarefas_canceladas: canceledTasks.length,
        tarefas_abertas: openTasks.length,
        tarefas_agendadas: scheduledTasks.length,
        total_replanejamentos: totalReschedules,
      };
    },
    [getTasksByProjectId]
  );

  const getOffenderMetrics = useCallback(() => {
    const offenderTasks = state.tasks.filter((t) => t.ativo && !t.projeto_id);

    const completedTasks = offenderTasks.filter((t) => t.estado === 'concluída');
    const canceledTasks = offenderTasks.filter((t) => t.estado === 'cancelada');
    const openTasks = offenderTasks.filter((t) => t.estado === 'aberta');
    const scheduledTasks = offenderTasks.filter((t) => t.estado === 'agendada');

    const totalTimeSpent = completedTasks.reduce((sum, task) => {
      return sum + (task.tempo_gasto || 0);
    }, 0);

    const totalReschedules = offenderTasks.reduce((sum, task) => {
      return sum + (task.historico_replanejamentos || 0);
    }, 0);

    return {
      projeto_id: 'ofensoras',
      tempo_gasto_total: parseFloat(totalTimeSpent.toFixed(2)),
      tarefas_concluidas: completedTasks.length,
      tarefas_canceladas: canceledTasks.length,
      tarefas_abertas: openTasks.length,
      tarefas_agendadas: scheduledTasks.length,
      total_replanejamentos: totalReschedules,
    };
  }, [state.tasks]);

  const getAllMetrics = useCallback(() => {
    const projectMetrics = state.projects
      .filter((p) => p.ativo)
      .map((p) => ({
        ...getMetricsForProject(p.id),
        projeto_nome: p.nome,
        projeto_cor: p.cor,
      }));

    const offenderMetrics = getOffenderMetrics();

    return {
      por_projeto: projectMetrics,
      ofensoras: offenderMetrics,
    };
  }, [state.projects, state.tasks, getMetricsForProject, getOffenderMetrics]);

  // Task Types CRUD (NOVO v1.1)
  const addTaskType = useCallback((nome, cor = null) => {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Nome do tipo de tarefa é obrigatório');
    }
    if (nome.length > 100) {
      throw new Error('Nome não pode ter mais de 100 caracteres');
    }

    const newTaskType = {
      id: generateUUID(),
      nome: nome.trim(),
      cor: cor || null,
      data_criacao: Date.now(),
      ativo: true,
    };

    setState((prev) => ({
      ...prev,
      taskTypes: [...prev.taskTypes, newTaskType],
    }));

    return newTaskType;
  }, []);

  const updateTaskType = useCallback((id, updates) => {
    if (updates.nome && updates.nome.length > 100) {
      throw new Error('Nome não pode ter mais de 100 caracteres');
    }

    setState((prev) => ({
      ...prev,
      taskTypes: prev.taskTypes.map((tt) =>
        tt.id === id ? { ...tt, ...updates } : tt
      ),
    }));
  }, []);

  const deleteTaskType = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      taskTypes: prev.taskTypes.map((tt) =>
        tt.id === id ? { ...tt, ativo: false } : tt
      ),
    }));
  }, []);

  const getTaskTypes = useCallback(() => {
    return state.taskTypes.filter((tt) => tt.ativo);
  }, [state.taskTypes]);

  const value = {
    state,
    addProject,
    updateProject,
    deleteProject,
    getProjects,
    addTask,
    updateTask,
    deleteTask,
    getTasks,
    getTasksByProject,
    getOffenderTasks,
    addSchedule,
    rescheduleTask,
    unscheduleTask,
    completeTask,
    cancelTask,
    reopenTask,
    getTasksByProjectId,
    getMetricsForProject,
    getOffenderMetrics,
    getAllMetrics,
    // Task Types CRUD (NOVO v1.1)
    addTaskType,
    updateTaskType,
    deleteTaskType,
    getTaskTypes,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
