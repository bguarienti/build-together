# Metrics Collection - Detailed Implementation Spec

**Versão**: 1.0  
**Data**: 21 de Maio de 2026  
**Status**: ✅ Complementa SPECS.md F16  
**Razão**: SPECS.md F16 foi muito genérico, este documento detalha a implementação

---

## 🔍 Problema Identificado

**SPECS.md F16** descreve:
- "Iterar tarefas com estado === 'concluída'"
- "Somar tempo_gasto por projeto"
- "Contar tarefas (concluídas, canceladas, em aberto)"

**MAS não especifica**:
- Quais funções criam essas coleções?
- Onde moram essas funções? (Context? Hooks? Utils?)
- Como o MetricsPanel chama essas funções?
- Quando as métricas são recalculadas?

---

## 🏗️ Solução: Funções de Cálculo

Todas estas funções devem ir em **AppContext** (ou exported de lá):

### 1. `getTasksByProjectId(projectId)`

**Localização**: `src/context/AppContext.js`

**O que faz**: Retorna todas as tarefas (ativas) de um projeto

```javascript
const getTasksByProjectId = (projectId) => {
  return state.tasks.filter(
    task => task.ativo && task.projeto_id === projectId
  );
};
```

**Usado por**: Funções de métrica abaixo

---

### 2. `getMetricsByProject(projectId)`

**Localização**: `src/context/AppContext.js`

**O que faz**: Retorna objeto com todas as métricas de um projeto

```javascript
const getMetricsByProject = (projectId) => {
  const projectTasks = getTasksByProjectId(projectId);
  
  const completedTasks = projectTasks.filter(t => t.estado === 'concluída');
  const canceledTasks = projectTasks.filter(t => t.estado === 'cancelada');
  const openTasks = projectTasks.filter(t => t.estado === 'aberta');
  const scheduledTasks = projectTasks.filter(t => t.estado === 'agendada');

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
    total_replanejamentos: totalReschedules
  };
};
```

**Retorno**:
```javascript
{
  projeto_id: "uuid",
  tempo_gasto_total: 12.5,           // horas
  tarefas_concluidas: 8,
  tarefas_canceladas: 2,
  tarefas_abertas: 1,
  tarefas_agendadas: 0,
  total_replanejamentos: 15
}
```

---

### 3. `getAllMetrics()`

**Localização**: `src/context/AppContext.js`

**O que faz**: Retorna métricas de TODOS os projetos + ofensoras

```javascript
const getAllMetrics = () => {
  // Métricas por projeto
  const projectMetrics = state.projects
    .filter(p => p.ativo)
    .map(p => getMetricsByProject(p.id));

  // Tarefas ofensoras (sem projeto)
  const offenderTasks = state.tasks.filter(
    t => t.ativo && !t.projeto_id
  );

  const openOffenders = offenderTasks.filter(t => t.estado === 'aberta').length;
  const completedOffenders = offenderTasks.filter(t => t.estado === 'concluída').length;

  return {
    por_projeto: projectMetrics,
    ofensoras: {
      total_abertas: openOffenders,
      total_concluidas: completedOffenders,
      total_tarefas: offenderTasks.length
    }
  };
};
```

**Retorno**:
```javascript
{
  por_projeto: [
    {
      projeto_id: "uuid-1",
      tempo_gasto_total: 12.5,
      tarefas_concluidas: 8,
      // ... mais campos
    },
    // ... mais projetos
  ],
  ofensoras: {
    total_abertas: 2,
    total_concluidas: 0,
    total_tarefas: 2
  }
}
```

---

## 📊 Onde Usar: MetricsPanel Component

**Localização**: `src/components/Metrics/MetricsPanel.jsx`

```javascript
import { useAppContext } from '../../hooks/useAppContext';
import ProjectMetrics from './ProjectMetrics';
import './MetricsPanel.css';

export default function MetricsPanel() {
  const { state, getAllMetrics } = useAppContext();

  // Recalcular métricas sempre que state muda
  const metrics = getAllMetrics();

  return (
    <div className="metrics-panel">
      <h2>📊 Métricas do Projeto</h2>

      {/* Projetos */}
      <section className="metrics-by-project">
        <h3>Por Projeto</h3>
        {state.projects.filter(p => p.ativo).length === 0 ? (
          <p className="empty-state">Nenhum projeto ainda</p>
        ) : (
          metrics.por_projeto.map(metric => (
            <ProjectMetrics 
              key={metric.projeto_id} 
              metric={metric}
              projectName={state.projects.find(p => p.id === metric.projeto_id)?.nome}
            />
          ))
        )}
      </section>

      {/* Ofensoras */}
      <section className="metrics-offenders">
        <h3>⚠️ Tarefas Ofensoras</h3>
        <div className="offender-stats">
          <div className="stat-box">
            <span className="label">Abertas</span>
            <span className="value">{metrics.ofensoras.total_abertas}</span>
          </div>
          <div className="stat-box">
            <span className="label">Concluídas</span>
            <span className="value">{metrics.ofensoras.total_concluidas}</span>
          </div>
          <div className="stat-box">
            <span className="label">Total</span>
            <span className="value">{metrics.ofensoras.total_tarefas}</span>
          </div>
        </div>
        {metrics.ofensoras.total_abertas > 0 && (
          <p className="warning">
            ⚠️ Você tem {metrics.ofensoras.total_abertas} tarefa(s) sem projeto!
          </p>
        )}
      </section>
    </div>
  );
}
```

---

## 📊 Sub-componente: ProjectMetrics

**Localização**: `src/components/Metrics/ProjectMetrics.jsx`

```javascript
export default function ProjectMetrics({ metric, projectName }) {
  return (
    <div className="project-metric-card">
      <h4>{projectName}</h4>
      
      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">Tempo Gasto</span>
          <span className="metric-value">{metric.tempo_gasto_total}h</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Concluídas</span>
          <span className="metric-value">{metric.tarefas_concluidas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Canceladas</span>
          <span className="metric-value">{metric.tarefas_canceladas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Abertas</span>
          <span className="metric-value">{metric.tarefas_abertas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Agendadas</span>
          <span className="metric-value">{metric.tarefas_agendadas}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Replanejamentos</span>
          <span className="metric-value warning">{metric.total_replanejamentos}</span>
        </div>
      </div>

      {metric.tempo_gasto_total === 0 && metric.tarefas_concluidas === 0 && (
        <p className="empty-state">Nenhuma tarefa concluída ainda</p>
      )}
    </div>
  );
}
```

---

## 🔗 Integração no AppContext

**Adicionar ao AppContext.js**:

```javascript
export function AppContextProvider({ children }) {
  const [state, setState] = useState({
    projects: [],
    tasks: [],
    schedules: [],
  });

  // ... useEffect para localStorage ...

  // ===== FUNÇÕES DE MÉTRICA =====

  const getTasksByProjectId = (projectId) => {
    return state.tasks.filter(
      task => task.ativo && task.projeto_id === projectId
    );
  };

  const getMetricsByProject = (projectId) => {
    const projectTasks = getTasksByProjectId(projectId);
    
    const completedTasks = projectTasks.filter(t => t.estado === 'concluída');
    const canceledTasks = projectTasks.filter(t => t.estado === 'cancelada');
    const openTasks = projectTasks.filter(t => t.estado === 'aberta');
    const scheduledTasks = projectTasks.filter(t => t.estado === 'agendada');

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
      total_replanejamentos: totalReschedules
    };
  };

  const getAllMetrics = () => {
    const projectMetrics = state.projects
      .filter(p => p.ativo)
      .map(p => getMetricsByProject(p.id));

    const offenderTasks = state.tasks.filter(
      t => t.ativo && !t.projeto_id
    );

    const openOffenders = offenderTasks.filter(t => t.estado === 'aberta').length;
    const completedOffenders = offenderTasks.filter(t => t.estado === 'concluída').length;

    return {
      por_projeto: projectMetrics,
      ofensoras: {
        total_abertas: openOffenders,
        total_concluidas: completedOffenders,
        total_tarefas: offenderTasks.length
      }
    };
  };

  // ===== OUTRAS AÇÕES =====
  const addProject = (nome) => { /* ... */ };
  const addTask = (nome, projeto_id) => { /* ... */ };
  // ... etc

  return (
    <AppContext.Provider value={{
      state,
      addProject,
      addTask,
      getMetricsByProject,  // ← EXPORTAR!
      getAllMetrics,         // ← EXPORTAR!
      // ... outras ações
    }}>
      {children}
    </AppContext.Provider>
  );
}
```

---

## 🎯 Checklist de Implementação

Para Claude Code corrigir:

- [ ] `getTasksByProjectId()` implementada em AppContext
- [ ] `getMetricsByProject()` implementada em AppContext
- [ ] `getAllMetrics()` implementada em AppContext
- [ ] Ambas exportadas no value do Context
- [ ] `MetricsPanel.jsx` chama `getAllMetrics()`
- [ ] `ProjectMetrics.jsx` renderiza cada métrica corretamente
- [ ] Tempo gasto soma corretamente (tarefas concluídas)
- [ ] Contador de tarefas está correto (por estado)
- [ ] Replanejamentos contabilizam
- [ ] Ofensoras são destacadas
- [ ] localStorage persiste corretamente
- [ ] Métricas atualizam ao concluir tarefa
- [ ] Sem console.log de debug

---

## ✅ Teste Manual

**Fluxo para testar**:

1. Criar projeto "Projeto A"
2. Criar 3 tarefas em "Projeto A"
3. Concluir 1 tarefa com 2h gasto
4. Concluir 1 tarefa com 3h gasto
5. Deixar 1 aberta

**Esperado em MetricsPanel**:
```
Projeto A
├─ Tempo Gasto: 5h ✅
├─ Concluídas: 2 ✅
├─ Canceladas: 0 ✅
├─ Abertas: 1 ✅
└─ Replanejamentos: 0 ✅
```

6. Criar 1 tarefa SEM projeto
7. **Esperado em Ofensoras**:
```
⚠️ Tarefas Ofensoras
├─ Abertas: 1 ✅
├─ Concluídas: 0 ✅
└─ Total: 1 ✅
```

---

## 📌 Conclusão

**Culpa**: 50% specs (genérico), 50% implementação (não detalhado)

**Solução**: Este documento + Claude Code implementar exatamente as funções acima

Após isso, métricas funcionarão 100%!

