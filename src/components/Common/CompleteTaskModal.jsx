import { useState } from 'react';
import './CompleteTaskModal.css';

export default function CompleteTaskModal({ task, onComplete, onCancel }) {
  const [tempoGasto, setTempoGasto] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const tempo = parseFloat(tempoGasto);

    if (!tempoGasto || isNaN(tempo) || tempo <= 0) {
      setError('Digite um tempo válido (número positivo)');
      return;
    }

    try {
      onComplete(tempo);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Concluir Tarefa</h2>
        <p className="task-name">📋 {task.nome}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tempo-gasto">Tempo Gasto (horas):</label>
            <input
              id="tempo-gasto"
              type="number"
              step="0.5"
              min="0.5"
              placeholder="Ex: 2.5"
              value={tempoGasto}
              onChange={(e) => setTempoGasto(e.target.value)}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              ✓ Concluir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
