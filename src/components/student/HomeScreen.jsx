import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  UtensilsCrossed, 
  ShoppingBag, 
  Cake, 
  Package, 
  SlidersHorizontal 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Stores', icon: Sparkles },
  { id: 'Stationery', label: 'Stationery', icon: BookOpen },
  { id: 'Food/Hotels', label: 'Food/Hotels', icon: UtensilsCrossed },
  { id: 'Groceries', label: 'Groceries', icon: ShoppingBag },
  { id: 'Bakeries', label: 'Bakeries', icon: Cake },
  { id: 'General Stores', label: 'General Stores', icon: Package }
];

export default function HomeScreen({ 
  stores = [], 
  selectedHostel = 'Block B', 
  onSelectStore, 
  onOpenLocationSelector,
  onOpenProfile,
  currentUser
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stores based on selected Category and Search Query
  const filteredStores = stores.filter(store => {
    const matchesCategory = selectedCategory === 'All' || store.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          store.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (store.tags && store.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesHostel = !store.allowedHostels || store.allowedHostels.includes(selectedHostel);
    return matchesCategory && matchesSearch && matchesHostel;
  });

  return (
    <div className="home-screen-container">
      {/* Top Location & Profile Bar */}
      <div className="home-top-bar">
        <div className="location-selector-trigger" onClick={onOpenLocationSelector}>
          <div className="location-pin-badge">
            <MapPin size={16} className="pin-icon" />
          </div>
          <div className="location-text">
            <div className="location-sub">DELIVERING TO</div>
            <div className="location-main">
              <strong>{selectedHostel}</strong>
              <span className="room-badge">Rm {currentUser?.roomNumber || '204'}</span>
              <ChevronRight size={14} className="chevron" />
            </div>
          </div>
        </div>

        <button type="button" className="student-profile-btn" onClick={onOpenProfile} title="View Student Profile">
          <div className="student-avatar-wrap">
            <span className="student-initials">TG</span>
          </div>
        </button>
      </div>

      {/* Campus Hero Promo Banner */}
      <div className="campus-hero-banner">
        <div className="hero-content">
          <span className="hero-pill">⚡ FAST CAMPUS DISPATCH</span>
          <h2>Hostel Delivery in 15 Mins</h2>
          <p>Lab records, midnight food, stationery & essentials delivered right to your hostel gate.</p>
        </div>
        <div className="hero-art">
          <span className="hero-emoji">🛵📚</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-bar-wrapper">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 'Record Book', 'Campus Stationery Store', 'Maggi'..."
        />
        {searchQuery && (
          <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>×</button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="category-section">
        <div className="section-header">
          <h4>Explore Categories</h4>
        </div>
        <div className="category-pills-scroll">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button 
                key={cat.id}
                type="button"
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stores List */}
      <div className="stores-section">
        <div className="section-header">
          <h4>Nearby Campus Stores ({filteredStores.length})</h4>
          <span className="filter-hint">Delivering to {selectedHostel}</span>
        </div>

        {filteredStores.length === 0 ? (
          <div className="empty-stores-card">
            <p>No stores found matching "{searchQuery}" in {selectedHostel}.</p>
            <button type="button" className="btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="stores-grid">
            {filteredStores.map(store => {
              return (
                <div 
                  key={store.storeId} 
                  className={`store-card ${!store.isOpen ? 'store-closed' : ''}`}
                  onClick={() => onSelectStore(store)}
                >
                  <div className="store-banner-wrapper">
                    <img src={store.banner} alt={store.storeName} className="store-banner-img" />
                    <div className="store-banner-overlay">
                      <span className={`store-status-badge ${store.isOpen ? 'open' : 'closed'}`}>
                        {store.isOpen ? 'OPEN NOW' : 'CLOSED'}
                      </span>
                      <span className="store-delivery-time">
                        <Clock size={12} /> {store.deliveryTime}
                      </span>
                    </div>
                  </div>

                  <div className="store-body">
                    <div className="store-header-row">
                      <h3 className="store-name">{store.storeName}</h3>
                      <div className="store-rating-badge">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span>{store.rating}</span>
                      </div>
                    </div>

                    <div className="store-meta-row">
                      <span className="category-tag">{store.category}</span>
                      <span className="bullet">•</span>
                      <span className="store-location-text">{store.location}</span>
                    </div>

                    <div className="store-tags-list">
                      {store.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="store-tag-item">#{tag}</span>
                      ))}
                    </div>

                    <div className="store-card-footer">
                      <span className="view-menu-link">
                        View Products & Order <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
