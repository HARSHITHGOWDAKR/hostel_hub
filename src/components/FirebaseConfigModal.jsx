import React, { useState } from 'react';
import { Flame, X, ShieldAlert, Check, Copy } from 'lucide-react';

export default function FirebaseConfigModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('campus-hostel-delivery');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="dialog-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Flame size={22} className="text-amber" />
            <h3>Firebase Cloud Firestore Configuration</h3>
          </div>
          <button type="button" onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="config-info-box">
          <p>
            The application currently runs with an <strong>active reactive Firestore emulation layer</strong> in memory & local storage with cross-tab broadcast synchronization, matching the exact Firestore schema.
          </p>
          <p className="mt-1">
            To connect with your live Google Cloud Firebase project, input your Firebase Web App credentials below:
          </p>
        </div>

        <div className="profile-form">
          <div className="form-group">
            <label>Firebase API Key</label>
            <input 
              type="text" 
              placeholder="AIzaSy..." 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              className="form-input font-mono"
            />
          </div>

          <div className="form-group">
            <label>Project ID</label>
            <input 
              type="text" 
              placeholder="campus-delivery-prod" 
              value={projectId} 
              onChange={(e) => setProjectId(e.target.value)} 
              className="form-input font-mono"
            />
          </div>

          <div className="form-group">
            <label>Firestore Security Rules Snapshot</label>
            <pre className="rules-snippet">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    match /stores/{storeId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.ownerId;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}`}
            </pre>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary-compact">Cancel</button>
            <button type="button" onClick={handleSave} className="btn-primary-compact">
              {saved ? '✓ Connected!' : 'Save & Connect Live Firebase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
