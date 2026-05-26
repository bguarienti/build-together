# Time Blocking System - Development Plan

**Versão**: 1.1  
**Data**: 22 de Maio de 2026  
**Status**: ✅ Aprovado (v1.1 - Adicionada Phase 7)

**Histórico**:
- v1.0 (21/05): Phases 1-6 (MVP completo)
- v1.1 (22/05): Phase 7 - Task Types (Tipos de Tarefa)  

---

## 📊 Progresso Geral

```
Phase 1: Foundation (Setup + State)                   ✅ PHASE COMPLETA
├─ Sprint 1.1: Project Setup & Architecture          ✅ COMPLETO
├─ Sprint 1.2: Data Models & Context API              ✅ COMPLETO
└─ Sprint 1.3: localStorage Integration               ✅ COMPLETO

Phase 2: Core Features (CRUD)                         ✅ PHASE COMPLETA
├─ Sprint 2.1: Projetos CRUD                         ✅ COMPLETO
├─ Sprint 2.2: Tarefas CRUD                          ✅ COMPLETO
└─ Sprint 2.3: UI Sidebar + Layout                   ✅ COMPLETO

Phase 3: Calendário (Visualização)                    ✅ PHASE COMPLETA
├─ Sprint 3.1: Calendar Layout                         ✅ COMPLETO
├─ Sprint 3.2: Time Blocks Display                     ✅ COMPLETO
└─ Sprint 3.3: Drag-Drop Básico                        ✅ COMPLETO

Phase 4: Agendamento (Drag-Drop)                       ✅ PHASE COMPLETA
├─ Sprint 4.1: Drag-Drop para Agendar                 ✅ COMPLETO
├─ Sprint 4.2: Replanejamento                         ✅ COMPLETO
└─ Sprint 4.3: Remove from Calendar                   ✅ COMPLETO

Phase 5: Conclusão & Relatórios                       ✅ PHASE COMPLETA
├─ Sprint 5.1: Mark Complete                         ✅ COMPLETO
├─ Sprint 5.2: Cancel Task                           ✅ COMPLETO
└─ Sprint 5.3: Relatório de Métricas                 ✅ COMPLETO

Phase 6: Export & Polish                             ✅ PHASE COMPLETA
├─ Sprint 6.1: Export JSON                           ✅ COMPLETO
├─ Sprint 6.2: Bug Fixes & Refinement                ✅ COMPLETO
└─ Sprint 6.3: MVP Release                           ✅ COMPLETO

Phase 7: Task Types (Feature)                         ✅ PHASE COMPLETA
├─ Sprint 7.1: Task Types CRUD                        ✅ COMPLETO
├─ Sprint 7.2: Task Type Integration                  ✅ COMPLETO
└─ Sprint 7.3: Metrics by Task Type                   ✅ COMPLETO
```

**Resumo**: 18/18 sprints MVP completas (100%) ✅ + 3/3 sprints Phase 7 completas (100%) ✅  
**Phase 1 Foundation**: 100% COMPLETA ✅  
**Phase 2 Core Features**: 100% COMPLETA ✅  
**Phase 3 Calendário**: 100% COMPLETA ✅  
**Phase 4 Agendamento**: 100% COMPLETA ✅  
**Phase 5 Conclusão & Relatórios**: 100% COMPLETA ✅  
**Phase 6 Export & Polish**: 100% COMPLETA ✅  
**Phase 7 Task Types**: 100% COMPLETA ✅ (3/3 sprints completas)  
**Status**: 🚀 MVP v1.0 RELEASE ✅ + Feature v1.1 (Task Types) COMPLETA ✅  
**Última atualização**: 23/05/2026 - Phase 7 completa, pronto para merge e deploy

---

## 📌 Overview

Plano de desenvolvimento faseado do Time Blocking System, quebrando SPECS.md em fases executáveis com checkpoints claros.

---

## 🎯 Visão Geral do Faseamento

```
Phase 1: Foundation (Setup + State)
├─ Sprint 1.1: Project Setup & Architecture
├─ Sprint 1.2: Data Models & Context
└─ Sprint 1.3: localStorage Integration

Phase 2: Core Features (CRUD Básico)
├─ Sprint 2.1: Projetos CRUD
├─ Sprint 2.2: Tarefas CRUD
└─ Sprint 2.3: UI Sidebar + Taskbar

Phase 3: Calendário (Visualização)
├─ Sprint 3.1: Calendar Layout
├─ Sprint 3.2: Time Blocks Display
└─ Sprint 3.3: Drag-Drop Básico

Phase 4: Agendamento (Drag-Drop)
├─ Sprint 4.1: Drag-Drop para Agendar
├─ Sprint 4.2: Replanejamento
└─ Sprint 4.3: Remove from Calendar

Phase 5: Conclusão & Relatórios
├─ Sprint 5.1: Mark Complete (com input de tempo)
├─ Sprint 5.2: Cancel Task
├─ Sprint 5.3: Relatório de Métricas

Phase 6: Export & Polish
├─ Sprint 6.1: Export JSON
├─ Sprint 6.2: Bug Fixes & Refinamento
└─ Sprint 6.3: MVP Release

Phase 7: Task Types (Tipos de Tarefa - V1.1)
├─ Sprint 7.1: Task Types CRUD
├─ Sprint 7.2: Task Type Integration
└─ Sprint 7.3: Metrics by Type

```

**Duração Estimada MVP**: 2-3 semanas (depende da velocidade)
**Duração Estimada Phase 7**: 2-3 dias

---

## 📋 Phase 1: Foundation

### Sprint 1.1: Project Setup & Architecture

**Objetivo**: Configurar projeto Vite + estrutura base

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Criar projeto Vite: `npm create vite@latest time-blocking-system -- --template react`
- [x] Instalar dependências: `npm install`
- [x] Estruturar pastas (src/components, src/hooks, src/utils, src/context)
- [x] Criar `src/App.jsx` base (vazio por enquanto)
- [x] Criar `src/main.jsx` (mount app)
- [x] Criar `.gitignore`, `README.md` básico
- [x] Primeiro commit: "chore: project setup with Vite"

**Acceptance Criteria**:
- ✅ Projeto roda: `npm run dev`
- ✅ Estrutura de pastas criada
- ✅ Git inicializado e remoto vinculado

**Commit**: `73b2079` - feat: phase-1.1 - Project Setup & Architecture

---

### Sprint 1.2: Data Models & Context API

**Objetivo**: Definir estado global e Context

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Criar `src/context/AppContext.jsx`:
  - [x] Define esquema de estado: { projects: [], tasks: [], schedules: [] }
  - [x] Funções CRUD completas: addProject, updateProject, deleteProject, getProjects
  - [x] Funções CRUD tasks: addTask, updateTask, deleteTask, getTasks, getTasksByProject, getOffenderTasks
  - [x] addSchedule com validações
  
- [x] Criar `src/hooks/useAppContext.jsx`:
  - [x] Custom hook para usar context facilmente
  - [x] Validação de Provider
  
- [x] Criar `src/utils/uuid.js`:
  - [x] Gera UUIDs v4 corretamente (RFC 4122)
  
- [x] Criar `src/utils/validation.js`:
  - [x] validateProjectName (nome obrigatório, max 100 chars)
  - [x] validateTaskName (nome obrigatório, max 255 chars)
  - [x] validateScheduleTime (formato HH:MM, validação de range)
  - [x] validateDate (formato YYYY-MM-DD)
  
- [x] Atualizar `src/App.jsx`:
  - [x] Wrapear com AppContextProvider
  - [x] Layout base (Header, Sidebar, MainPanel)
  - [x] CSS flexbox responsivo

**Acceptance Criteria**:
- ✅ Context criado e testável
- ✅ UUIDs gerados corretamente
- ✅ Validações funcionam
- ✅ npm run dev sem erros

**Commits**: 
- `88c9cc2` - feat: phase-1.2 - Data Models & Context API
- `d7a6c30` - chore: setup GitHub Pages deployment
- `d429b8f` - chore: move index.html to root for Vite

---

### Sprint 1.3: localStorage Integration

**Objetivo**: Persistência de dados

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Criar `src/utils/storage.js`:
  - [x] `saveToLocalStorage(state)`: salva tudo
  - [x] `loadFromLocalStorage()`: carrega tudo
  - [x] `clearLocalStorage()`: limpa (para debug)
  - [x] Tratamento de erro (quota exceeded)
  
- [x] Criar `src/hooks/useLocalStorage.js`:
  - [x] Hook que sincroniza estado com localStorage
  - [x] Auto-save a cada mudança
  
- [x] Integrar em AppContext:
  - [x] useEffect que dispara saveToLocalStorage() a cada mudança de state
  - [x] useEffect no mount que carrega dados salvos
  
- [x] Testar: reload página, dados persistem

**Acceptance Criteria**:
- ✅ Dados salvam em localStorage
- ✅ Dados carregam ao abrir página
- ✅ Sem erros de JSON stringify/parse

**Commit**: `1b65022` - feat: phase-1.3 - localStorage Integration

---

## 📋 Phase 2: Core Features (CRUD)

### Sprint 2.1: Projetos CRUD

**Objetivo**: Criar, listar, editar, deletar projetos

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Implementar em AppContext:
  - [x] `addProject(name)`: cria novo projeto ✅ JÁ EXISTE
  - [x] `updateProject(id, name)`: edita nome ✅ JÁ EXISTE
  - [x] `deleteProject(id)`: soft delete (ativo: false) ✅ JÁ EXISTE
  - [x] `getProjects()`: retorna todos ativos ✅ JÁ EXISTE
  
- [x] Criar `src/components/TaskList/ProjectForm.jsx`:
  - [x] Input para nome com color picker
  - [x] Botão "Criar Projeto"
  - [x] Validações + mensagens de erro
  
- [x] Criar `src/components/TaskList/ProjectList.jsx`:
  - [x] Lista de projetos com cores
  - [x] Botão delete com confirmação
  - [x] Botão edit (abre form)
  - [x] Empty state

**Acceptance Criteria**:
- ✅ Criar projeto: nome aparece na lista
- ✅ Editar: nome/cor mudam
- ✅ Deletar: aviso de confirmação + remove
- ✅ Dados persistem em localStorage

**Commits**: `a88ff83` - feat: phase-2.1 - Projetos CRUD

---

### Sprint 2.2: Tarefas CRUD

**Objetivo**: Criar, listar, editar tarefas

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Implementar em AppContext:
  - [x] `addTask(name, project_id)`: project_id pode ser null ✅ JÁ EXISTE
  - [x] `updateTask(id, { nome?, projeto_id? })`: edita ✅ JÁ EXISTE
  - [x] `deleteTask(id)`: soft delete ✅ JÁ EXISTE
  - [x] `getTasks()`: todos ativos ✅ JÁ EXISTE
  - [x] `getTasksByProject(project_id)`: tarefas de um projeto ✅ JÁ EXISTE
  - [x] `getOffenderTasks()`: tarefas com projeto_id === null ✅ JÁ EXISTE
  
- [x] Criar `src/components/TaskList/TaskForm.jsx`:
  - [x] Input para nome com validação
  - [x] Dropdown para selecionar projeto
  - [x] Opção "Sem Projeto" (offensora)
  - [x] Validações e mensagens de erro
  
- [x] Criar `src/components/TaskList/TaskItem.jsx`:
  - [x] Exibe nome, projeto (com cor)
  - [x] Badge ⚠️ para offensoras
  - [x] Botão deletar com confirmação
  - [x] Visual diferenciado para "ofensoras"

- [x] Criar `src/components/TaskList/TaskList.jsx`:
  - [x] Lista tarefas abertas
  - [x] Botão "Nova Tarefa"
  - [x] Empty state

**Acceptance Criteria**:
- ✅ Criar tarefa: aparece na lista
- ✅ Criar sem projeto: marca como offensora
- ✅ Deletar: confirmação + remove
- ✅ Dados persistem em localStorage
- ✅ Validações funcionam

**Commits**: `8d13ed5` - feat: phase-2.2 - Tarefas CRUD

---

### Sprint 2.3: UI Sidebar + Layout Refinado

**Objetivo**: Interface refinada com estatísticas e abas

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Melhorar `src/components/Layout/Header.jsx`:
  - [x] Título: "Time Blocking System"
  - [x] Contadores: Projetos, Tarefas, Offensoras
  - [x] Visual com gradiente e estatísticas
  - [x] Responsivo
  
- [x] Melhorar `src/components/Layout/Sidebar.jsx`:
  - [x] Abas tabuladas: "Projetos" e "Tarefas"
  - [x] Seção de Projetos (com ProjectList)
  - [x] Seção de Tarefas Ofensoras (com alerta)
  - [x] Badges com contadores
  - [x] Scrollável e responsivo
  
- [x] Atualizar `src/components/Layout/MainPanel.jsx`:
  - [x] Integrar com TaskList
  - [x] Aprox. 70% da tela
  - [x] Layout flexível
  
- [x] Estilizar:
  - [x] Layout flexbox completo
  - [x] Cores consistentes e legíveis
  - [x] Responsive para desktop
  - [x] CSS modularizado

**Acceptance Criteria**:
- ✅ Sidebar com abas funcionando
- ✅ Header com estatísticas em tempo real
- ✅ Contadores atualizando
- ✅ Tarefas offensoras destacadas
- ✅ Layout responsivo
- ✅ Todos os botões funcionam

**Commits**: `2055318` - feat: phase-2.3 - UI Sidebar + Layout Refinado

---

## 📋 Phase 3: Calendário (Visualização)

### Sprint 3.1: Calendar Layout

**Objetivo**: Estrutura visual do calendário semanal

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Criar `src/components/Calendar/WeekCalendar.jsx`:
  - [x] Mostra semana atual (seg-dom)
  - [x] Navegação: botões < Anterior / Próxima >
  - [x] Botão "Hoje" para voltar à semana atual
  - [x] Grid: 7 colunas (dias), 17 linhas (horários)
  - [x] Horários: 06:00 até 22:00 (1h cada)
  
- [x] Criar `src/components/Calendar/DayColumn.jsx`:
  - [x] Componente para cada dia
  - [x] Mostra data + dia da semana
  - [x] Slots de 1h
  - [x] Destaque para dia atual
  
- [x] Criar `src/components/Calendar/TimeSlot.jsx`:
  - [x] Bloco horário individual
  - [x] Altura fixa 60px para 1h
  - [x] Cores alternadas para legibilidade
  - [x] Hoverable
  
- [x] Criar `src/utils/date.js`:
  - [x] getMonday, getWeekDates, formatDate, formatTime
  - [x] isSameDay, isToday, getDayName
  - [x] HOURS e WEEKDAYS constantes
  - [x] getWeekRange para exibir período

**Acceptance Criteria**:
- ✅ Calendário renderiza com 7 dias + horas
- ✅ Navegação muda a semana
- ✅ Datas corretas (hoje destacado com fundo azul)
- ✅ Slots vazios e posicionados corretamente

**Commits**: `9c3c90d` (com Sprint 3.2)

---

### Sprint 3.2: Time Blocks Display

**Objetivo**: Mostrar tarefas agendadas no calendário

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Criar `src/components/Calendar/ScheduleBlock.jsx`:
  - [x] Renderiza um bloco de tarefa agendada
  - [x] Mostra: horário, nome da tarefa
  - [x] Altura proporcional ao tempo (minutos/60 * 60px)
  - [x] Borda esquerda com cor do projeto
  - [x] Hover tooltip com detalhes
  
- [x] Integrar em `DayColumn`:
  - [x] Filtrar schedules ativos do dia
  - [x] Calcular posição: topOffset = (startMinutes - 360) / 60 * 60
  - [x] Renderizar ScheduleBlock sobre TimeSlots
  - [x] Suportar múltiplos blocos no mesmo dia
  
- [x] Estilizar:
  - [x] Cores por projeto (borda esquerda)
  - [x] Shadow e bordas arredondadas
  - [x] Typography clara (10-11px)
  - [x] Z-index para sobreposição

**Acceptance Criteria**:
- ✅ Tarefa agendada aparece no calendário
- ✅ Posição correta (dia + hora)
- ✅ Tamanho proporcional ao tempo (ex: 2h = 120px)
- ✅ Múltiplas tarefas no mesmo dia suportadas

**Commits**: `9c3c90d` - feat: phase-3.1 & 3.2 - Calendar Layout + Time Blocks Display

---

### Sprint 3.3: Drag-Drop Básico (Prep)

**Objetivo**: Preparar infraestrutura de drag-drop

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Instalar: `npm install react-beautiful-dnd` (v13.1.1)
  
- [x] App.jsx com DragDropContext:
  - [x] Wrap DragDropContext
  - [x] onDragEnd handler com console.log
  - [x] Pronto para handlers em Phase 4
  
- [x] TaskItem.jsx como Draggable:
  - [x] Wrappear com `Draggable`
  - [x] Adicionar index prop
  - [x] Drag handle via refs
  - [x] Visual feedback: .dragging state
  
- [x] TaskList.jsx com Droppable:
  - [x] Wrappear com `Droppable` ("tasks-list")
  - [x] Placeholder support
  - [x] Drag-over state visual
  - [x] Integração com tasks
  
- [x] CSS para drag states:
  - [x] .task-item.dragging (opacity, shadow)
  - [x] .tasks-list.drag-over (fundo azul, borda)
  - [x] Cursor grab/grabbing

**Acceptance Criteria**:
- ✅ Drag funciona (visual feedback, cursor)
- ✅ Droppable região funciona (drag-over state)
- ✅ Console logs de eventos em App
- ✅ Pronto para implementar agendamento

**Commits**: `be1010a` - feat: phase-3.3 - Drag-Drop Básico (Prep)

---

## 📋 Phase 4: Agendamento (Drag-Drop)

### Sprint 4.1: Drag-Drop para Agendar

**Objetivo**: Implementar F5 - Agendar Tarefa

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Em AppContext:
  - [x] `addSchedule(tarefa_id, data, hora_inicio, hora_fim)`: cria Schedule ✅
  - [x] Atualiza tarefa: estado → 'agendada' ✅
  
- [x] Em `App.jsx`:
  - [x] handleDragEnd com type === 'SCHEDULE'
  - [x] Detecta drop em timeslot-*
  - [x] Extrai date e hour
  - [x] Chama `addSchedule()` com 1h default
  
- [x] Validações:
  - [x] Data e hora validadas
  - [x] Erro feedback ao usuário
  
- [x] Feedback visual:
  - [x] Mensagem de sucesso em console
  - [x] Tarefa aparece no calendário
  - [x] Desaparece da lista de tarefas abertas

**Acceptance Criteria**:
- ✅ Drag tarefa para calendário: agendada
- ✅ Tarefa não aparece mais na lista "abertas"
- ✅ Aparece no calendário, posição correta
- ✅ Dados persistem

**Commits**: `bc35d09` - feat: phase-4.1 - Drag-Drop para Agendar

---

### Sprint 4.2: Replanejamento

**Objetivo**: Implementar F6 - Replanear (drag tarefa já agendada)

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Em AppContext:
  - [x] `rescheduleTask(tarefa_id, nova_data, nova_hora_inicio, nova_hora_fim)`: ✅
    - [x] Marca agendamento anterior: ativo: false
    - [x] Cria novo Schedule
    - [x] Incrementa `historico_replanejamentos++`
    - [x] Adiciona timestamp a `datas_replanejamento[]`
  
- [x] Em `ScheduleBlock`:
  - [x] Draggable com type RESCHEDULE
  - [x] draggableId format: `schedule-{tarefa_id}-{schedule_id}`
  
- [x] Em `App.jsx`:
  - [x] handleDragEnd detecta type === 'RESCHEDULE'
  - [x] Chama `rescheduleTask()` com nova data/hora
  
- [x] Feedback visual:
  - [x] ScheduleBlock move no calendário
  - [x] Opacity 0.7 durante drag
  - [x] Contador de replanejamentos funcional

**Acceptance Criteria**:
- ✅ Drag tarefa agendada para novo horário: muda
- ✅ Contador de replanejamentos aumenta
- ✅ Histórico de datas registrado
- ✅ Dados persistem

**Commits**: `a9b8011` - feat: phase-4.2 - Replanejamento

---

### Sprint 4.3: Remove from Calendar

**Objetivo**: Implementar F7 - Remover de Calendário

**Status**: ✅ **COMPLETO** (21/05/2026)

**Tasks**:
- [x] Em AppContext:
  - [x] `unscheduleTask(tarefa_id)`: ✅
    - [x] Marca Schedule: ativo: false
    - [x] Atualiza tarefa: estado → 'aberta'
  
- [x] Em `ScheduleBlock`:
  - [x] Botão remove (✕) com red background
  - [x] Hidden por padrão, aparece on hover
  - [x] Click: chama `unscheduleTask()` com confirmação
  - [x] title attribute com detalhes
  
- [x] CSS Styling:
  - [x] .block-remove com red background
  - [x] Transição suave opacity
  - [x] Z-index management para overlay

**Acceptance Criteria**:
- ✅ Botão X em tarefa agendada: remove do calendário
- ✅ Tarefa volta ao sidebar
- ✅ Dados persistem
- ✅ Confirmação antes de remover

**Commits**: `a9b8011` - feat: phase-4.3 - Remove from Calendar

---

## 📋 Phase 5: Conclusão & Relatórios

### Sprint 5.1: Mark Complete

**Objetivo**: Implementar F8 - Marcar Concluída

**Tasks**:
- [ ] Criar `src/components/CompleteTaskModal.jsx`:
  - Input para "Tempo Gasto" (em horas, decimal)
  - Botão "Concluir"
  - Validação: número positivo
  
- [ ] Em AppContext:
  - `completeTask(tarefa_id, tempo_gasto)`:
    - Atualiza tarefa: estado → 'concluída'
    - tempo_gasto = valor fornecido
    - data_conclusao = now()
    - Se estava agendada: marca Schedule: ativo: false
  
- [ ] Em `TaskItem`:
  - Botão "Concluir" (ou checkmark)
  - Click: abre modal
  
- [ ] Feedback visual:
  - Tarefa desaparece do sidebar
  - Se estava no calendário: desaparece
  - Dados prontos para relatório

**Acceptance Criteria**:
- ✅ Click "Concluir": abre modal
- ✅ Input tempo: valida
- ✅ Salva: tarefa desaparece
- ✅ Dados persistem

---

### Sprint 5.2: Cancel Task

**Objetivo**: Implementar F9 - Cancelar Tarefa

**Tasks**:
- [ ] Em AppContext:
  - `cancelTask(tarefa_id)`:
    - estado → 'cancelada'
    - data_cancelamento = now()
    - Se agendada: marca Schedule: ativo: false
  
- [ ] Em `TaskItem`:
  - Botão "Cancelar"
  - Click: confirmação + executa
  
- [ ] Feedback visual:
  - Tarefa desaparece
  - Avisos claros (confirmação)

**Acceptance Criteria**:
- ✅ Botão Cancelar com confirmação
- ✅ Tarefa desaparece
- ✅ Dados persistem

---

### Sprint 5.3: Relatório de Métricas

**Objetivo**: Implementar F16 - Dashboard de Métricas

**Tasks**:
- [ ] Criar `src/components/MetricsPanel.jsx`:
  - Por cada projeto:
    - Tempo gasto total (sum de tempo_gasto, tarefas concluídas)
    - Tarefas concluídas
    - Tarefas canceladas
    - Tarefas em aberto
    - Replanejamentos totais
  
  - Seção "Ofensoras":
    - Tarefas em aberto sem projeto
    - Alerta: "⚠️ Tarefas não alignadas a nenhum objetivo"
  
- [ ] Em AppContext:
  - Funções de cálculo: `getMetricsByProject()`, `getMetricsOverall()`
  
- [ ] Estilizar:
  - Cards ou tabela
  - Cores destacam problemas (ofensoras)
  - Números grandes e legíveis

**Acceptance Criteria**:
- ✅ Painel mostra métricas corretas
- ✅ Atualiza ao concluir/cancelar tarefas
- ✅ Seção de ofensoras clara

---

## 📋 Phase 6: Export & Polish

### Sprint 6.1: Export JSON

**Objetivo**: Implementar F14 - Exportar Dados

**Tasks**:
- [ ] Criar `src/utils/export.js`:
  - `exportToJSON()`: serializa estado + gera blob
  - Trigger download automático
  - Nome arquivo: `timeblocking-export-YYYY-MM-DD.json`
  
- [ ] Criar `src/components/ExportButton.jsx`:
  - Botão "Exportar Dados"
  - Click: chama export
  - Feedback: "✅ Exportado!"
  
- [ ] Testar:
  - Download funciona
  - JSON é válido
  - Pode reimportar depois (V2)

**Acceptance Criteria**:
- ✅ Botão funciona
- ✅ Arquivo baixado
- ✅ JSON válido e legível

---

### Sprint 6.2: Bug Fixes & Refinement

**Objetivo**: Polir MVP

**Tasks**:
- [ ] Testar fluxos:
  - Criar projeto → tarefa → agendar → concluir
  - Replanear múltiplas vezes
  - Reload página: dados persistem?
  
- [ ] Corrigir bugs encontrados
  
- [ ] UX refinements:
  - Confirmações claras
  - Mensagens de erro
  - Loading indicators (se necessário)
  - Acessibilidade básica (alt text, ARIA labels)
  
- [ ] Performance:
  - Não deve ser lento com 100+ tarefas
  - Sem memory leaks (React DevTools)

**Acceptance Criteria**:
- ✅ Sem bugs critério
- ✅ UX polida
- ✅ Performance OK

---

### Sprint 6.3: MVP Release

**Objetivo**: Finalizar e preparar launch

**Tasks**:
- [ ] README.md completo:
  - Como instalar
  - Como usar (quick start)
  - Features listadas
  - Screenshots (opcional)
  
- [ ] Clean up:
  - Remove console.logs
  - Remove código de debug
  - Formatar código (Prettier)
  
- [ ] Últimos testes (manual)
  
- [ ] Release commit: `chore: MVP v1.0 release`
  
- [ ] Tag no GitHub: `v1.0`

**Acceptance Criteria**:
- ✅ README completo
- ✅ Código limpo
- ✅ Sem bugs conhecidos
- ✅ Release pronto

---

## 📋 Phase 7: Task Types (Tipos de Tarefa Configuráveis)

### Sprint 7.1: Task Types CRUD

**Objetivo**: Criar, listar, editar, deletar tipos de tarefa

**Status**: ✅ **COMPLETO** (22/05/2026)

**Tasks**:
- [x] Atualizar `src/context/AppContext.jsx`:
  - [x] Adicionar estado `taskTypes: []`
  - [x] `addTaskType(name, color)`: cria novo tipo
  - [x] `updateTaskType(id, { name?, color? })`: edita tipo
  - [x] `deleteTaskType(id)`: soft delete (ativo: false)
  - [x] `getTaskTypes()`: retorna todos ativos
  
- [x] Criar `src/components/TaskList/TaskTypeForm.jsx`:
  - [x] Input para nome do tipo
  - [x] Color picker para cor (opcional)
  - [x] Botão "Criar Tipo"
  - [x] Validações + mensagens de erro
  
- [x] Criar `src/components/TaskList/TaskTypeList.jsx`:
  - [x] Lista de tipos com cores
  - [x] Botão delete com confirmação
  - [x] Botão edit (abre form)
  - [x] Empty state com sugestão de tipos padrão (Bug, Feature, Refactor, Meeting, Admin)
  
- [x] Integrar no TaskList/Sidebar:
  - [x] Aba/seção para "Tipos de Tarefa"
  - [x] Mostrar TaskTypeForm e TaskTypeList
  
- [x] Atualizar localStorage:
  - [x] Salvar/carregar taskTypes junto com projects e tasks

**Acceptance Criteria**:
- ✅ Criar tipo: nome e cor aparecem na lista
- ✅ Editar: nome/cor mudam
- ✅ Deletar: confirmação + remove
- ✅ Dados persistem em localStorage
- ✅ Sem console errors

**Commit**: `cb48483` - feat: phase-7.1 - Task Types CRUD implementation

---

### Sprint 7.2: Task Type Integration

**Objetivo**: Integrar tipos de tarefa com tarefas existentes

**Status**: ⏳ **PRÓXIMO** (após 7.1)

**Tasks**:
- [ ] Atualizar modelo de Tarefa em SPECS.md (se necessário):
  - [ ] Adicionar campo `task_type_id: string | null` (pode ser null para tarefas antigas)
  
- [ ] Atualizar `src/context/AppContext.jsx`:
  - [ ] `updateTask()` agora aceita `task_type_id`
  - [ ] Validação de task_type_id existe
  
- [ ] Atualizar `src/components/TaskList/TaskForm.jsx`:
  - [ ] Adicionar select/dropdown para escolher tipo
  - [ ] Mostrar cores dos tipos no dropdown
  - [ ] Campo "Tipo" é opcional
  - [ ] Quando nenhum tipo, exibir "(sem tipo)"
  
- [ ] Atualizar `src/components/TaskList/TaskItem.jsx`:
  - [ ] Mostrar cor/badge do tipo de tarefa (se existir)
  - [ ] Exemplo: "🔴 Bug" ou cor de fundo
  
- [ ] Atualizar `src/components/Calendar/ScheduleBlock.jsx`:
  - [ ] Mostrar cor/tipo da tarefa no bloco de calendário
  - [ ] Melhorar visualização com cor do tipo

**Acceptance Criteria**:
- ✅ Criar tarefa com tipo: tipo aparece na lista
- ✅ Editar tarefa: consegue mudar tipo
- ✅ Visualização: cor/badge do tipo aparece em TaskItem e ScheduleBlock
- ✅ localStorage: tipo_id salvo e carregado corretamente
- ✅ Sem console errors

**Commit**: `6e14bcf` - feat: phase-7.2 - Task Type Integration

**Acceptance Criteria**:
- ✅ Task type dropdown in TaskForm with all available types
- ✅ Task type badge displayed in TaskItem with correct color
- ✅ ScheduleBlock border color matches task type (or project if no type)
- ✅ localStorage persists task_type_id correctly
- ✅ Sem console errors

---

### Sprint 7.3: Metrics by Task Type

**Objetivo**: Expandir relatório de métricas para mostrar horas por tipo de tarefa

**Status**: ✅ **COMPLETO** (23/05/2026)

**Tasks**:
- [ ] Atualizar `src/components/Metrics/MetricsPanel.jsx`:
  - [ ] Adicionar nova seção/card: "Horas por Tipo de Tarefa"
  - [ ] Calcular total de horas_gasto agrupado por task_type_id
  - [ ] Mostrar como tabela ou gráfico simples (opcional)
  - [ ] Incluir total geral no rodapé
  
- [ ] Criar função helper em `src/utils/metrics.js`:
  - [ ] `calculateHoursByTaskType(tasks, taskTypes)`: retorna { type_name: hours }
  - [ ] Tratar tarefas sem tipo (categoria "Sem Tipo")
  - [ ] Ordenar por horas (maior primeiro)
  
- [ ] Atualizar `src/hooks/useProjects.js` (ou criar novo hook):
  - [ ] Exportar função para calcular horas por tipo
  - [ ] Memoizar resultado para performance
  
- [ ] Testes visuais:
  - [ ] Criar algumas tarefas de tipos diferentes
  - [ ] Marcar como concluído com tempos diferentes
  - [ ] Verificar que métricas mostram corretamente

**Acceptance Criteria**:
- ✅ Métricas mostram "Horas por Tipo"
- ✅ Cálculo está correto (soma de tempo_gasto por tipo)
- ✅ Tarefas sem tipo aparecem como "Sem Tipo"
- ✅ Ordenação está clara (maior primeiro)
- ✅ Sem console errors

**Commit**: `001800f` - feat: phase-7.3 - Metrics by Task Type

---

## 📊 Estimativas

| Phase | Sprints | Estimativa | Status |
|-------|---------|-----------|--------|
| 1     | 3       | 3-4 dias  | ✅ COMPLETO |
| 2     | 3       | 4-5 dias  | ✅ COMPLETO |
| 3     | 3       | 4-5 dias  | ✅ COMPLETO |
| 4     | 3       | 5-6 dias  | ✅ COMPLETO |
| 5     | 3       | 4-5 dias  | ✅ COMPLETO |
| 6     | 3       | 2-3 dias  | ✅ COMPLETO |
| 7     | 3       | 2-3 dias  | ✅ COMPLETO |
| **MVP Total** | **18** | **22-28 dias** | ✅ PRONTO |
| **Feature Total** | **3** | **2-3 dias** | ⏳ INICIANDO |

**Notas**:
- Estimativas assumem 1-2 horas/dia dedicadas
- Podem variar baseado em complexidade encontrada
- Drag-drop é a parte mais complexa (Phase 4)

---

## 🔄 Processo de Trabalho

Para **cada Sprint**:

1. **Planning**: Revisar tasks, clarificar dúvidas
2. **Development**: Claude Code implementa, você revisa PRs
3. **Testing**: Testar manualmente no navegador
4. **Refinement**: Ajustar se necessário
5. **Commit**: Merge da PR, commit com mensagem clara

**Padrão de PR**:
```
Title: feat: [Phase].[Sprint] - Descrição

Body:
- Implementa: Feature X, Y
- Testes: Testado em navegador
- Checklist:
  - [ ] Feature funciona
  - [ ] localStorage persiste
  - [ ] Sem console errors
```

---

## ✅ Checkpoint de Aprovação

- **Revisor**: Usuário
- **Status**: ✅ Pronto para CLAUDE.md
- **Próximo**: CLAUDE.md (instruções para Claude Code)

