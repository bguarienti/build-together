import { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

export default function TaskTypeForm() {
  const { addTaskType } = useAppContext();
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#3498db');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      addTaskType(nome, cor);
      setSucesso(`✅ Tipo "${nome}" criado com sucesso!`);
      setNome('');
      setCor('#3498db');
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      setErro(`❌ ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Criar Novo Tipo de Tarefa</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="nome" style={styles.label}>
            Nome do Tipo
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Bug, Feature, Refactor..."
            style={styles.input}
            maxLength={100}
          />
          <small style={styles.help}>{nome.length}/100 caracteres</small>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="cor" style={styles.label}>
            Cor (opcional)
          </label>
          <div style={styles.colorGroup}>
            <input
              id="cor"
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              style={styles.colorPicker}
            />
            <span style={styles.colorValue}>{cor}</span>
          </div>
        </div>

        <button type="submit" style={styles.button}>
          + Criar Tipo
        </button>
      </form>

      {erro && <div style={styles.erro}>{erro}</div>}
      {sucesso && <div style={styles.sucesso}>{sucesso}</div>}
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #e0e0e0',
  },
  title: {
    margin: '0 0 1rem 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#555',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontFamily: 'inherit',
    fontSize: '14px',
  },
  help: {
    fontSize: '12px',
    color: '#999',
  },
  colorGroup: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  colorPicker: {
    width: '50px',
    height: '40px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
  },
  colorValue: {
    fontSize: '14px',
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    padding: '0.75rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  buttonHover: {
    backgroundColor: '#45a049',
  },
  erro: {
    padding: '0.75rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '0.5rem',
  },
  sucesso: {
    padding: '0.75rem',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '0.5rem',
  },
};
