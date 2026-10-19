import React, { useState } from 'react';
import { User, Phone, Home, Mail, Lock, X, Check, ArrowRight } from 'lucide-react';
import { HOSTEL_LOCATIONS } from '../../utils/mockData';

export default function StudentAuthModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSaveProfile,
  initialMode = 'profile' // 'login', 'register', 'profile'
}) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Thejas Gowda',
    phone: currentUser?.phone || '+91 98765 43210',
    email: currentUser?.email || 'thejas.gowda@campus.edu',
    hostelBlock: currentUser?.hostelBlock || 'Block B',
    roomNumber: currentUser?.roomNumber || '204',
    password: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      hostelBlock: formData.hostelBlock,
      roomNumber: formData.roomNumber
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-tag">STUDENT PORTAL</span>
            <h3>
              {mode === 'login' && 'Student Login'}
              {mode === 'register' && 'Create Student Account'}
              {mode === 'profile' && 'Hostel Profile Details'}
            </h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tab-switch">
          <button 
            type="button" 
            className={`auth-tab ${mode === 'profile' ? 'active' : ''}`}
            onClick={() => setMode('profile')}
          >
            Profile
          </button>
          <button 
            type="button" 
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            type="button" 
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(mode === 'register' || mode === 'profile') && (
            <div className="form-group">
              <label><User size={14} /> Full Student Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Thejas Gowda"
              />
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label><Mail size={14} /> University Email</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@campus.edu"
              />
            </div>
            <div className="form-group">
              <label><Phone size={14} /> Phone / OTP</label>
              <input 
                type="tel" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label><Home size={14} /> Hostel Block</label>
              <select 
                value={formData.hostelBlock}
                onChange={(e) => setFormData({ ...formData, hostelBlock: e.target.value })}
              >
                {HOSTEL_LOCATIONS.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Room Number</label>
              <input 
                type="text" 
                required 
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. 204"
              />
            </div>
          </div>

          {mode !== 'profile' && (
            <div className="form-group">
              <label><Lock size={14} /> Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} /> Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
