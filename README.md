# ⏱️ Time Blocking System

Um sistema web completo para organização de tarefas com time blocking e agendamento semanal.

## 🎯 Features

- **Gerenciamento de Projetos**: Crie e organize projetos com cores personalizadas
- **Tarefas com Rastreamento**: Adicione tarefas a projetos ou deixe "ofensoras" (sem projeto)
- **Tipos de Tarefa Configuráveis**: Crie tipos personalizados (Bug, Feature, Refactor, etc) e classifique suas tarefas
- **Calendário Semanal**: Visualize e organize suas tarefas em um calendário semanal interativo
- **Drag & Drop**: Agende tarefas arrastando-as para o calendário
- **Replanejamento**: Mude a data/hora de tarefas já agendadas
- **Conclusão com Rastreamento**: Marque tarefas como concluídas com tempo gasto
- **Cancelamento**: Cancele tarefas quando necessário
- **Dashboard de Métricas**: Visualize estatísticas de tempo gasto, tarefas concluídas, canceladas, etc.
- **Métricas por Tipo**: Veja análise de horas gastas separadas por tipo de tarefa
- **Exportação de Dados**: Exporte todos seus dados em JSON para backup
- **Persistência Automática**: Todos os dados são salvos automaticamente em localStorage

## 🚀 Como Usar

### Instalação

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173/local-time-blocking/`

### Build para Produção

```bash
npm run build
npm run deploy
```

## 📋 Fluxo Básico

1. **Configure Tipos de Tarefa** (opcional): Vá para a aba "🏷️ Tipos" e crie tipos personalizados (Bug, Feature, etc)
2. **Crie Projetos**: Vá para a aba "📁 Projetos" no sidebar e crie seus projetos
3. **Crie Tarefas**: Na aba "✓ Tarefas", adicione tarefas associadas aos projetos (e escolha um tipo se desejar)
4. **Agende no Calendário**: Arraste tarefas do sidebar para o calendário na data e hora desejadas
5. **Replaneje**: Se precisar mudar, arraste a tarefa agendada para um novo horário
6. **Marque como Concluída**: Clique no ✓ da tarefa para marcar como concluída (informando tempo gasto)
7. **Acompanhe Métricas**: Vá para a aba "Métricas" para ver suas estatísticas (por projeto e por tipo de tarefa)

## 🛠️ Stack Técnico

- **Frontend**: React 18 + Vite
- **State Management**: Context API
- **Persistência**: localStorage
- **Drag & Drop**: react-beautiful-dnd v13.1.1
- **Estilos**: CSS puro

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Layout/         # Header, Sidebar, MainPanel
│   ├── TaskList/       # Componentes de tarefas e projetos
│   ├── Calendar/       # Calendário e agendamento
│   ├── Metrics/        # Dashboard de métricas
│   ├── Common/         # Componentes reutilizáveis
│   └── ExportButton.jsx
├── context/            # AppContext para state global
├── hooks/              # Custom hooks
├── utils/              # Funções utilitárias
└── App.jsx            # Componente raiz
```

## 💾 Dados

Os dados são persistidos em `localStorage` com a chave `timeblocking-app-v1`.

### Estrutura de Dados

**Projeto**:
```javascript
{
  id: "uuid",
  nome: "string",
  cor: "hex color or null",
  data_criacao: timestamp,
  ativo: boolean
}
```

**Tarefa**:
```javascript
{
  id: "uuid",
  nome: "string",
  projeto_id: "uuid or null",
  estado: 'aberta' | 'agendada' | 'concluída' | 'cancelada',
  tempo_planejado: number or null,
  tempo_gasto: number or null,
  data_agendado: timestamp,
  data_conclusao: timestamp,
  data_cancelamento: timestamp,
  historico_replanejamentos: number,
  datas_replanejamento: timestamp[],
  data_criacao: timestamp,
  ativo: boolean
}
```

**Agendamento**:
```javascript
{
  id: "uuid",
  tarefa_id: "uuid",
  data: "YYYY-MM-DD",
  hora_inicio: "HH:MM",
  hora_fim: "HH:MM",
  data_criacao: timestamp,
  ativo: boolean
}
```

## 📊 Métricas

O dashboard de métricas mostra:
- **Por Projeto**: Tempo gasto total, tarefas concluídas/canceladas/abertas/agendadas, replanejamentos
- **Tarefas Ofensoras**: Tarefas sem projeto associado

## 🔄 Exportação

Clique no botão "💾 Exportar Dados" no header para baixar todos seus dados em JSON.

Arquivo gerado: `timeblocking-export-YYYY-MM-DD.json`

## ✅ Checklist MVP

- ✅ Gerenciamento de projetos e tarefas
- ✅ Calendário semanal com visualização de tarefas
- ✅ Drag & drop para agendar/replanear
- ✅ Marcar tarefas como concluídas
- ✅ Cancelar tarefas
- ✅ Dashboard de métricas
- ✅ Exportação de dados
- ✅ Persistência em localStorage
- ✅ Interface responsiva

## 🐛 Relatório de Bugs

Se encontrar algum bug, abra uma issue no GitHub ou entre em contato.

## 📝 Licença

MIT
