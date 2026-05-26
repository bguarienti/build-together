# CLAUDE.md - Development Guidelines for Claude Code

**Versão**: 2.0  
**Última Atualização**: 22 de Maio de 2026  
**Status**: ✅ Ativo - Com Evolution Workflow Formalizado

---

## 🎯 Princípios Fundamentais

1. **Funcionalidade Primeiro**: O código deve funcionar corretamente antes de ser bonito
2. **Simplicidade**: MVP com features completas, não complexidade desnecessária
3. **Rastreabilidade**: Cada commit vinculado a uma task em PLANS.md
4. **Dados Importam**: NUNCA perder histórico ou informações de tarefas
5. **Segurança**: Zero requisições externas, dados sempre locais
6. **Privacidade**: Nada sai do navegador do usuário

---

## 📋 Context & Background

Este é um projeto **Spec Driven Development (SDD)** com três documentos de verdade:

- **FEATURES.md**: O que o sistema faz (16 features)
- **SPECS.md**: Como funciona tecnicamente (modelos, fluxos, validações)
- **PLANS.md**: Ordem de implementação (6 phases, 18 sprints)

**Seu papel**: Implementar PLANS.md seguindo SPECS.md, respeitando FEATURES.md.

Quando tiver dúvida sobre o "porquê", revise estes 3 documentos nesta ordem.

---

## 🛠️ Stack Obrigatório

**Frontend**:
- React 18+ com Hooks (useState, useContext, useEffect)
- Context API para state global (sem Redux/Zustand)
- Vite para build

**Persistência**:
- localStorage como storage primary
- JSON export/import como backup

**Styling**:
- CSS modules ou inline styles (simples, sem Tailwind no MVP)
- Cores legíveis, contraste bom
- Responsive: desktop first (1200px+)

**Drag-Drop**:
- react-beautiful-dnd (ou similar estabelecido)
- Implementar cuidadosamente, testar bem

**Testing** (futuro):
- Vitest + React Testing Library (não faça no MVP)

---

## 📁 Estrutura de Pastas (Obrigatória)

```
time-blocking-system/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MainPanel.jsx
│   │   ├── TaskList/
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   └── ProjectGroup.jsx
│   │   ├── Calendar/
│   │   │   ├── WeekCalendar.jsx
│   │   │   ├── DayColumn.jsx
│   │   │   ├── TimeSlot.jsx
│   │   │   ├── ScheduleBlock.jsx
│   │   │   └── CompleteTaskModal.jsx
│   │   ├── Metrics/
│   │   │   ├── MetricsPanel.jsx
│   │   │   └── ProjectMetrics.jsx
│   │   ├── Common/
│   │   │   ├── Modal.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Loading.jsx
│   │   └── ExportButton.jsx
│   ├── hooks/
│   │   ├── useAppContext.js
│   │   ├── useLocalStorage.js
│   │   ├── useTasks.js
│   │   ├── useProjects.js
│   │   └── useSchedule.js
│   ├── context/
│   │   └── AppContext.js
│   ├── utils/
│   │   ├── storage.js
│   │   ├── uuid.js
│   │   ├── date.js
│   │   ├── validation.js
│   │   └── export.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── FEATURES.md
├── SPECS.md
├── PLANS.md
└── CLAUDE.md (este arquivo)
```

**Não desvie desta estrutura sem justificativa.**

---

## 🎨 Convenções de Código

### Nomeação

**Componentes React**:
- PascalCase: `TaskList.jsx`, `WeekCalendar.jsx`, `CompleteTaskModal.jsx`
- Cada componente em seu próprio arquivo
- Pasta = categoria, arquivo = componente

**Funções/Métodos**:
- camelCase: `addTask()`, `saveToLocalStorage()`, `calculateTimeSpent()`

**Constantes**:
- UPPER_SNAKE_CASE: `DEFAULT_BLOCK_HEIGHT`, `STORAGE_KEY`, `WEEKDAYS`

**Variáveis**:
- camelCase: `isLoading`, `projectId`, `timeSpent`

### Imports/Exports

```javascript
// ✅ Bom
import React, { useState, useContext } from 'react';
import TaskList from './TaskList';
import { useAppContext } from '../hooks/useAppContext';
import { formatDate } from '../utils/date';

// ❌ Ruim
import * as everything from 'react';
import { default as TL } from './components/TaskList/TaskList';
```

### Componentes

**Regra**: Um componente = um arquivo = uma responsabilidade

```javascript
// src/components/TaskItem.jsx
import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';

export default function TaskItem({ task, onEdit, onDelete }) {
  const { deleteTask } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Deletar tarefa?')) {
      setIsDeleting(true);
      try {
        deleteTask(task.id);
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="task-item">
      <span>{task.nome}</span>
      <button onClick={onEdit}>Editar</button>
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Deletando...' : 'Deletar'}
      </button>
    </div>
  );
}
```

### Context & Hooks

**AppContext**: Estado global centralizado

```javascript
// src/context/AppContext.js
import { createContext, useState, useEffect } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [state, setState] = useState({
    projects: [],
    tasks: [],
    schedules: [],
  });

  // Carregar do localStorage ao montar
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) setState(saved);
  }, []);

  // Salvar em localStorage quando state muda
  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

  // Ações
  const addProject = (nome) => {
    // Implementar
  };

  const addTask = (nome, projeto_id) => {
    // Implementar
  };

  // ... mais ações

  return (
    <AppContext.Provider value={{ state, addProject, addTask, /* ... */ }}>
      {children}
    </AppContext.Provider>
  );
}
```

**Custom Hooks**: Abstrair lógica complexa

```javascript
// src/hooks/useTasks.js
import { useAppContext } from './useAppContext';
import { useMemo } from 'react';

export function useTasks() {
  const { state } = useAppContext();

  const allTasks = useMemo(() => state.tasks.filter(t => t.ativo), [state.tasks]);
  const openTasks = useMemo(() => allTasks.filter(t => t.estado === 'aberta'), [allTasks]);
  const offenderTasks = useMemo(() => allTasks.filter(t => !t.projeto_id), [allTasks]);

  return { allTasks, openTasks, offenderTasks };
}
```

---

## 📊 Modelos de Dados (Copiar de SPECS.md)

**Projeto**:
```javascript
{
  id: "uuid",
  nome: "string",
  cor: "string (hex, opcional)",
  data_criacao: timestamp,
  ativo: boolean
}
```

**Tarefa**:
```javascript
{
  id: "uuid",
  nome: "string",
  projeto_id: "uuid | null",
  estado: 'aberta' | 'agendada' | 'concluída' | 'cancelada',
  tempo_planejado: number | null,
  tempo_gasto: number | null,
  data_agendado: timestamp | null,
  data_conclusao: timestamp | null,
  data_cancelamento: timestamp | null,
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

**localStorage Key**: `timeblocking-app-v1`

---

## ✅ Checklist Para Cada Sprint

Antes de fazer um PR, responda SIM a todas:

- [ ] Código segue estrutura de pastas?
- [ ] Nomeação está correta (PascalCase/camelCase)?
- [ ] localStorage funciona (reload = dados persistem)?
- [ ] Sem console.log/debugger (ou comentado)?
- [ ] Sem requisições HTTP (zero backend)?
- [ ] Validações implementadas (de SPECS.md)?
- [ ] UI não quebra em desktop 1200px+?
- [ ] Mensagens de erro são claras?
- [ ] Sem memory leaks? (React DevTools Profiler)
- [ ] Testei fluxo completo no navegador?
- [ ] Commit message é descritivo?
- [ ] Nada de dados foi perdido ao fazer mudanças?

---

## 🚫 Coisas Proibidas

❌ **Nunca**:
- Enviar dados para servidor externo
- Usar Redux, Zustand, ou state management complexo (Context API é suficiente)
- Adicionar dependências desnecessárias (avaliar antes)
- Deixar console.log em produção
- Quebrar backwards compatibility com localStorage
- Deletar dados permanentemente (sempre soft delete com `ativo: false`)
- Pular validações de SPECS.md
- Fazer mudanças de arquitetura sem documentar em CLAUDE.md
- Ignorar PLANS.md e sair do faseamento acordado

---

## 🐛 Tratamento de Erros

**localStorage Indisponível**:
```javascript
try {
  const data = localStorage.getItem('timeblocking-app-v1');
  // ...
} catch (error) {
  console.error('localStorage não disponível:', error);
  // App funciona em memória, avisar usuário
}
```

**Validação de Dados**:
```javascript
function validateTask(task) {
  if (!task.nome || task.nome.trim().length === 0) {
    throw new Error('Nome da tarefa é obrigatório');
  }
  if (task.tempo_planejado && task.tempo_planejado <= 0) {
    throw new Error('Tempo planejado deve ser positivo');
  }
  return true;
}
```

**Feedback ao Usuário**:
```javascript
// ✅ Claro e amigável
alert('✅ Tarefa criada com sucesso!');
alert('❌ Erro ao criar tarefa: ' + error.message);
```

---

## 📝 Padrão de Commits

Seguir Conventional Commits:

```
feat: [Phase].[Sprint] - Descrição

Implementa: Feature X
Referencia: PLANS.md Sprint 1.1
Testes: Testado em Chrome

Tarefas completadas:
- [ ] Component criado
- [ ] localStorage funciona
- [ ] Sem bugs conhecidos
```

**Exemplos**:
- `feat: phase-1.1 - Setup Vite + estrutura`
- `feat: phase-2.1 - CRUD de Projetos`
- `fix: corrigir drag-drop overlap`
- `docs: atualizar README com screenshots`
- `chore: cleanup console.logs`

---

## 🚀 Evolution Workflow - Adicionando Novas Features

**Para garantir escala e consistência, SEMPRE siga este fluxo na ordem:**

### Step 1: Revisar FEATURES.md
- Verifique se a feature solicitada já existe em FEATURES.md
- Se **SIM**: pule para Step 3
- Se **NÃO**: vá para Step 2

### Step 2: Confirmar Feature com Usuário
- Comunique ao usuário: "Feature não está em FEATURES.md"
- Aguarde confirmação de incluir a feature
- Se confirmado:
  - Atualize versão em FEATURES.md (ex: 1.0 → 1.1)
  - Adicione a feature com descrição clara
  - Commit: `docs: add feature [nome] to FEATURES.md v1.1`

### Step 3: Planejar em PLANS.md
- Defina as **phases e sprints** necessárias
- Quebra a feature em tarefas menores (sprints)
- Atualize versão em PLANS.md (ex: 1.0 → 1.1)
- Atualize progresso geral no início do arquivo
- Commit: `docs: plan feature [nome] in PLANS.md v1.1`

### Step 4: Revisar/Atualizar SPECS.md
- Verifique se modelos de dados precisam mudar
- Se **SIM**: adicione/atualize em SPECS.md
  - Atualize versão em SPECS.md (ex: 1.0 → 1.1)
  - Descreva novos campos, validações, endpoints
  - Commit: `docs: update SPECS.md v1.1 for feature [nome]`
- Se **NÃO**: apenas registre que foi revisado

### Step 5: Implementar Código
- Crie nova branch: `git checkout -b claude/feature-[nome]`
- Implemente seguindo PLANS.md
- Siga Sprint → Commit → Deploy

### Step 6: Atualizar PLANS.md Durante Implementação
- Depois de cada Sprint:
  - Marque a Sprint como ✅ COMPLETO
  - Registre o commit hash
  - Atualize % de progresso
  - **NÃO esqueça de revisar se todos os detalhes foram implementados**

### Step 7: Atualizar README.md
- Adicione a feature ao README
- Atualize seções relevantes (Features, How to Use, etc.)
- Mantenha documentação sincronizada com código

### Step 8: Deploy
- Execute: `npm run build`
- Execute: `npm run deploy`
- Valide em produção
- Compartilhe link com usuário para testes

### Step 9: Finalizar
- Faça commit final: `feat: [feature-name] - MVP completo`
- Inclua lista de todas as sprints/commits
- Push para branch `claude/feature-[nome]`

---

## ✅ Checklist para Evolution Workflow

Antes de começar **qualquer** nova feature, execute:

- [ ] FEATURES.md revisado (existe ou confirmada)
- [ ] PLANS.md com phases/sprints planejadas
- [ ] SPECS.md atualizado se necessário
- [ ] Versões de documentos atualizadas
- [ ] Nova branch criada: `claude/feature-[nome]`
- [ ] Commits de documentação feitos

Depois de **cada Sprint** implementada:

- [ ] Código testado no navegador
- [ ] PLANS.md marcado como completo
- [ ] README.md atualizado
- [ ] Build sem erros: `npm run build`
- [ ] Deploy realizado: `npm run deploy`

Antes de considerar **feature finalizada**:

- [ ] Todos os sprints em ✅ COMPLETO em PLANS.md
- [ ] README.md reflete todas as novas features
- [ ] Sem console.log de debug
- [ ] localStorage funciona corretamente
- [ ] Commit final com lista de tudo feito
- [ ] Usuário validou em produção

---

## 🔄 Fluxo de Trabalho

1. **Você (Humano) diz**: "Começar Phase 2.1 - CRUD de Projetos"
2. **Claude Code faz**:
   - Revisa PLANS.md Sprint 2.1
   - Lê SPECS.md para entender modelos
   - Implementa tasks listadas
   - Testa no navegador
   - Abre PR com checklist completo
3. **Você revisa PR**:
   - ✅ Aprova → merge
   - ❌ Pede mudanças → feedback claro
4. **Claude Code itera** até aprovação
5. **Próximo Sprint**: Repete

---

## 📚 Referências Rápidas

**Quando tiver dúvida**, nesta ordem:
1. PLANS.md (para ordem de implementação)
2. SPECS.md (para padrões técnicos)
3. FEATURES.md (para entender o problema)
4. Este arquivo CLAUDE.md (para regras gerais)
5. Código existente (precedente)

---

## 🎯 Success Criteria do MVP

O MVP é considerado **completo** quando:

✅ Todas as features de PLANS.md Phase 1-5 funcionam  
✅ localStorage persiste dados corretamente  
✅ Drag-drop de tarefas (agendar + replanear) funciona  
✅ Relatório de tempo por projeto está visível  
✅ Tarefas "ofensoras" são destacadas  
✅ Exportar JSON funciona  
✅ Zero erros no console  
✅ Desktop (1200px+) é responsivo  
✅ Sem requisições externas (100% local)  
✅ Dados nunca são perdidos  

---

## 🚀 Instruções Finais Para Claude Code

Quando você (humano) disser "Começar", faça exatamente:

1. **Clone/Setup**:
   ```bash
   cd /caminho/para/repo
   npm install
   npm run dev
   ```

2. **Leia PLANS.md**: Entenda Phase 1, Sprint 1.1

3. **Implemente tasks** da sprint listadas em PLANS.md

4. **Teste manualmente** no navegador (`http://localhost:5173`)

5. **Faça commit**:
   ```bash
   git add .
   git commit -m "feat: [phase-sprint] - Descrição"
   git push origin feature/[nome-descritivo]
   ```

6. **Abra PR no GitHub** com checklist completo

7. **Aguarde aprovação** do humano para próxima sprint

8. **Repita** para próximo sprint

---

## 🚀 Deployment Guidelines (CRÍTICO PARA AGENTES LLM)

**VERSÃO**: 1.0  
**DATA**: 22 de Maio de 2026  
**IMPORTÂNCIA**: ⚠️ CRÍTICO - NUNCA ESQUECER ISTO

Este projeto usa **GitHub Pages** com deployment automático. As instruções a seguir são OBRIGATÓRIAS e devem ser seguidas EXATAMENTE. Veja também: **DEPLOY.md** (documentação completa).

### 🔴 Regra de Ouro: NUNCA Sobrescreva Commits

**REGRA 1: Commits são história. Nunca os sobrescreva sem verificação explícita do usuário.**

```bash
# ❌ PROIBIDO - Sobrescreve história
git push -f origin gh-pages

# ❌ PROIBIDO - Mesmo com lease
git push --force-with-lease origin gh-pages

# ✅ CORRETO - Sempre use push normal
git push origin gh-pages
```

**Por que isto importa**:
- Cada commit na branch `gh-pages` representa um deployment
- Sobrescrever commits = perder histórico de deployments
- Pode quebrar rollback se algo der errado
- Violação de integridade git

**Se push falhar**:
1. **PRIMEIRO**: Verifique o que está no remote:
   ```bash
   git log origin/gh-pages --oneline -10
   ```
2. **SEGUNDO**: Puxe as mudanças:
   ```bash
   git pull origin gh-pages
   ```
3. **TERCEIRO**: Resolva conflitos e faça commit limpo
4. **NUNCA**: Use force push automaticamente

### ✅ Como Funciona GitHub Pages (Automático)

**GitHub Pages é completamente automático:**

```
Você faz push para gh-pages
         ↓
GitHub detecta automaticamente
         ↓
"Pages Build and Deployment" workflow roda (automático, você não faz nada)
         ↓
Conteúdo servido em: https://miguelti.github.io/local-time-blocking/
```

**IMPORTANTE**: 
- ❌ NÃO crie workflows manualmente
- ❌ NÃO tente triggerar workflows
- ❌ NÃO aguarde workflow executions
- ✅ Apenas faça push para gh-pages e aguarde 1-2 minutos

### 📂 Estrutura Correta da Branch gh-pages

A branch `gh-pages` deve conter **SOMENTE**:

```
gh-pages/
├── assets/           # CSS, JS, imagens (pasta completa)
└── index.html        # Entrada HTML
```

**NUNCA inclua**:
- ❌ `dist/` folder (extraia apenas assets/ + index.html)
- ❌ `node_modules/`
- ❌ `src/` folders
- ❌ `package.json`
- ❌ Arquivos de configuração

**Como verificar**:
```bash
git switch gh-pages
git ls-tree -r HEAD
# Deve mostrar APENAS: assets/ (tree) + index.html (blob)
```

### 🎯 Quando Fazer Deploy na Evolution Workflow

**Para cada Feature implementada em PLANS.md**:

1. **Desenvolvimento**: Trabalhe na branch `claude/feature-[nome]`
2. **Testes Locais**: `npm run dev` + navegador
3. **Build**: `npm run build` sem erros
4. **Commit Final**: Push da feature branch
5. **Deploy**: Apenas quando feature está COMPLETA
   ```bash
   npm run deploy
   ```
6. **Aguarde**: 1-2 minutos para GitHub processar
7. **Valide**: Visite https://miguelti.github.io/local-time-blocking/

**Deploy é a ÚLTIMA ação** após todos os commits e testes.

### 🛡️ Verificação Antes de Qualquer Push para gh-pages

ANTES de fazer qualquer operação em `gh-pages`:

```bash
# 1. Verifique o que existe no remote
git log origin/gh-pages --oneline -5

# 2. Compare com local se necessário
git log gh-pages --oneline -5

# 3. SE os commits parecem corretos: NUNCA force push
# 4. SE precisa adicionar mudanças: puxe primeiro
git pull origin gh-pages

# 5. Faça commit limpo das mudanças
git add .
git commit -m "docs: update gh-pages deployment"

# 6. Push normalmente
git push origin gh-pages
```

### 📋 Checklist Para Deploy

- [ ] Todos os commits feitos na feature branch
- [ ] `npm run build` executa sem erros
- [ ] `dist/` folder criado com assets/ + index.html
- [ ] Verificar: `git status` limpo
- [ ] Remote correto: `git remote -v` aponta a GitHub
- [ ] Executar: `npm run deploy`
- [ ] Aguardar: 1-2 minutos
- [ ] Validar: Acessar URL live e verificar

### 🚫 Coisas Que Quebram Deploy

❌ **NUNCA FAÇA**:
- Force push para `gh-pages` sem verificação
- Commits diretos em `gh-pages` (sempre via `npm run deploy`)
- Incluir `dist/` folder em commits da feature branch
- Mudar settings de GitHub Pages
- Mergear `gh-pages` em `main` ou feature branches
- Usar `--no-verify` ou skip hooks
- Assumir que workflow vai falhar e forçar algo

✅ **SEMPRE FAÇA**:
- Use `git push origin gh-pages` (push normal)
- Verifique commits antes de qualquer operação
- Aguarde processing time (GitHub é automático)
- Teste build localmente antes de deploy
- Documente cada deploy em mensagem de commit

### 🔗 Referências

- **DEPLOY.md**: Documentação técnica completa (troubleshooting, estrutura, etc.)
- **npm run deploy**: Comando que gerencia gh-pages automaticamente
- **GitHub Pages URL**: https://miguelti.github.io/local-time-blocking/
- **Repository Settings**: Sempre "Deploy from a branch" → gh-pages

---

## ✅ Aprovação Final

- **Revisor**: Usuário
- **Status**: ✅ Pronto para Implementação
- **Data de Início**: Quando autorizado
- **Próximo Passo**: Claude Code executa Phase 1, Sprint 1.1

