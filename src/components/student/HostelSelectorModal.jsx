import React from 'react';
import { Building, MapPin, CheckCircle, X, Compass } from 'lucide-react';
import { HOSTEL_LOCATIONS } from '../../utils/mockData';

export default function HostelSelectorModal({ 
  isOpen, 
  onClose, 
  selectedHostel, 
  onSelectHostel 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content hostel-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-tag">CAMPUS GEOLOCATION</span>
            <h3>Select Your Hostel Block</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-subtitle">
          Stores and available delivery runners are dynamically filtered based on your hostel location:
        </p>

        <div className="hostel-grid-cards">
          {HOSTEL_LOCATIONS.map((hostel) => {
            const isSelected = selectedHostel === hostel.id;
            return (
              <div 
                key={hostel.id} 
                className={`hostel-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectHostel(hostel.id);
                  onClose();
                }}
              >
                <div className="hostel-icon-wrap">
                  <Building size={20} className="hostel-building-icon" />
                </div>
                <div className="hostel-info">
                  <div className="hostel-name-row">
                    <span className="hostel-name">{hostel.name}</span>
                    {isSelected && <CheckCircle size={16} className="selected-check-icon" />}
                  </div>
                  <span className="hostel-tag-pill">{hostel.tag}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hostel-modal-footer">
          <div className="campus-note">
            <Compass size={14} /> Average delivery time to all campus hostel gates is 10-18 minutes.
          </div>
        </div>
      </div>
    </div>
  );
}
