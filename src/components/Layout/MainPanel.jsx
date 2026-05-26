import { useState } from 'react';
import WeekCalendar from '../Calendar/WeekCalendar';
import MetricsPanel from '../Metrics/MetricsPanel';
import './MainPanel.css';

export default function MainPanel() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <main className="main-panel">
      <div className="main-tabs">
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendário
        </button>
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          📊 Métricas
        </button>
      </div>

      <div className="main-content">
        {activeTab === 'calendar' && <WeekCalendar />}
        {activeTab === 'metrics' && <MetricsPanel />}
      </div>
    </main>
  );
}
