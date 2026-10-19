import React, { useState, useEffect } from 'react';
import { db } from './firebase/database';
import Navbar from './components/Navbar';
import DemoGuideBar from './components/DemoGuideBar';
import StudentApp from './components/StudentApp';
import StoreOwnerApp from './components/StoreOwnerApp';
import FirestoreInspectorModal from './components/FirestoreInspectorModal';
import FirebaseConfigModal from './components/FirebaseConfigModal';
import { Smartphone, Store, Radio } from 'lucide-react';
import './App.css';

export default function App() {
  const [dbState, setDbState] = useState(db.getState());
  const [viewMode, setViewMode] = useState('dual'); // 'dual' | 'student' | 'owner'
  const [showInspector, setShowInspector] = useState(false);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    const unsubscribe = db.subscribe((event) => {
      setDbState(event.state);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="campus-platform-root">
      {/* Top Navbar */}
      <Navbar 
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenInspector={() => setShowInspector(true)}
        onOpenFirebaseConfig={() => setShowFirebaseConfig(true)}
        onResetDemo={() => db.resetToDemo()}
        dbState={dbState}
      />

      {/* Demonstration Workflow Guide & 1-Click Runner */}
      <DemoGuideBar 
        db={db}
        dbState={dbState}
      />

      {/* Main Workspace based on View Mode */}
      <div className={`platform-workspace mode-${viewMode}`}>
        {/* DUAL LIVE SIMULATOR MODE */}
        {viewMode === 'dual' && (
          <div className="dual-split-container">
            {/* Left Panel: Student Mobile Application */}
            <div className="panel-side student-panel">
              <div className="panel-header-strip">
                <div className="panel-title-pill student-title-pill">
                  <Smartphone size={15} />
                  <span>STUDENT MOBILE APPLICATION</span>
                </div>
                <div className="realtime-stream-badge">
                  <Radio size={13} className="text-emerald animate-pulse" />
                  <span>Firestore Stream: Active</span>
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

            {/* Right Panel: Store Owner Application */}
            <div className="panel-side owner-panel">
              <div className="panel-header-strip">
                <div className="panel-title-pill owner-title-pill">
                  <Store size={15} />
                  <span>STORE OWNER TERMINAL & DASHBOARD</span>
                </div>
                <div className="realtime-stream-badge">
                  <span className="live-amber-dot"></span>
                  <span>Audio Alert & Real-time Listeners ON</span>
                </div>
              </div>

              <div className="terminal-screen-wrapper">
                <StoreOwnerApp dbState={dbState} db={db} />
              </div>
            </div>
          </div>
        )}

        {/* FOCUSED STUDENT APP VIEW */}
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

        {/* FOCUSED STORE OWNER VIEW */}
        {viewMode === 'owner' && (
          <div className="single-view-container owner-single-view">
            <div className="terminal-screen-wrapper fullscreen">
              <StoreOwnerApp dbState={dbState} db={db} />
            </div>
          </div>
        )}
      </div>

      {/* Cloud Firestore Collection Inspector Modal */}
      <FirestoreInspectorModal 
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        dbState={dbState}
        db={db}
      />

      {/* Firebase Cloud Config Modal */}
      <FirebaseConfigModal 
        isOpen={showFirebaseConfig}
        onClose={() => setShowFirebaseConfig(false)}
      />
    </div>
  );
}
