import React from 'react';
import { Flame, X } from 'lucide-react';

export default function FirebaseConfigModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="dialog-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Flame size={22} className="text-amber" />
            <h3>Firebase Integration Info</h3>
          </div>
          <button type="button" onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="config-info-box">
          <p>
            This presentation uses a <strong>local demo data store</strong> backed by browser storage and same-origin tab synchronization. It does not connect to Firebase.
          </p>
          <p className="mt-1">
            This screen is informational only. Firebase credentials are not requested, saved, or sent anywhere, and no cloud connection is made.
          </p>
        </div>

        <div className="profile-form">
          <div className="form-group">
            <p className="config-info-box">
              To use Firebase in a real deployment, implement and test authentication, database access, and restrictive security rules before entering any credentials.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-primary-compact">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
