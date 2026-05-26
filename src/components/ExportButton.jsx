import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { exportToJSON } from '../utils/export';

export default function ExportButton() {
  const { state } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const filename = exportToJSON(state);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('❌ Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleExport}
        disabled={isExporting}
        title="Exportar todos os dados em JSON"
        style={{
          padding: '8px 16px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          opacity: isExporting ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {isExporting ? '⏳ Exportando...' : '💾 Exportar Dados'}
      </button>
      {showFeedback && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '0',
            background: '#10b981',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          ✅ Exportado com sucesso!
        </div>
      )}
    </div>
  );
}
