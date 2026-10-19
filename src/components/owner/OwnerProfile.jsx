import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Tag, 
  Power, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export default function OwnerProfile({ 
  currentStore, 
  onUpdateProfile, 
  onToggleStoreStatus 
}) {
  const [formData, setFormData] = useState({
    storeName: currentStore?.storeName || 'Campus Stationery Store',
    category: currentStore?.category || 'Stationery',
    location: currentStore?.location || 'Student Activity Center (SAC) Ground Floor',
    deliveryTime: currentStore?.deliveryTime || '10-15 mins',
    minOrder: currentStore?.minOrder || 20,
    banner: currentStore?.banner || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="owner-profile-container">
      <div className="profile-header-strip">
        <div>
          <h3>Store Business Profile & Operations</h3>
          <p className="profile-sub">
            Configure store visibility, category, campus address and opening hours.
          </p>
        </div>

        {/* Real-time Opening / Closing Status Toggle */}
        <div className="store-open-toggle-box">
          <div className="toggle-text-col">
            <span className="toggle-headline">STORE DISPATCH STATUS</span>
            <span className={`status-text-pill ${currentStore?.isOpen ? 'open' : 'closed'}`}>
              {currentStore?.isOpen ? '● Currently Accepting Orders' : '○ Closed for New Orders'}
            </span>
          </div>
          <button 
            type="button" 
            className={`big-power-toggle ${currentStore?.isOpen ? 'power-on' : 'power-off'}`}
            onClick={() => onToggleStoreStatus(currentStore?.storeId, !currentStore?.isOpen)}
            title="Toggle store open / closed"
          >
            <Power size={18} />
            <span>{currentStore?.isOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="success-banner-alert">
          <Check size={16} /> Business profile settings updated successfully in Cloud Firestore!
        </div>
      )}

      {/* Profile Form */}
      <div className="profile-form-card">
        <form onSubmit={handleSubmit} className="owner-business-form">
          <div className="form-group">
            <label><Store size={15} /> Store Name *</label>
            <input 
              type="text" 
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              placeholder="e.g. Campus Stationery Store"
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label><Tag size={15} /> Primary Business Category *</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Stationery">Stationery</option>
                <option value="Food/Hotels">Food/Hotels</option>
                <option value="Groceries">Groceries</option>
                <option value="Bakeries">Bakeries</option>
                <option value="General Stores">General Stores</option>
              </select>
            </div>

            <div className="form-group">
              <label><Clock size={15} /> Typical Delivery Speed</label>
              <input 
                type="text" 
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                placeholder="e.g. 10-15 mins"
              />
            </div>
          </div>

          <div className="form-group">
            <label><MapPin size={15} /> Campus Location / Building Address *</label>
            <input 
              type="text" 
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Student Activity Center (SAC) Ground Floor"
            />
          </div>

          <div className="form-group">
            <label>Store Banner Image URL</label>
            <input 
              type="url" 
              value={formData.banner}
              onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn-primary">
              <Check size={16} /> Save Profile Settings
            </button>
          </div>
        </form>
      </div>

      {/* Store Preview Card */}
      <div className="store-preview-section">
        <h4 className="preview-heading">Student Marketplace Preview:</h4>
        <div className="preview-card-wrap">
          <div className="preview-banner-box">
            <img src={formData.banner} alt={formData.storeName} />
            <span className={`preview-badge ${currentStore?.isOpen ? 'open' : 'closed'}`}>
              {currentStore?.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="preview-body">
            <h4>{formData.storeName}</h4>
            <p className="preview-category">{formData.category} • {formData.location}</p>
            <span className="preview-speed"><Clock size={12} /> {formData.deliveryTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
