import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  ChevronRight, 
  Star, 
  Clock, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Phone,
  User,
  ShieldCheck,
  CreditCard,
  Banknote,
  X,
  ExternalLink,
  Lock,
  Smartphone,
  LogOut,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HOSTEL_LOCATIONS, ORDER_STATUS_FLOW } from '../utils/mockData';
import CampusMap from './CampusMap';

export default function StudentApp({ dbState, db }) {
  // Authentication State: Defaults to false so app starts on the Login / OTP page!
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [smsNotification, setSmsNotification] = useState(null);

  // Navigation: 'home' | 'store_detail' | 'order_tracking'
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('store_stationery_01');
  const [activeOrderId, setActiveOrderId] = useState(null);

  // Student Profile
  const currentUser = dbState.users[0] || {
    userId: 'user_thejas_01',
    name: 'Thejas Gowda',
    phone: '+91 98765 43210',
    hostelBlock: 'Block B',
    roomNumber: '204'
  };

  const [studentNameInput, setStudentNameInput] = useState(currentUser.name || 'Thejas Gowda');
  const [selectedHostel, setSelectedHostel] = useState(currentUser.hostelBlock || 'Block B');
  const [roomNumberInput, setRoomNumberInput] = useState(currentUser.roomNumber || '204');

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Pay at Gate'

  // Shopping Cart: array of { product, qty }
  const [cart, setCart] = useState([]);

  // Active Store
  const selectedStore = dbState.stores.find(s => s.storeId === selectedStoreId) || dbState.stores[0];
  const storeProducts = dbState.products.filter(p => p.storeId === selectedStoreId);

  // Active Order for tracking
  const activeOrder = dbState.orders.find(o => o.orderId === activeOrderId) || 
                      (dbState.orders.length > 0 && currentView === 'order_tracking' ? dbState.orders[0] : null);

  // Handle automatic confetti celebration when order reaches Delivered
  useEffect(() => {
    if (activeOrder && activeOrder.status === 'Delivered') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [activeOrder?.status]);

  // --- AUTHENTICATION HANDLERS ---
  const handleSendOtp = (e) => {
    if (e) e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpError('');
    // Generate simulated 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setAuthStep('otp');
    setSmsNotification(`📩 SMS Gateway: Your HostelExpress OTP is ${code}`);
    setTimeout(() => {
      setSmsNotification(null);
    }, 9000);
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    if (enteredOtp !== generatedOtp && enteredOtp !== '123456') {
      setOtpError('Invalid demo code. Enter the code shown on screen or use 123456.');
      return;
    }
    setOtpError('');
    // Save/update student profile in Firestore
    db.updateUser(currentUser.userId, {
      name: studentNameInput,
      phone: phoneNumber.startsWith('+91') ? phoneNumber : `+91 ${phoneNumber}`,
      hostelBlock: selectedHostel,
      roomNumber: roomNumberInput
    });
    setIsAuthenticated(true);
    setCurrentView('home');
  };

  // Instant 1-Click Demo Login
  const handleFastDemoLogin = () => {
    setPhoneNumber('9876543210');
    setGeneratedOtp('123456');
    setEnteredOtp('123456');
    setStudentNameInput('Thejas Gowda');
    setSelectedHostel('Block B');
    setRoomNumberInput('204');
    setIsAuthenticated(true);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthStep('phone');
    setEnteredOtp('');
    setGeneratedOtp('');
    setCart([]);
    setShowProfileModal(false);
  };

  // Synchronize hostel selection with user profile in DB
  const handleHostelChange = (hostelId) => {
    setSelectedHostel(hostelId);
    db.updateUser(currentUser.userId, { hostelBlock: hostelId });
    setShowLocationModal(false);
  };

  // Cart operations
  const addToCart = (product) => {
    if (!product.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find(item => item.product.productId === product.productId);
      if (existing) {
        return prev.map(item => 
          item.product.productId === product.productId 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) => {
      return prev.map(item => {
        if (item.product.productId === productId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.productId !== productId));
  };

  const cartTotalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Handle Order Placement
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const orderPayload = {
      userId: currentUser.userId,
      storeId: selectedStore.storeId,
      items: cart.map(item => ({
        productId: item.product.productId,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty
      })),
      totalAmount: cartTotalAmount,
      hostelBlock: selectedHostel,
      roomNumber: roomNumberInput,
      studentName: studentNameInput || currentUser.name,
      phone: currentUser.phone,
      paymentMethod
    };

    const newOrder = db.placeOrder(orderPayload);
    setCart([]);
    setShowCartDrawer(false);
    setActiveOrderId(newOrder.orderId);
    setCurrentView('order_tracking');
  };

  // Filtered stores
  const filteredStores = dbState.stores.filter(store => {
    const matchesCategory = selectedCategory === 'All' || store.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          store.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesHostel = !store.allowedHostels || store.allowedHostels.includes(selectedHostel);
    return matchesCategory && matchesSearch && matchesHostel;
  });

  const categories = ['All', 'Stationery', 'Food/Hotels', 'Groceries', 'Bakeries', 'General Stores'];

  // =========================================================================
  // RENDER: IF NOT AUTHENTICATED -> SHOW MOBILE NUMBER & OTP LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="app-shell student-theme auth-wrapper animate-fade-in">
        {/* Floating simulated SMS notification banner */}
        {smsNotification && (
          <div className="sms-toast-banner animate-slide-up">
            <div className="sms-toast-content">
              <span>{smsNotification}</span>
              <button 
                type="button" 
                onClick={() => setEnteredOtp(generatedOtp)}
                className="btn-autofill-otp"
              >
                Auto-fill
              </button>
            </div>
          </div>
        )}

        <div className="auth-card-container">
          {/* Brand Header */}
          <div className="auth-brand-header">
            <div className="auth-logo-badge">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2>Campus Student Login</h2>
            <p className="auth-sub">Fast verification via Mobile Number & OTP</p>
          </div>

          {/* Quick Demo Shortcut */}
          <div className="demo-autofill-box">
            <button 
              type="button" 
              onClick={handleFastDemoLogin} 
              className="btn-demo-autofill"
              title="Instantly sign in as Thejas Gowda (Hostel Block B)"
            >
              <Sparkles size={14} className="text-amber" />
              <span>⚡ 1-Click Demo Login as <strong>Thejas Gowda (Block B)</strong></span>
            </button>
          </div>

          {/* STEP 1: ENTER MOBILE NUMBER */}
          {authStep === 'phone' && (
            <form onSubmit={handleSendOtp} className="auth-form animate-fade-in">
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="phone-input-wrap">
                  <span className="country-code">🇮🇳 +91</span>
                  <input 
                    type="tel" 
                    placeholder="98765 43210" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="phone-input-field"
                    autoFocus
                    required
                  />
                </div>
                <span className="input-hint">Demo only: no SMS is sent; the code appears on screen</span>
              </div>

              {/* Student Profile Quick Details */}
              <div className="auth-profile-preview">
                <div className="form-group mb-2">
                  <label>Student Name</label>
                  <input 
                    type="text" 
                    value={studentNameInput} 
                    onChange={(e) => setStudentNameInput(e.target.value)}
                    className="form-input compact"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1 mb-0">
                    <label>Hostel Block</label>
                    <select 
                      value={selectedHostel} 
                      onChange={(e) => setSelectedHostel(e.target.value)}
                      className="form-select compact"
                    >
                      {HOSTEL_LOCATIONS.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group flex-1 mb-0">
                    <label>Room No</label>
                    <input 
                      type="text" 
                      value={roomNumberInput} 
                      onChange={(e) => setRoomNumberInput(e.target.value)}
                      className="form-input compact"
                      required
                    />
                  </div>
                </div>
              </div>

              {otpError && <div className="auth-error-msg"><AlertCircle size={14} /> {otpError}</div>}

              <button type="submit" className="btn-auth-primary">
                <span>Send Verification OTP</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: ENTER OTP */}
          {authStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="auth-form animate-fade-in">
              <div className="otp-info-header">
                <p>Enter the 6-digit demo code shown on screen for +91 {phoneNumber}</p>
                <button 
                  type="button" 
                  onClick={() => setAuthStep('phone')} 
                  className="btn-edit-phone"
                >
                  Edit Number
                </button>
              </div>

              <div className="form-group">
                <label>Verification Code (OTP)</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="• • • • • •" 
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="otp-input-field"
                  autoFocus
                  required
                />
                <div className="otp-helper-row">
                  <span className="otp-test-hint">Test code: <strong>{generatedOtp || '123456'}</strong></span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(newCode);
                      setSmsNotification(`📩 Resent OTP: ${newCode}`);
                    }}
                    className="btn-resend-otp"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              {otpError && <div className="auth-error-msg"><AlertCircle size={14} /> {otpError}</div>}

              <button type="submit" className="btn-auth-primary">
                <CheckCircle2 size={16} />
                <span>Verify OTP & Enter Campus Store</span>
              </button>

              <button 
                type="button" 
                onClick={handleFastDemoLogin} 
                className="btn-auth-secondary"
              >
                Skip & Enter as Thejas Gowda (Block B)
              </button>
            </form>
          )}

          <div className="auth-footer-terms">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Demo sign-in — no phone verification or cloud connection</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: AUTHENTICATED STUDENT APP SCREENS
  // =========================================================================
  return (
    <div className="app-shell student-theme">
      {/* Top Header / App Bar */}
      <header className="mobile-header">
        <div className="header-left">
          <button 
            type="button"
            className="location-pill-btn" 
            onClick={() => setShowLocationModal(true)}
            title="Change Delivery Hostel"
          >
            <div className="location-pin-icon">
              <MapPin size={16} />
            </div>
            <div className="location-text">
              <span className="location-sub">Deliver to Campus</span>
              <strong className="location-name">{selectedHostel} ▾</strong>
            </div>
          </button>
        </div>

        <div className="header-right">
          {/* Quick Profile Button */}
          <button 
            type="button"
            className="avatar-btn" 
            onClick={() => setShowProfileModal(true)}
            title={`Logged in as ${studentNameInput} (Click for Profile/Logout)`}
          >
            <img src={currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"} alt={studentNameInput} className="avatar-img" />
          </button>

          {/* Cart Icon Badge */}
          <button 
            type="button"
            className="cart-trigger-btn" 
            onClick={() => setShowCartDrawer(true)}
            title="Open Shopping Cart"
          >
            <ShoppingBag size={20} />
            {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mobile-content">
        {/* VIEW 1: HOME & STORE DISCOVERY */}
        {currentView === 'home' && (
          <div className="home-screen-view animate-fade-in">
            {/* Search Box */}
            <div className="search-bar-wrap">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search stationery, snacks, food..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="search-clear">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Hostel Selector Banner */}
            <div className="hostel-announcement-card" onClick={() => setShowLocationModal(true)}>
              <div className="announcement-content">
                <span className="badge-pill">⚡ Fast Campus Delivery</span>
                <h3>Direct to {selectedHostel} Gate</h3>
                <p>Welcome, {studentNameInput} • Room {roomNumberInput}</p>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </div>

            {/* Category Pills Carousel */}
            <div className="category-scroll-container">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'All' && '🛍️ '}
                  {cat === 'Stationery' && '📚 '}
                  {cat === 'Food/Hotels' && '🍔 '}
                  {cat === 'Groceries' && '🛒 '}
                  {cat === 'Bakeries' && '🥐 '}
                  {cat === 'General Stores' && '🎒 '}
                  {cat}
                </button>
              ))}
            </div>

            {/* Stores Section Header */}
            <div className="section-title-row">
              <h2>Nearby Campus Stores</h2>
              <span className="count-pill">{filteredStores.length} open</span>
            </div>

            {/* Stores List */}
            <div className="stores-list-grid">
              {filteredStores.map((store) => (
                <div 
                  key={store.storeId} 
                  className="store-card hover-lift"
                  onClick={() => {
                    setSelectedStoreId(store.storeId);
                    setCurrentView('store_detail');
                  }}
                >
                  <div className="store-card-image-wrap">
                    <img src={store.banner} alt={store.storeName} className="store-banner-img" />
                    <span className={`store-status-badge ${store.isOpen ? 'badge-open' : 'badge-closed'}`}>
                      {store.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                    <span className="store-category-chip">{store.category}</span>
                  </div>

                  <div className="store-card-body">
                    <div className="store-card-header">
                      <h3 className="store-title">{store.storeName}</h3>
                      <div className="store-rating-badge">
                        <Star size={13} className="fill-amber" />
                        <span>{store.rating}</span>
                      </div>
                    </div>
                    
                    <p className="store-location-text">{store.location}</p>

                    <div className="store-card-meta">
                      <div className="meta-item">
                        <Clock size={13} />
                        <span>{store.deliveryTime}</span>
                      </div>
                      <span className="meta-divider">•</span>
                      <div className="meta-item">
                        <span>Min ₹{store.minOrder}</span>
                      </div>
                      <span className="meta-divider">•</span>
                      <div className="meta-item text-primary font-bold">
                        <span>Free Delivery to {selectedHostel}</span>
                      </div>
                    </div>

                    <div className="store-tags-row">
                      {store.tags.map((tag, idx) => (
                        <span key={idx} className="store-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {filteredStores.length === 0 && (
                <div className="empty-state-box">
                  <AlertCircle size={36} className="text-muted" />
                  <h4>No stores found</h4>
                  <p>Try switching category or selecting a different hostel wing.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: STORE DETAILS & PRODUCT LIST */}
        {currentView === 'store_detail' && (
          <div className="store-detail-view animate-fade-in">
            {/* Store Back Bar */}
            <div className="detail-top-nav">
              <button 
                type="button" 
                className="icon-circle-btn" 
                onClick={() => setCurrentView('home')}
                title="Back to Stores"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="detail-nav-title">{selectedStore.storeName}</span>
              <button 
                type="button" 
                className="cart-trigger-btn small" 
                onClick={() => setShowCartDrawer(true)}
              >
                <ShoppingBag size={18} />
                {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
              </button>
            </div>

            {/* Store Hero Banner */}
            <div className="store-hero-card">
              <img src={selectedStore.banner} alt={selectedStore.storeName} className="store-hero-img" />
              <div className="store-hero-overlay">
                <span className="category-pill-hero">{selectedStore.category}</span>
                <h2>{selectedStore.storeName}</h2>
                <p className="hero-loc">{selectedStore.location}</p>
                <div className="hero-meta-row">
                  <span className="hero-rating"><Star size={14} className="fill-amber" /> {selectedStore.rating} ({selectedStore.reviewsCount}+ ratings)</span>
                  <span className="hero-time"><Clock size={14} /> {selectedStore.deliveryTime}</span>
                  <span className="hero-status">{selectedStore.isOpen ? '🟢 Open Now' : '🔴 Closed'}</span>
                </div>
              </div>
            </div>

            {/* Product List Header */}
            <div className="product-list-header">
              <h3>Store Menu & Inventory ({storeProducts.length} items)</h3>
              <p className="subtitle">Real-time inventory connected to Store Terminal</p>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {storeProducts.map((product) => {
                const inCartItem = cart.find(item => item.product.productId === product.productId);
                const isOutOfStock = !product.isAvailable;

                return (
                  <div 
                    key={product.productId} 
                    className={`product-card ${isOutOfStock ? 'product-disabled' : ''}`}
                  >
                    <div className="product-img-wrap">
                      <img src={product.image} alt={product.name} className="product-img" />
                      
                      {/* Stock Indicator */}
                      <span className={`stock-badge ${product.isAvailable ? 'stock-available' : 'stock-out'}`}>
                        {product.isAvailable ? '● Available' : '✕ Out of Stock'}
                      </span>
                    </div>

                    <div className="product-info">
                      <div className="product-title-row">
                        <h4 className="product-name">{product.name}</h4>
                        <span className="product-price">₹{product.price}</span>
                      </div>
                      
                      <p className="product-desc">{product.description}</p>

                      <div className="product-actions-row">
                        {isOutOfStock ? (
                          <button 
                            type="button" 
                            className="btn-add-cart disabled" 
                            disabled 
                            title="This item is currently out of stock"
                          >
                            Out of Stock
                          </button>
                        ) : inCartItem ? (
                          <div className="qty-stepper">
                            <button 
                              type="button" 
                              onClick={() => updateCartQty(product.productId, -1)} 
                              className="qty-btn"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-count">{inCartItem.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => updateCartQty(product.productId, 1)} 
                              className="qty-btn"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            className="btn-add-cart" 
                            onClick={() => addToCart(product)}
                          >
                            <Plus size={16} /> Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: ORDER TRACKING SCREEN */}
        {currentView === 'order_tracking' && (
          <div className="order-tracking-view animate-fade-in">
            {/* Top Bar */}
            <div className="tracking-top-nav">
              <button 
                type="button" 
                className="icon-circle-btn" 
                onClick={() => setCurrentView('home')}
                title="Back to Home"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="nav-title-group">
                <span className="nav-eyebrow">Active Order</span>
                <strong className="nav-order-id">{activeOrder ? activeOrder.displayId || `#${activeOrder.orderId.replace('ORDER_', '')}` : '#1001'}</strong>
              </div>
              <span className={`status-pill-badge status-${activeOrder?.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {activeOrder?.status || 'Placed'}
              </span>
            </div>

            {/* Visual Step-by-Step Progress Tracker */}
            <div className="progress-tracker-card">
              <div className="tracker-card-header">
                <div>
                  <span className="sub-title">Order Lifecycle Status</span>
                  <h4>{activeOrder?.status === 'Delivered' ? '🎉 Order Delivered!' : `In Progress: ${activeOrder?.status}`}</h4>
                </div>
                <div className="live-pulse-container">
                  <span className="pulse-beacon"></span>
                  <span className="live-label">Firestore Real-time</span>
                </div>
              </div>

              {/* Steps Horizontal Flow */}
              <div className="stepper-horizontal">
                {ORDER_STATUS_FLOW.map((step, idx) => {
                  const currentIdx = ORDER_STATUS_FLOW.indexOf(activeOrder?.status || 'Placed');
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step} className={`step-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                      <div className="step-circle">
                        {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={14} />}
                      </div>
                      <span className="step-label">{step}</span>
                      {idx < ORDER_STATUS_FLOW.length - 1 && (
                        <div className={`step-connector ${idx < currentIdx ? 'filled' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Campus GPS Map Component */}
            <div className="tracking-map-section">
              <div className="section-sub-header">
                <h4>Simulated Campus Delivery Navigation</h4>
                <span className="badge-gps">Google Maps API Sim</span>
              </div>
              <CampusMap 
                orderStatus={activeOrder?.status || 'Placed'}
                hostelBlock={activeOrder?.hostelBlock || selectedHostel}
                storeName={activeOrder?.storeName || selectedStore.storeName}
              />
            </div>

            {/* Order Items Summary Card */}
            {activeOrder && (
              <div className="order-receipt-card">
                <div className="receipt-header">
                  <div>
                    <span className="receipt-store-label">From: {activeOrder.storeName}</span>
                    <h5>Delivery to: Hostel {activeOrder.hostelBlock}, Room {activeOrder.roomNumber}</h5>
                  </div>
                  <span className="receipt-badge-cod">{activeOrder.paymentMethod || 'COD'}</span>
                </div>

                <div className="receipt-items-list">
                  {activeOrder.items?.map((item, idx) => (
                    <div key={idx} className="receipt-item-row">
                      <span className="item-name">{item.name} × {item.qty}</span>
                      <strong className="item-price">₹{item.price * item.qty}</strong>
                    </div>
                  ))}
                </div>

                <div className="receipt-total-row">
                  <span>Total Amount Paid / Payable:</span>
                  <span className="total-highlight">₹{activeOrder.totalAmount}</span>
                </div>

                <div className="delivery-action-buttons">
                  <a href={`tel:${currentUser.phone}`} className="btn-call-rider">
                    <Phone size={16} /> Call Delivery Partner
                  </a>
                  <button 
                    type="button" 
                    className="btn-new-order" 
                    onClick={() => setCurrentView('home')}
                  >
                    Browse More Items
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {currentView === 'store_detail' && cartItemsCount > 0 && (
        <div className="floating-cart-bar animate-slide-up">
          <div className="cart-bar-info">
            <span className="cart-bar-count">{cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}</span>
            <strong className="cart-bar-total">₹{cartTotalAmount}</strong>
          </div>
          <button 
            type="button" 
            className="btn-view-cart" 
            onClick={() => setShowCartDrawer(true)}
          >
            View Cart & Checkout ➔
          </button>
        </div>
      )}

      {/* SHOPPING CART & CHECKOUT DRAWER */}
      {showCartDrawer && (
        <div className="modal-backdrop" onClick={() => setShowCartDrawer(false)}>
          <div className="cart-drawer-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <ShoppingBag size={20} className="text-primary" />
                <h3>Your Campus Cart ({cartItemsCount})</h3>
              </div>
              <button 
                type="button" 
                className="close-drawer-btn" 
                onClick={() => setShowCartDrawer(false)}
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart-state">
                <ShoppingBag size={48} className="text-muted" />
                <h4>Your cart is empty</h4>
                <p>Add stationery, groceries, or snacks from local campus stores.</p>
                <button 
                  type="button" 
                  className="btn-primary-compact" 
                  onClick={() => setShowCartDrawer(false)}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-scroll">
                  {cart.map((item) => (
                    <div key={item.product.productId} className="cart-item-row">
                      <img src={item.product.image} alt={item.product.name} className="cart-item-thumbnail" />
                      <div className="cart-item-details">
                        <h4>{item.product.name}</h4>
                        <span className="cart-item-unit-price">₹{item.product.price} each</span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="qty-stepper small">
                          <button type="button" onClick={() => updateCartQty(item.product.productId, -1)} className="qty-btn">
                            <Minus size={12} />
                          </button>
                          <span className="qty-count">{item.qty}</span>
                          <button type="button" onClick={() => updateCartQty(item.product.productId, 1)} className="qty-btn">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="cart-item-subtotal">₹{item.product.price * item.qty}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item.product.productId)}
                          className="cart-delete-btn"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Location Selector in Cart */}
                <div className="cart-delivery-selector-card">
                  <div className="card-sub-header">
                    <MapPin size={16} className="text-indigo" />
                    <strong>Delivery Location: Campus Hostel</strong>
                  </div>
                  <div className="hostel-quick-picker">
                    <select 
                      value={selectedHostel} 
                      onChange={(e) => handleHostelChange(e.target.value)}
                      className="hostel-dropdown-select"
                    >
                      {HOSTEL_LOCATIONS.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      placeholder="Room No (e.g. 204)" 
                      value={roomNumberInput}
                      onChange={(e) => setRoomNumberInput(e.target.value)}
                      className="room-input-field"
                    />
                  </div>
                </div>

                {/* Payment Method Toggle: COD / Pay at Gate */}
                <div className="payment-method-card">
                  <div className="card-sub-header">
                    <Banknote size={16} className="text-emerald" />
                    <strong>Payment Method</strong>
                  </div>
                  <div className="payment-toggle-group">
                    <label className={`payment-pill-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD" 
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                      />
                      <span>💵 Cash on Delivery (COD)</span>
                    </label>
                    <label className={`payment-pill-option ${paymentMethod === 'Pay at Gate' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="Pay at Gate" 
                        checked={paymentMethod === 'Pay at Gate'}
                        onChange={() => setPaymentMethod('Pay at Gate')}
                      />
                      <span>🚪 Pay at Gate (UPI/Cash)</span>
                    </label>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="cart-bill-breakdown">
                  <div className="bill-row">
                    <span>Subtotal</span>
                    <span>₹{cartTotalAmount}</span>
                  </div>
                  <div className="bill-row">
                    <span>Hostel Delivery Fee</span>
                    <span className="text-emerald font-bold">FREE (Campus Wing)</span>
                  </div>
                  <div className="bill-row">
                    <span>Taxes & Handling</span>
                    <span>₹0</span>
                  </div>
                  <div className="bill-total-row">
                    <span>To Pay</span>
                    <span className="bill-total-price">₹{cartTotalAmount}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button 
                  type="button" 
                  className="btn-place-order" 
                  onClick={handlePlaceOrder}
                >
                  Place Order (₹{cartTotalAmount}) ➔
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* HOSTEL LOCATION SELECTION MODAL */}
      {showLocationModal && (
        <div className="modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="dialog-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Hostel Delivery Location</h3>
              <button type="button" onClick={() => setShowLocationModal(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            <p className="modal-sub">Choose your hostel wing for real-time local store filtering</p>
            
            <div className="hostels-cards-list">
              {HOSTEL_LOCATIONS.map((hostel) => (
                <div 
                  key={hostel.id} 
                  className={`hostel-choice-card ${selectedHostel === hostel.id ? 'active' : ''}`}
                  onClick={() => handleHostelChange(hostel.id)}
                >
                  <div className="hostel-card-left">
                    <span className="hostel-badge-dot"></span>
                    <div>
                      <strong>{hostel.name}</strong>
                      <p>{hostel.tag}</p>
                    </div>
                  </div>
                  {selectedHostel === hostel.id && <CheckCircle2 size={18} className="text-primary" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE & LOGOUT MODAL */}
      {showProfileModal && (
        <div className="modal-backdrop" onClick={() => setShowProfileModal(false)}>
          <div className="dialog-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile Setup</h3>
              <button type="button" onClick={() => setShowProfileModal(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="profile-form">
              <div className="form-group">
                <label>Student Full Name</label>
                <input 
                  type="text" 
                  value={studentNameInput} 
                  onChange={(e) => {
                    setStudentNameInput(e.target.value);
                    db.updateUser(currentUser.userId, { name: e.target.value });
                  }}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Phone Number (Verified)</label>
                <input 
                  type="text" 
                  defaultValue={currentUser.phone} 
                  onChange={(e) => db.updateUser(currentUser.userId, { phone: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Hostel Block</label>
                  <select 
                    value={selectedHostel} 
                    onChange={(e) => handleHostelChange(e.target.value)}
                    className="form-select"
                  >
                    {HOSTEL_LOCATIONS.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Room Number</label>
                  <input 
                    type="text" 
                    value={roomNumberInput} 
                    onChange={(e) => {
                      setRoomNumberInput(e.target.value);
                      db.updateUser(currentUser.userId, { roomNumber: e.target.value });
                    }}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="profile-actions-strip">
                <button 
                  type="button" 
                  className="btn-primary-compact flex-1" 
                  onClick={() => setShowProfileModal(false)}
                >
                  Save Profile Settings
                </button>
                <button 
                  type="button" 
                  className="btn-logout-danger" 
                  onClick={handleLogout}
                  title="Log out and return to Phone/OTP Login"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
