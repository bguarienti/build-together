# Time Blocking System - Technical Specifications

**Versão**: 1.1  
**Data**: 22 de Maio de 2026  
**Status**: ✅ Aprovado (v1.1 - Adicionado TaskType)

**Histórico**:
- v1.0 (21/05): Especificações base para MVP
- v1.1 (22/05): TaskType para tipos de tarefa configuráveis  

---

## 📌 Overview

Especificações técnicas detalhadas para implementação do Time Blocking System. Este documento complementa FEATURES.md com decisões de design, estruturas de dados, e diretrizes técnicas.

---

## 🏗️ Decisões de Arquitetura

### Stack Escolhido
- **Frontend**: React 18+ (com Hooks)
- **Persistência**: localStorage (primary) + JSON export/import
- **Build Tool**: Vite
- **Styling**: CSS-in-JS ou Tailwind (a definir em CLAUDE.md)
- **State Management**: React Context API (começar simples)
- **Testing**: Vitest + React Testing Library (MVP sem testes, adicionar depois)

### Sem Backend (Por Enquanto)
- Todos os dados vivem no navegador (localStorage)
- Zero requisições HTTP externas
- Máxima privacidade e funcionamento offline
- Exportação manual para JSON como backup

---

## 📊 Modelo de Dados

### Projeto (Project)
```javascript
{
  id: string (UUID v4),
  nome: string (1-255 chars),
  cor?: string (hex - para visual diferenciado, opcional),
  data_criacao: timestamp,
  ativo: boolean (soft delete)
}
```

**Validações**:
- `nome`: obrigatório, mínimo 1 char, máximo 255
- `id`: gerado automaticamente, único

---

### Tipo de Tarefa (Task Type) - NOVO v1.1
```javascript
{
  id: string (UUID v4),
  nome: string (1-100 chars),
  cor?: string (hex color - opcional, ex: #FF5733),
  data_criacao: timestamp,
  ativo: boolean (soft delete)
}
```

**Validações**:
- `nome`: obrigatório, mínimo 1 char, máximo 100
- `cor`: opcional, formato hex válido (ex: #RRGGBB)
- `id`: gerado automaticamente, único
- Um projeto pode ter múltiplos tipos de tarefa
- Tipos padrão sugeridos: "Bug", "Feature", "Refactor", "Meeting", "Admin"

**Observações**:
- Tipos de tarefa são globais (não limitados a um projeto)
- Uma tarefa referencia um tipo via `task_type_id`
- Deletar um tipo não deleta tarefas (apenas remove referência, task_type_id fica null)

---

### Tarefa (Task)
```javascript
{
  id: string (UUID v4),
  nome: string (1-255 chars),
  projeto_id: string | null,
  task_type_id?: string | null (NOVO v1.1 - referência a TaskType),
  estado: 'aberta' | 'agendada' | 'concluída' | 'cancelada',
  
  // Planejamento
  tempo_planejado: number | null (em horas, decimal),
  data_agendado: timestamp | null,
  
  // Execução
  tempo_gasto: number | null (em horas, decimal),
  data_conclusao: timestamp | null,
  data_cancelamento: timestamp | null,
  
  // Rastreamento de Impetuosidade
  historico_replanejamentos: number (contador),
  datas_replanejamento: timestamp[] (array de quando foi replanejado),
  
  // Metadata
  data_criacao: timestamp,
  ativo: boolean (soft delete)
}
```

**Validações**:
- `nome`: obrigatório, mínimo 1 char, máximo 255
- `projeto_id`: pode ser null (tarefa ofensora)
- `task_type_id`: opcional, pode ser null, deve referenciar um TaskType válido se preenchido
- `tempo_planejado`: número positivo ou null
- `tempo_gasto`: número positivo ou null (só preenchido se estado === 'concluída')
- Transições de estado: aberta → (agendada|cancelada) → concluída|cancelada

**Compatibilidade v1.0 → v1.1**:
- Tarefas criadas em v1.0 não terão `task_type_id` (será undefined/null)
- Sistema deve tratar task_type_id null graciosamente
- Não há migração necessária de dados existentes

---

### Agendamento (Schedule Entry)
```javascript
{
  id: string (UUID v4),
  tarefa_id: string (referência a Task),
  data: date (YYYY-MM-DD),
  hora_inicio: string (HH:MM, formato 24h),
  hora_fim: string (HH:MM, formato 24h),
  data_criacao: timestamp,
  ativo: boolean
}
```

**Validações**:
- `hora_inicio` < `hora_fim`
- `data` deve ser no futuro (ou hoje)
- Uma tarefa só pode ter um agendamento ativo por vez
- Ao replanear, o agendamento anterior é marcado como `ativo: false` (não deletar)

---

## 🗄️ Estrutura de localStorage

```javascript
// Chave: 'timeblocking-app-v1'
{
  version: '1.1', // ATUALIZADO v1.1
  lastUpdated: timestamp,
  projects: Project[],
  tasks: Task[],
  schedules: ScheduleEntry[],
  taskTypes: TaskType[] // NOVO v1.1
}
```

**Estratégia de Versionamento**:
- Se versão local < versão esperada: mostrar aviso de migração
- v1.0 → v1.1: adicionar `taskTypes: []` se não existir (migração automática)
- Estrutura simples, evitar complexidade excessiva

**Migração v1.0 → v1.1**:
```javascript
// Se versão < 1.1 e não tem taskTypes, adicionar:
if (!data.taskTypes) {
  data.taskTypes = [];
  data.version = '1.1';
}
```

---

## 🎨 Estrutura de UI/UX

### Layout Principal
```
┌─────────────────────────────────────────┐
│  Header (Título + Ações Globais)       │
├─────────────────────┬───────────────────┤
│                     │                   │
│  Barra Lateral      │  Painel Principal │
│  (Tarefas)          │  (Calendário)     │
│                     │                   │
│  - Projetos         │  Seg | Ter | Qua │
│  - Tarefas Abertas  │  Qui | Sex | Sab │
│  - Ofensoras        │  Dom             │
│                     │                   │
│  Ações:             │  [Blocos de Tempo]
│  + Novo Projeto     │                   │
│  + Nova Tarefa      │                   │
│                     │                   │
└─────────────────────┴───────────────────┘
```

### Barra Lateral (Left Sidebar)
- **Estrutura**:
  - Botão "Novo Projeto"
  - Lista de Projetos (cada um é um collapsible)
    - Tarefas do projeto (aberta | agendada)
  - Seção "Tarefas Ofensoras" (visual diferenciado)
  - Tarefas abertas sem projeto

- **Interações**:
  - Drag-drop de tarefa para calendário
  - Click para editar/deletar
  - Visual de "ofensora" (ex: ⚠️ ícone ou cor vermelha)

### Calendário Semanal (Main Panel)
- **Grid**:
  - Eixo horizontal: Dias da semana (seg-dom)
  - Eixo vertical: Blocos de tempo (intervals de 1h)
  - Horários: 06:00 - 22:00 (16 horas visíveis)
  - Scroll vertical para ver mais horários

- **Blocos de Tarefa**:
  - Arrastáveis (drag-drop)
  - Mostram nome da tarefa + tempo planejado
  - Cor baseada no projeto
  - Hover: mostra detalhes (tempo, projeto, status)

---

## 🔄 Fluxos de Interação

### F1: Criar Novo Projeto
**Entrada**: Nome do projeto  
**Processo**:
1. Validar nome (obrigatório, 1-255 chars)
2. Gerar UUID
3. Salvar em estado (projects array)
4. Persistir em localStorage
5. UI atualiza imediatamente (sidebar)

**Saída**: Projeto criado, aparece na sidebar

---

### F2/F3: Criar Tarefa
**Entrada**: Nome + Projeto (opcional)  
**Processo**:
1. Validar nome (obrigatório, 1-255 chars)
2. Se projeto_id não fornecido: marcar como ofensora
3. Gerar UUID, timestamps
4. Estado inicial: 'aberta'
5. Adicionar a tasks array
6. Persistir em localStorage

**Saída**: Tarefa aparece na sidebar (sob projeto ou seção ofensoras)

---

### F5: Agendar Tarefa (Drag-Drop para Calendário)
**Entrada**: Tarefa + Data + Hora (drag-drop do bloco)  
**Processo**:
1. Ao começar drag: capturar tarefa_id
2. Ao hover no calendário: mostrar preview onde vai cair
3. Ao soltar (drop):
   - Extrair data + hora_inicio do elemento onde caiu
   - Calcular hora_fim (hora_inicio + tempo_planejado ou 1h default)
   - Criar ScheduleEntry com ativo: true
   - Marcar agendamentos anteriores como ativo: false
   - Atualizar tarefa: estado → 'agendada', data_agendado → now()
   - Persistir em localStorage

**Saída**: Tarefa visível no calendário, estado muda para 'agendada'

---

### F6: Replanear Tarefa (Drag-Drop Existente)
**Entrada**: Tarefa já agendada + Nova data/hora  
**Processo**:
1. Mesmo que F5, mas:
2. Incrementar `historico_replanejamentos++`
3. Adicionar timestamp atual a `datas_replanejamento[]`
4. Marcar agendamento anterior como ativo: false (histórico)
5. Criar novo ScheduleEntry com ativo: true
6. Persistir em localStorage

**Saída**: Tarefa movida no calendário, contador de replanejamentos aumenta

---

### F7: Remover de Calendário
**Entrada**: Tarefa agendada  
**Processo**:
1. Marcar ScheduleEntry como ativo: false
2. Atualizar tarefa: estado → 'aberta', data_agendado → null
3. Persistir em localStorage

**Saída**: Tarefa volta à sidebar, desaparece do calendário

---

### F8: Marcar Como Concluída
**Entrada**: Tarefa + Tempo gasto (em horas)  
**Processo**:
1. Validar tempo_gasto (número positivo)
2. Atualizar tarefa:
   - estado → 'concluída'
   - tempo_gasto → valor fornecido
   - data_conclusao → now()
3. Se estava agendada: marcar ScheduleEntry como ativo: false
4. Persistir em localStorage

**Saída**: Tarefa desaparece da sidebar, dados persistidos para relatório

---

### F9: Cancelar Tarefa
**Entrada**: Tarefa  
**Processo**:
1. Atualizar tarefa:
   - estado → 'cancelada'
   - data_cancelamento → now()
2. Se estava agendada: marcar ScheduleEntry como ativo: false
3. Persistir em localStorage
4. Requer confirmação antes de executar

**Saída**: Tarefa removida da UI (mantém histórico)

---

### F10: Editar Tarefa
**Entrada**: Tarefa + Campos a editar (nome, projeto, tempo_planejado)  
**Processo**:
1. Validar novos valores
2. Atualizar objeto tarefa
3. Se tempo_planejado mudou e está agendada:
   - Recalcular hora_fim do agendamento
4. Persistir em localStorage

**Saída**: Tarefa atualizada, UI reflex imediatamente

---

### F13: Salvar em localStorage
**Trigger**: Toda mudança no estado  
**Processo**:
1. Serializar estado (projects + tasks + schedules)
2. Salvar em chave 'timeblocking-app-v1'
3. Usar JSON.stringify/parse
4. Tratamento de erro (quota exceeded, etc)

**Saída**: Dados persistidos

---

### F14: Exportar para JSON
**Entrada**: Click em botão "Exportar"  
**Processo**:
1. Coletar todos os dados de localStorage
2. Serializar para JSON legível (indent 2)
3. Gerar blob
4. Trigger download com nome `timeblocking-export-YYYY-MM-DD.json`

**Saída**: Arquivo JSON baixado no dispositivo

---

### F16: Relatório de Tempo por Projeto
**Entrada**: Nenhuma (dados já em localStorage)  
**Processo**:
1. Iterar tarefas com estado === 'concluída'
2. Agrupar por projeto_id
3. Somar tempo_gasto por projeto
4. Contar tarefas (concluídas, canceladas, em aberto)
5. Contar replanejamentos por projeto

**Saída**: Painel com métricas:
```
Projeto A
├─ Tempo gasto: 12.5h
├─ Tarefas concluídas: 8
├─ Tarefas canceladas: 2
├─ Replanejamentos: 15

Projeto B
├─ Tempo gasto: 5h
├─ Tarefas concluídas: 3
├─ Tarefas canceladas: 0
├─ Replanejamentos: 3

Ofensoras
├─ Tarefas em aberto: 2
```

---

## 📱 Responsividade

- **MVP**: Desktop first (1200px+)
- **Sidebar**: 280px width
- **Main**: flex-grow
- **Mobile**: não é prioridade no MVP (pode quebrar gracefully)

---

## ⚠️ Tratamento de Erros

### localStorage Indisponível
- Mostrar aviso: "Seu navegador não suporta localStorage"
- App funciona em memória (mas dados perdem ao refresh)

### JSON Inválido ao Importar
- Validar estrutura mínima
- Mostrar erro específico
- Não sobrescrever dados válidos

### Conflito de Drag-Drop
- Se soltar tarefa fora de um horário válido: cancelar (volta ao original)
- Se overlap de agendamentos: avisar e cancelar

---

## 🧪 MVP Scope - O Que Entra

**Incluído**:
- ✅ CRUD de Projetos
- ✅ CRUD de Tarefas
- ✅ Agendamento (drag-drop básico)
- ✅ Replanejamento (drag-drop existente)
- ✅ Marcar como concluída (com input de tempo)
- ✅ localStorage automático
- ✅ Exportar JSON
- ✅ Visualizar ofensoras
- ✅ Relatório básico (painel de métricas)

**Não Incluído (V2)**:
- ❌ Importar JSON (complexidade validation)
- ❌ Deletar permanentemente (soft delete suficiente)
- ❌ Timer/Pomodoro (manual apenas)
- ❌ Responsividade mobile
- ❌ Testes automatizados
- ❌ Dark mode
- ❌ Notificações

---

## 🔐 Privacidade & Segurança

- ✅ Dados NUNCA saem do navegador
- ✅ localStorage é local do device
- ✅ Export JSON é manual (usuário controla)
- ✅ Sem autenticação (não needed, dados locais)
- ⚠️ localStorage pode ser acessado via DevTools (esperado)

---

## 📋 Convenções de Código (SDD)

**Nomeação**:
- Componentes React: PascalCase (`TaskList.jsx`, `CalendarView.jsx`)
- Funções: camelCase (`addTask()`, `saveToLocalStorage()`)
- Constantes: UPPER_SNAKE_CASE (`DEFAULT_BLOCK_HEIGHT = 60`)

**Estrutura de Pastas**:
```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── MainPanel.jsx
│   ├── TaskList/
│   │   ├── TaskList.jsx
│   │   ├── TaskItem.jsx
│   │   └── ProjectGroup.jsx
│   └── Calendar/
│       ├── WeekCalendar.jsx
│       ├── DayColumn.jsx
│       ├── TimeBlock.jsx
│       └── ScheduleBlock.jsx
├── hooks/
│   ├── useLocalStorage.js
│   ├── useTasks.js
│   ├── useProjects.js
│   └── useSchedule.js
├── utils/
│   ├── storage.js (funções localStorage)
│   ├── uuid.js (gerar UUIDs)
│   ├── date.js (manipular datas)
│   ├── validation.js (validações)
│   └── export.js (export JSON)
├── context/
│   └── AppContext.js (Context API para estado global)
├── App.jsx
└── main.jsx
```

---

## 🎯 Performance & Otimizações (Futura)

- Lazy load de componentes (se > 100 tarefas)
- Memoization de componentes (React.memo)
- Virtual scrolling para calendário (se > 1000 agendamentos)
- Indexação em memória (Map de tarefa_id para rápido lookup)

**MVP**: Performance OK até 500 tarefas/projeto

---

## ✅ Aprovação

- **Revisado por**: Usuário
- **Status**: ✅ Pronto para PLANS.md
- **Próximo Passo**: PLANS.md (quebrar em sprints/fases)
