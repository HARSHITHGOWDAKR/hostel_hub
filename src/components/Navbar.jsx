import React from 'react';
import { 
  Smartphone, 
  Store, 
  Columns, 
  Database, 
  Flame, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Layers,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/audioAlert';

export default function Navbar({ 
  viewMode, 
  setViewMode, 
  onOpenInspector, 
  onOpenFirebaseConfig, 
  onResetDemo,
  dbState
}) {
  const pendingOrdersCount = dbState.orders.filter(o => o.status === 'Placed').length;

  return (
    <nav className="platform-nav-bar">
      <div className="nav-brand-section">
        <div className="brand-badge-icon">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <div className="brand-logo-text">
            <span>Hostel</span><strong>Express</strong>
            <span className="brand-tag">CAMPUS DELIVERY</span>
          </div>
          <span className="brand-subline">Campus delivery demo simulator</span>
        </div>
      </div>

      {/* Main View Mode Switcher */}
      <div className="view-mode-toggle-group">
        <button
          type="button"
          onClick={() => setViewMode('dual')}
          className={`mode-btn ${viewMode === 'dual' ? 'active' : ''}`}
          title="Side-by-side demo (Student on left + Store Owner on right)"
        >
          <Columns size={15} />
          <span>Dual Demo Simulator</span>
          <span className="live-pill">LOCAL</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('student')}
          className={`mode-btn ${viewMode === 'student' ? 'active' : ''}`}
          title="Student User Mobile Application"
        >
          <Smartphone size={15} />
          <span>Student App</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('owner')}
          className={`mode-btn ${viewMode === 'owner' ? 'active' : ''}`}
          title="Store Owner Terminal & Inventory Dashboard"
        >
          <Store size={15} />
          <span>Store Owner Terminal</span>
          {pendingOrdersCount > 0 && <span className="order-pill-alert">{pendingOrdersCount}</span>}
        </button>
      </div>

      {/* Auxiliary Tools */}
      <div className="nav-tools-section">
        <button
          type="button"
          onClick={onOpenInspector}
          className="nav-tool-btn"
          title="Inspect the browser-local demo data"
        >
          <Database size={15} className="text-amber" />
          <span>Demo Data</span>
        </button>

        <button
          type="button"
          onClick={onOpenFirebaseConfig}
          className="nav-tool-btn"
          title="Firebase Configuration & Security Rules"
        >
          <Flame size={15} className="text-orange" />
          <span>Backend Info</span>
        </button>

        <button
          type="button"
          onClick={onResetDemo}
          className="nav-tool-btn"
          title="Reset Demo Data"
        >
          <RotateCcw size={15} />
          <span>Reset</span>
        </button>
      </div>
    </nav>
  );
}
