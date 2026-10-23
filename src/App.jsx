import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { db } from './firebase/database';
import { getSupabaseStatus } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import DemoGuideBar from './components/DemoGuideBar';
import StudentApp from './components/StudentApp';
import StoreOwnerApp from './components/StoreOwnerApp';
import FirestoreInspectorModal from './components/FirestoreInspectorModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import { Smartphone, Store, Radio } from 'lucide-react';
import './App.css';

function DemoSimulator() {
  const [dbState, setDbState] = useState(db.getState());
  const [viewMode, setViewMode] = useState('dual'); // 'dual' | 'student' | 'owner'
  const [showInspector, setShowInspector] = useState(false);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);

  useEffect(() => {
    const unsubscribe = db.subscribe((event) => {
      setDbState(event.state);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="campus-platform-root">
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenInspector={() => setShowInspector(true)}
        onOpenFirebaseConfig={() => setShowFirebaseConfig(true)}
        onResetDemo={() => db.resetToDemo()}
        dbState={dbState}
      />

      <DemoGuideBar
        db={db}
        dbState={dbState}
      />

      <div className={`platform-workspace mode-${viewMode}`}>
        {viewMode === 'dual' && (
          <div className="dual-split-container">
            <div className="panel-side student-panel">
              <div className="panel-header-strip">
                <div className="panel-title-pill student-title-pill">
                  <Smartphone size={15} />
                  <span>STUDENT MOBILE APPLICATION</span>
                </div>
                <div className="realtime-stream-badge">
                  <Radio size={13} className="text-emerald animate-pulse" />
                  <span>Demo data: Active</span>
                </div>
              </div>

              <div className="device-mockup-wrapper">
                <div className="phone-bezel">
                  <div className="phone-screen">
                    <StudentApp dbState={dbState} db={db} />
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-side owner-panel">
              <div className="panel-header-strip">
                <div className="panel-title-pill owner-title-pill">
                  <Store size={15} />
                  <span>STORE OWNER TERMINAL & DASHBOARD</span>
                </div>
                <div className="realtime-stream-badge">
                  <span className="live-amber-dot"></span>
                  <span>Demo alerts & cross-tab sync ON</span>
                </div>
              </div>

              <div className="terminal-screen-wrapper">
                <StoreOwnerApp dbState={dbState} db={db} />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'student' && (
          <div className="single-view-container student-single-view">
            <div className="device-mockup-wrapper centered">
              <div className="phone-bezel standalone">
                <div className="phone-screen">
                  <StudentApp dbState={dbState} db={db} />
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'owner' && (
          <div className="single-view-container owner-single-view">
            <div className="terminal-screen-wrapper fullscreen">
              <StoreOwnerApp dbState={dbState} db={db} />
            </div>
          </div>
        )}
      </div>

      <FirestoreInspectorModal
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        dbState={dbState}
        db={db}
      />

      <FirebaseConfigModal
        isOpen={showFirebaseConfig}
        onClose={() => setShowFirebaseConfig(false)}
      />
    </div>
  );
}

function LoginRoute() {
  const { configured, mode } = getSupabaseStatus();

  return (
    <div style={{ padding: '40px 20px', color: '#e5e7eb', background: '#091320', minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#101c2d', border: '1px solid #1f2b3c', borderRadius: 18, padding: 28 }}>
        <h1 style={{ marginBottom: 12 }}>HostelExpress demo sign-in</h1>
        <p style={{ marginBottom: 18, color: '#cbd5e1' }}>
          Sign-in, orders, and inventory in this presentation app are simulated in browser storage. The Supabase helpers are not yet connected to the simulator.
        </p>
        <div style={{ marginBottom: 18, padding: 12, borderRadius: 12, background: '#111827', border: '1px solid #293548' }}>
          <strong>Simulator data:</strong> Browser-local demo data
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/simulator" style={{ display: 'inline-block', padding: '12px 18px', background: '#4f46e5', color: 'white', borderRadius: 10, textDecoration: 'none' }}>
            Open simulator
          </a>
          <a href="/student" style={{ display: 'inline-block', padding: '12px 18px', background: '#0f172a', color: 'white', borderRadius: 10, textDecoration: 'none', border: '1px solid #334155' }}>
            Student view
          </a>
          <a href="/owner" style={{ display: 'inline-block', padding: '12px 18px', background: '#0f172a', color: 'white', borderRadius: 10, textDecoration: 'none', border: '1px solid #334155' }}>
            Owner view
          </a>
        </div>
        <p style={{ marginTop: 16, color: '#94a3b8' }}>
          Supabase client configuration: {configured ? 'detected' : 'not set'} ({mode}). Setting these values does not switch the simulator to a cloud backend.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/simulator" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/simulator" element={<DemoSimulator />} />
      <Route path="/student" element={<DemoSimulator />} />
      <Route path="/owner" element={<DemoSimulator />} />
      <Route path="*" element={<Navigate to="/simulator" replace />} />
    </Routes>
  );
}
