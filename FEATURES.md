# Time Blocking System - Features Definition

**Versão**: 1.1  
**Data**: 22 de Maio de 2026  
**Status**: ✅ Aprovado (v1.1 - Adicionada F17)

**Histórico**:
- v1.0 (21/05): Features F1-F16 base
- v1.1 (22/05): F17 - Tipos de Tarefa Configuráveis

---

## 📌 Visão Geral

Sistema de gestão de tempo usando técnica de Time Blocking com foco em rastreamento de tempo por projeto e detecção de impetuosidade através de replanejamentos.

**Objetivo Principal**: Permitir que usuários agendem tarefas em blocos de tempo semanais, registrem tempo gasto e analisem produtividade por projeto.

---

## 🎯 Requisitos Não-Funcionais

- ✅ Sem backend externo - máxima privacidade
- ✅ Dados em localStorage inicialmente
- ✅ Exportação para JSON para backup/análise
- ✅ UI simples e funcional (MVP)
- ✅ Sincronização entre abas: não é prioridade

---

## 📋 Features Definidas

### **F1: Criar Novo Projeto**
- Usuário pode criar um projeto com nome
- Projeto é container para agrupar tarefas relacionadas
- Cada projeto deve ter identificador único
- **Entrada**: Nome do projeto
- **Saída**: Projeto criado e disponível para vincular tarefas

### **F2: Criar Tarefa Vinculada a Projeto**
- Usuário cria tarefa dentro de um projeto específico
- Tarefa recebe um nome descritivo
- Tarefa começa no estado "Aberta"
- **Entrada**: Nome da tarefa, Projeto destino
- **Saída**: Tarefa criada e listada na barra lateral

### **F3: Criar Tarefa Ofensora (Sem Projeto)**
- Usuário pode criar tarefa sem vincular a nenhum projeto
- Sistema marca automaticamente como "ofensora"
- Visual diferenciado (ex: cor de alerta) para indicar falta de projeto
- **Entrada**: Nome da tarefa (sem projeto)
- **Saída**: Tarefa criada marcada como ofensora

### **F4: Visualizar Calendário Semanal**
- Exibir semana (seg-dom) no painel principal
- Cada dia mostra blocos de tempo (ex: 1h de intervalo)
- Visualização limpa e intuitiva
- Deve permitir scroll ou view por hora do dia
- **Entrada**: Semana a visualizar
- **Saída**: Calendário com disponibilidade visual

### **F5: Agendar Tarefa (Drag-Drop Inicial)**
- Arrastar tarefa da barra lateral para bloco de tempo no calendário
- Ao soltar, tarefa é agendada para aquele horário
- Tarefa muda estado para "Agendada"
- Sistema registra data/hora do agendamento
- **Entrada**: Tarefa + Bloco de tempo
- **Saída**: Tarefa agendada com tempo_planejado e data_agendado registrados

### **F6: Replanear Tarefa (Drag-Drop Existente)**
- Arrastar tarefa já agendada para outro horário
- Tarefa é movida para novo bloco de tempo
- Sistema incrementa contador de "replanejamentos"
- Mantém registros anteriores de replanejamento (histórico)
- Tempo planejado pode ser atualizado ou mantido
- **Entrada**: Tarefa agendada + Novo bloco de tempo
- **Saída**: Tarefa replanejada com histórico atualizado

### **F7: Remover Tarefa do Calendário**
- Arrastar tarefa do calendário de volta à barra lateral (ou botão)
- Tarefa volta para estado "Aberta"
- Mantém informações históricas (replanejamentos, tempo_planejado antigo)
- Não deleta a tarefa
- **Entrada**: Tarefa agendada
- **Saída**: Tarefa volta à barra lateral, estado muda para "Aberta"

### **F8: Marcar Tarefa como Concluída**
- Usuário marca tarefa como "Concluída" 
- Sistema solicita tempo_gasto (em horas) manualmente
- Tarefa muda estado para "Concluída"
- Registra data de conclusão
- **Entrada**: Tarefa (agendada ou aberta) + Tempo gasto em horas
- **Saída**: Tarefa concluída com tempo_gasto registrado

### **F9: Cancelar Tarefa**
- Usuário pode cancelar uma tarefa (não vai fazer)
- Tarefa muda estado para "Cancelada"
- Registra data de cancelamento
- Não é deletada (mantém histórico)
- **Entrada**: Tarefa em qualquer estado
- **Saída**: Tarefa cancelada com registro de quando foi cancelada

### **F10: Editar Tarefa**
- Usuário pode editar nome da tarefa
- Usuário pode reatribuir tarefa a outro projeto (ou desatribuir)
- Usuário pode editar tempo_planejado se ainda não concluída
- **Entrada**: Tarefa + Novos valores
- **Saída**: Tarefa atualizada

### **F11: Deletar Tarefa**
- Usuário pode permanentemente deletar uma tarefa do sistema
- Apenas tarefas não concluídas podem ser deletadas (para manter histórico)
- Requer confirmação
- **Entrada**: Tarefa não concluída
- **Saída**: Tarefa removida do sistema

### **F12: Visualizar Tarefas Ofensoras**
- Barra lateral destaca tarefas sem projeto
- Visual diferenciado (cor/ícone de alerta)
- Permite filtrar para ver apenas tarefas ofensoras
- **Entrada**: Nenhuma
- **Saída**: Lista de tarefas sem projeto destacada

### **F13: Salvar em localStorage**
- Todos os dados (projetos, tarefas, agendamentos) são salvos automaticamente em localStorage
- Ao recarregar página, dados são restaurados
- Persistência automática a cada mudança
- **Entrada**: Mudança de dados
- **Saída**: Dados persistidos em localStorage

### **F14: Exportar para JSON**
- Usuário pode fazer download de todos os dados em arquivo JSON
- Arquivo contém: projetos, tarefas completas, histórico de replanejamentos
- Formato estruturado e legível
- **Entrada**: Clique em botão "Exportar"
- **Saída**: Arquivo JSON baixado

### **F15: Importar de JSON**
- Usuário pode carregar dados de um arquivo JSON anterior
- Mescla ou sobrescreve dados existentes (a definir no refinamento)
- Validação básica de formato
- **Entrada**: Arquivo JSON
- **Saída**: Dados importados e restaurados no sistema

### **F16: Relatório de Tempo por Projeto**
- Visualizar total de horas gastas por projeto (soma de tempo_gasto das tarefas concluídas)
- Indicador de replanejamentos por projeto
- Estatísticas básicas (tarefas concluídas, canceladas, em aberto)
- **Entrada**: Nenhuma
- **Saída**: Painel com resumo de métricas por projeto

### **F17: Tipos de Tarefa Configuráveis**
- Usuário pode criar e gerenciar tipos de tarefa personalizados (ex: Bug, Feature, Refactor, Meeting, Admin)
- Cada tipo tem nome e cor opcional para identificação visual
- Ao criar/editar tarefa, usuário seleciona qual tipo ela é
- Tipos de tarefa aparecem em dropdown ou multi-select ao criar tarefa
- Sistema persiste tipos em localStorage
- Métricas expandidas mostram tempo gasto **por tipo de tarefa** (não apenas por projeto)
- Dashboard exibe card com "Horas por Tipo" mostrando breakdown de tempo por tipo
- **Entrada**: Nome do tipo + Cor (opcional), ou seleção de tipo ao criar tarefa
- **Saída**: Tipos de tarefa configurados, tarefas classificadas, métricas por tipo visíveis

---

## 📊 Estrutura de Dados (Referência)

```javascript
Projeto {
  id: string (UUID)
  nome: string
  data_criacao: timestamp
}

Tarefa {
  id: string (UUID)
  nome: string
  projeto_id: string | null (null = ofensora)
  estado: 'aberta' | 'agendada' | 'concluída' | 'cancelada'
  tempo_planejado: number (em horas, null se não agendada)
  tempo_gasto: number (em horas, null se não concluída)
  data_agendado: timestamp | null
  data_conclusao: timestamp | null
  data_cancelamento: timestamp | null
  historico_replanejamentos: number (contador)
  replanejamento_datas: timestamp[] (registro de quando foi replanejado)
}

Agendamento {
  id: string
  tarefa_id: string
  data: date
  hora_inicio: string (HH:MM)
  hora_fim: string (HH:MM)
}
```

---

## 🚀 MVP Scope (Foco Inicial)

**Incluso no MVP:**
- F1, F2, F3 (criar projetos e tarefas)
- F4 (visualizar semana)
- F5, F6, F7 (agendar e replanear)
- F8, F9 (concluir e cancelar)
- F10 (editar básico)
- F12 (visualizar ofensoras)
- F13 (salvar em localStorage)
- F14 (exportar JSON)

**Pós-MVP (V2):**
- F11 (deletar - pode ser simplificado)
- F15 (importar JSON - pode esperar)
- F16 (relatório detalhado - pode ser manual via JSON export)
- F17 (tipos de tarefa - será planejado em PLANS.md, pode ser MVP avançado ou V2)

---

## ✅ Aprovação

- **Requisitante**: Usuário
- **Status**: ✅ Aprovado
- **Data de Aprovação**: 21 de Maio de 2026
- **Próximo Passo**: Refinamento Técnico (SPECS.md)
