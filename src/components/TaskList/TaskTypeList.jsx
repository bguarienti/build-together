import { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

export default function TaskTypeList() {
  const { getTaskTypes, deleteTaskType, updateTaskType } = useAppContext();
  const taskTypes = getTaskTypes();
  const [editingId, setEditingId] = useState(null);
  const [editingNome, setEditingNome] = useState('');
  const [editingCor, setEditingCor] = useState('');

  const handleEdit = (taskType) => {
    setEditingId(taskType.id);
    setEditingNome(taskType.nome);
    setEditingCor(taskType.cor || '#3498db');
  };

  const handleSaveEdit = (id) => {
    try {
      updateTaskType(id, { nome: editingNome, cor: editingCor });
      setEditingId(null);
    } catch (err) {
      alert(`Erro ao editar: ${err.message}`);
    }
  };

  const handleDelete = (id, nome) => {
    if (window.confirm(`Deletar tipo "${nome}"?`)) {
      deleteTaskType(id);
    }
  };

  if (taskTypes.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>
          📝 Nenhum tipo de tarefa criado ainda
        </p>
        <p style={styles.emptyHint}>
          Crie tipos como "Bug", "Feature", "Refactor", "Meeting", "Admin"
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Tipos de Tarefa ({taskTypes.length})</h3>
      <div style={styles.list}>
        {taskTypes.map((taskType) => (
          <div key={taskType.id} style={styles.item}>
            <div style={styles.itemContent}>
              {editingId === taskType.id ? (
                <div style={styles.editForm}>
                  <input
                    type="text"
                    value={editingNome}
                    onChange={(e) => setEditingNome(e.target.value)}
                    style={styles.editInput}
                    maxLength={100}
                  />
                  <input
                    type="color"
                    value={editingCor}
                    onChange={(e) => setEditingCor(e.target.value)}
                    style={styles.editColor}
                  />
                  <button
                    onClick={() => handleSaveEdit(taskType.id)}
                    style={styles.saveBtn}
                  >
                    ✓ Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={styles.cancelBtn}
                  >
                    ✕ Cancelar
                  </button>
                </div>
              ) : (
                <div style={styles.itemDisplay}>
                  <div
                    style={{
                      ...styles.colorBadge,
                      backgroundColor: taskType.cor || '#3498db',
                    }}
                  />
                  <span style={styles.itemName}>{taskType.nome}</span>
                  <span style={styles.colorCode}>{taskType.cor}</span>
                </div>
              )}
            </div>

            {editingId !== taskType.id && (
              <div style={styles.actions}>
                <button
                  onClick={() => handleEdit(taskType)}
                  style={styles.editBtn}
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(taskType.id, taskType.nome)}
                  style={styles.deleteBtn}
                  title="Deletar"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  title: {
    margin: '0 0 1rem 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  itemContent: {
    flex: 1,
  },
  itemDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  colorBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  colorCode: {
    fontSize: '12px',
    color: '#999',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editForm: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  editInput: {
    padding: '0.4rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '13px',
    flex: 1,
    minWidth: '150px',
  },
  editColor: {
    width: '36px',
    height: '36px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
  },
  editBtn: {
    padding: '0.4rem 0.6rem',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: '0.4rem 0.6rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  saveBtn: {
    padding: '0.4rem 0.6rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  cancelBtn: {
    padding: '0.4rem 0.6rem',
    backgroundColor: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  empty: {
    padding: '2rem 1rem',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px dashed #ddd',
  },
  emptyText: {
    margin: '0 0 0.5rem 0',
    fontSize: '14px',
    color: '#666',
    fontWeight: '600',
  },
  emptyHint: {
    margin: 0,
    fontSize: '13px',
    color: '#999',
  },
};
