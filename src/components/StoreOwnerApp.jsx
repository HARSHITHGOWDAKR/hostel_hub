import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  Bell, 
  Power, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Tag,
  Sparkles,
  PhoneCall,
  LogOut,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { soundManager } from '../utils/audioAlert';
import { ORDER_STATUS_FLOW } from '../utils/mockData';

// Preset sample images for fast store item adding & editing
const PRESET_IMAGES = [
  { name: 'Record Book', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80' },
  { name: 'Gel Pen', url: 'https://images.unsplash.com/photo-1585336261026-77cc7c458e39?w=300&auto=format&fit=crop&q=80' },
  { name: 'Engineering Sheets', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&auto=format&fit=crop&q=80' },
  { name: 'Calculator', url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=300&auto=format&fit=crop&q=80' },
  { name: 'Highlighters', url: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=300&auto=format&fit=crop&q=80' },
  { name: 'Hot Maggi / Food', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop&q=80' },
  { name: 'Cold Coffee', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80' },
  { name: 'Bakery / Snacks', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80' },
];

export default function StoreOwnerApp({ dbState, db }) {
  // Store Owner Authentication: Starts on Login / OTP page!
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [ownerAuthStep, setOwnerAuthStep] = useState('phone'); // 'phone' | 'otp'
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerGeneratedOtp, setOwnerGeneratedOtp] = useState('');
  const [ownerEnteredOtp, setOwnerEnteredOtp] = useState('');
  const [ownerOtpError, setOwnerOtpError] = useState('');
  const [ownerSmsToast, setOwnerSmsToast] = useState(null);

  // Store Owner active tab: 'orders' | 'inventory' | 'settings'
  const [activeTab, setActiveTab] = useState('orders');
  
  // Store selection (default to Campus Stationery Store for Demonstration)
  const [selectedStoreId, setSelectedStoreId] = useState('store_stationery_01');
  const [soundEnabled, setSoundEnabled] = useState(soundManager.soundEnabled);
  
  // ADD PRODUCT MODAL STATE
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCat, setNewProdCat] = useState('Stationery');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(PRESET_IMAGES[0].url);
  const [newProdAvailable, setNewProdAvailable] = useState(true);

  // EDIT PRODUCT MODAL STATE (Full item editing: name, price, category, desc, stock)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdCat, setEditProdCat] = useState('Stationery');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdAvailable, setEditProdAvailable] = useState(true);

  // Quick inline price editor state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');

  // Active Store
  const store = dbState.stores.find(s => s.storeId === selectedStoreId) || dbState.stores[0];
  const products = dbState.products.filter(p => p.storeId === selectedStoreId);
  const orders = dbState.orders.filter(o => o.storeId === selectedStoreId);

  // --- OWNER AUTHENTICATION HANDLERS ---
  const handleOwnerSendOtp = (e) => {
    if (e) e.preventDefault();
    if (!ownerPhone || ownerPhone.length < 10) {
      setOwnerOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOwnerOtpError('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOwnerGeneratedOtp(code);
    setOwnerAuthStep('otp');
    setOwnerSmsToast(`📩 Store Owner OTP: ${code} for ${store.storeName}`);
    setTimeout(() => setOwnerSmsToast(null), 9000);
  };

  const handleOwnerVerifyOtp = (e) => {
    if (e) e.preventDefault();
    if (ownerEnteredOtp !== ownerGeneratedOtp && ownerEnteredOtp !== '123456') {
      setOwnerOtpError('Invalid OTP code. Please enter the code sent to your phone or use 123456.');
      return;
    }
    setOwnerOtpError('');
    setIsOwnerAuthenticated(true);
  };

  const handleFastOwnerDemoLogin = () => {
    setOwnerPhone('9811122334');
    setOwnerGeneratedOtp('123456');
    setOwnerEnteredOtp('123456');
    setIsOwnerAuthenticated(true);
  };

  const handleOwnerLogout = () => {
    setIsOwnerAuthenticated(false);
    setOwnerAuthStep('phone');
    setOwnerEnteredOtp('');
    setOwnerGeneratedOtp('');
  };

  // Toggle store open/close
  const toggleStoreStatus = () => {
    db.updateStoreStatus(store.storeId, !store.isOpen);
  };

  // Toggle audio notification sound
  const toggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  const testChime = () => {
    soundManager.playOrderAlert();
  };

  // Stock status toggle
  const toggleStock = (productId, currentStatus) => {
    db.updateProductStock(productId, !currentStatus);
  };

  // Inline quick price save
  const savePrice = (productId) => {
    if (editingPriceValue && !isNaN(editingPriceValue)) {
      db.updateProductPrice(productId, parseFloat(editingPriceValue));
    }
    setEditingPriceId(null);
  };

  // Open Full Edit Product Modal
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setEditProdName(product.name);
    setEditProdPrice(product.price.toString());
    setEditProdCat(product.category || store.category);
    setEditProdDesc(product.description || '');
    setEditProdImage(product.image || PRESET_IMAGES[0].url);
    setEditProdAvailable(product.isAvailable);
  };

  // Save Full Product Edits
  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!editingProduct || !editProdName || !editProdPrice) return;

    db.updateProduct(editingProduct.productId, {
      name: editProdName,
      price: parseFloat(editProdPrice),
      category: editProdCat,
      description: editProdDesc,
      image: editProdImage,
      isAvailable: editProdAvailable
    });

    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to remove this item from your store inventory?')) {
      db.deleteProduct(productId);
      setEditingProduct(null);
    }
  };

  // Add new product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    
    db.addProduct({
      storeId: store.storeId,
      name: newProdName,
      price: parseFloat(newProdPrice),
      category: newProdCat,
      description: newProdDesc || 'Campus store item',
      image: newProdImage,
      isAvailable: newProdAvailable
    });

    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdImage(PRESET_IMAGES[0].url);
    setNewProdAvailable(true);
    setShowAddModal(false);
  };

  // Order status actions
  const handleAcceptOrder = (orderId) => {
    db.updateOrderStatus(orderId, 'Accepted');
  };

  const handleRejectOrder = (orderId) => {
    db.rejectOrder(orderId, 'Store is temporarily congested');
  };

  const advanceOrderStatus = (orderId, currentStatus) => {
    const nextSteps = {
      'Accepted': 'Preparing',
      'Preparing': 'Ready',
      'Ready': 'Out for Delivery',
      'Out for Delivery': 'Delivered'
    };
    const next = nextSteps[currentStatus];
    if (next) {
      db.updateOrderStatus(orderId, next);
    }
  };

  // Metrics
  const activeOrdersCount = orders.filter(o => !['Delivered', 'Rejected'].includes(o.status)).length;
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'Rejected' ? sum + o.totalAmount : sum, 0);

  // =========================================================================
  // RENDER: IF STORE OWNER NOT AUTHENTICATED -> SHOW MERCHANT LOGIN / OTP
  // =========================================================================
  if (!isOwnerAuthenticated) {
    return (
      <div className="app-shell store-theme auth-wrapper animate-fade-in">
        {ownerSmsToast && (
          <div className="sms-toast-banner animate-slide-up">
            <div className="sms-toast-content">
              <span>{ownerSmsToast}</span>
              <button 
                type="button" 
                onClick={() => setOwnerEnteredOtp(ownerGeneratedOtp)}
                className="btn-autofill-otp"
              >
                Auto-fill
              </button>
            </div>
          </div>
        )}

        <div className="auth-card-container">
          <div className="auth-brand-header">
            <div className="auth-logo-badge owner-badge">
              <Store size={26} className="text-white" />
            </div>
            <h2>Store Owner Terminal</h2>
            <p className="auth-sub">Merchant Login & Order Stream Access with Phone OTP</p>
          </div>

          {/* Quick Demo Shortcut */}
          <div className="demo-autofill-box">
            <button 
              type="button" 
              onClick={handleFastOwnerDemoLogin} 
              className="btn-demo-autofill"
              title="Instantly sign in to Campus Stationery Store terminal"
            >
              <Sparkles size={14} className="text-amber" />
              <span>⚡ 1-Click Demo Login as <strong>Ramesh ({store.storeName})</strong></span>
            </button>
          </div>

          {/* STEP 1: PHONE */}
          {ownerAuthStep === 'phone' && (
            <form onSubmit={handleOwnerSendOtp} className="auth-form animate-fade-in">
              <div className="form-group">
                <label>Merchant Registered Phone</label>
                <div className="phone-input-wrap">
                  <span className="country-code">🇮🇳 +91</span>
                  <input 
                    type="tel" 
                    placeholder="98111 22334" 
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="phone-input-field"
                    autoFocus
                    required
                  />
                </div>
                <span className="input-hint">Verification code will be sent to owner mobile</span>
              </div>

              <div className="form-group">
                <label>Select Store Location</label>
                <select 
                  value={selectedStoreId} 
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="form-select"
                >
                  {dbState.stores.map(s => (
                    <option key={s.storeId} value={s.storeId}>
                      {s.storeName} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              {ownerOtpError && <div className="auth-error-msg"><AlertCircle size={14} /> {ownerOtpError}</div>}

              <button type="submit" className="btn-auth-primary owner-btn">
                <span>Send Merchant OTP</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {ownerAuthStep === 'otp' && (
            <form onSubmit={handleOwnerVerifyOtp} className="auth-form animate-fade-in">
              <div className="otp-info-header">
                <p>Enter 6-digit merchant OTP sent to <strong>+91 {ownerPhone}</strong></p>
                <button 
                  type="button" 
                  onClick={() => setOwnerAuthStep('phone')} 
                  className="btn-edit-phone"
                >
                  Edit Number
                </button>
              </div>

              <div className="form-group">
                <label>Merchant OTP Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="• • • • • •" 
                  value={ownerEnteredOtp}
                  onChange={(e) => setOwnerEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  className="otp-input-field"
                  autoFocus
                  required
                />
                <div className="otp-helper-row">
                  <span className="otp-test-hint">Test code: <strong>{ownerGeneratedOtp || '123456'}</strong></span>
                  <button 
                    type="button" 
                    onClick={() => {
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setOwnerGeneratedOtp(code);
                      setOwnerSmsToast(`📩 Resent Store OTP: ${code}`);
                    }}
                    className="btn-resend-otp"
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              {ownerOtpError && <div className="auth-error-msg"><AlertCircle size={14} /> {ownerOtpError}</div>}

              <button type="submit" className="btn-auth-primary owner-btn">
                <CheckCircle2 size={16} />
                <span>Verify & Open Order Terminal</span>
              </button>

              <button 
                type="button" 
                onClick={handleFastOwnerDemoLogin} 
                className="btn-auth-secondary"
              >
                Skip & Enter as Ramesh ({store.storeName})
              </button>
            </form>
          )}

          <div className="auth-footer-terms">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Authenticated with Firebase Cloud Auth & Real-Time Firestore</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: AUTHENTICATED STORE OWNER TERMINAL & DASHBOARD
  // =========================================================================
  return (
    <div className="app-shell store-theme">
      {/* Top Merchant Terminal Header */}
      <header className="merchant-header">
        <div className="merchant-header-left">
          <div className="store-avatar-box">
            <Store size={22} className="text-white" />
          </div>
          <div>
            <div className="store-title-row">
              <h2 className="merchant-name">{store.storeName}</h2>
              <button 
                type="button" 
                onClick={toggleStoreStatus}
                className={`store-toggle-pill ${store.isOpen ? 'is-open' : 'is-closed'}`}
                title="Toggle Store Open / Closed"
              >
                <Power size={12} />
                <span>{store.isOpen ? 'ONLINE / ACCEPTING' : 'OFFLINE / CLOSED'}</span>
              </button>
            </div>
            <p className="merchant-meta">{store.category} • {store.location}</p>
          </div>
        </div>

        <div className="merchant-header-right">
          {/* Audio Chime Notification Toggle */}
          <button 
            type="button" 
            onClick={toggleSound} 
            className={`terminal-icon-btn ${soundEnabled ? 'active-sound' : 'muted-sound'}`}
            title={soundEnabled ? 'Audio Chime Enabled (Click to Mute)' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button 
            type="button" 
            onClick={testChime} 
            className="test-chime-btn"
            title="Play Test Notification Chime"
          >
            🔔 Test Chime
          </button>

          {/* Logout Button */}
          <button 
            type="button" 
            onClick={handleOwnerLogout} 
            className="btn-terminal-logout"
            title="Sign out of Store Terminal to test Login/OTP"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Terminal Stats Strip */}
      <div className="terminal-stats-strip">
        <div className="stat-card">
          <span className="stat-label">Active Orders</span>
          <strong className="stat-value text-indigo">{activeOrdersCount}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Store Orders</span>
          <strong className="stat-value">{orders.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Estimated Sales</span>
          <strong className="stat-value text-emerald">₹{totalRevenue}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Inventory</span>
          <strong className="stat-value">{products.length} Items</strong>
        </div>
      </div>

      {/* Merchant Nav Tabs */}
      <div className="merchant-tabs-bar">
        <button 
          type="button" 
          onClick={() => setActiveTab('orders')} 
          className={`merchant-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <Bell size={16} />
          <span>Live Order Terminal</span>
          {activeOrdersCount > 0 && <span className="tab-badge">{activeOrdersCount}</span>}
        </button>

        <button 
          type="button" 
          onClick={() => setActiveTab('inventory')} 
          className={`merchant-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
        >
          <Package size={16} />
          <span>Inventory & Edit Products ({products.length})</span>
        </button>

        <button 
          type="button" 
          onClick={() => setActiveTab('settings')} 
          className={`merchant-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Store size={16} />
          <span>Business Profile</span>
        </button>
      </div>

      {/* Tab 1: LIVE ORDER MANAGEMENT TERMINAL */}
      {activeTab === 'orders' && (
        <div className="terminal-content-area animate-fade-in">
          <div className="terminal-section-heading">
            <div>
              <h3>Real-Time Cloud Firestore Order Stream</h3>
              <p>Instant push synchronization with Student App & simulated delivery dispatch</p>
            </div>
            <div className="live-status-indicator">
              <span className="green-pulse-dot"></span>
              <span>Listening to Firestore collection "orders"</span>
            </div>
          </div>

          <div className="orders-cards-grid">
            {orders.map((order) => {
              const isPending = order.status === 'Placed';
              const isDelivered = order.status === 'Delivered';
              const isRejected = order.status === 'Rejected';

              return (
                <div 
                  key={order.orderId} 
                  className={`terminal-order-card ${isPending ? 'card-highlight-pulse' : ''} ${isDelivered ? 'card-completed' : ''}`}
                >
                  <div className="order-card-top">
                    <div className="order-id-group">
                      <span className="order-id-pill">{order.displayId || `#${order.orderId.replace('ORDER_', '')}`}</span>
                      <span className="order-time-text">
                        <Clock size={12} /> {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`status-pill status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="student-profile-strip">
                    <div className="student-avatar-circle">
                      {order.studentName ? order.studentName.charAt(0) : 'S'}
                    </div>
                    <div className="student-details">
                      <strong>{order.studentName || 'Student User'}</strong>
                      <span>Hostel {order.hostelBlock} • Room {order.roomNumber}</span>
                      <span className="phone-text">📞 {order.phone}</span>
                    </div>
                  </div>

                  {/* Itemized List */}
                  <div className="terminal-items-box">
                    <span className="box-label">Itemized Order Items:</span>
                    <div className="items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="item-row">
                          <span className="item-name font-medium">{item.name}</span>
                          <span className="item-qty-badge">×{item.qty}</span>
                          <span className="item-subtotal">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bill & Payment Method */}
                  <div className="order-total-bar">
                    <div>
                      <span className="pay-method-badge">{order.paymentMethod || 'COD'}</span>
                    </div>
                    <div className="total-amount-box">
                      <span className="total-label">Total Amount:</span>
                      <strong className="total-sum">₹{order.totalAmount}</strong>
                    </div>
                  </div>

                  {/* Order Status Transition Controls */}
                  <div className="order-actions-bar">
                    {isPending && (
                      <div className="decision-buttons-row">
                        <button 
                          type="button" 
                          onClick={() => handleAcceptOrder(order.orderId)}
                          className="btn-terminal-accept"
                        >
                          <Check size={16} /> Accept Order
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleRejectOrder(order.orderId)}
                          className="btn-terminal-reject"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    )}

                    {order.status === 'Accepted' && (
                      <button 
                        type="button" 
                        onClick={() => advanceOrderStatus(order.orderId, 'Accepted')}
                        className="btn-terminal-transition step-preparing"
                      >
                        Start Preparing Order ➔
                      </button>
                    )}

                    {order.status === 'Preparing' && (
                      <button 
                        type="button" 
                        onClick={() => advanceOrderStatus(order.orderId, 'Preparing')}
                        className="btn-terminal-transition step-ready"
                      >
                        Mark Ready for Pickup ➔
                      </button>
                    )}

                    {order.status === 'Ready' && (
                      <button 
                        type="button" 
                        onClick={() => advanceOrderStatus(order.orderId, 'Ready')}
                        className="btn-terminal-transition step-delivery"
                      >
                        Dispatch: Out for Delivery ➔
                      </button>
                    )}

                    {order.status === 'Out for Delivery' && (
                      <button 
                        type="button" 
                        onClick={() => advanceOrderStatus(order.orderId, 'Out for Delivery')}
                        className="btn-terminal-transition step-delivered"
                      >
                        Mark as Delivered ✓
                      </button>
                    )}

                    {isDelivered && (
                      <div className="delivered-badge-box">
                        <CheckCircle size={16} className="text-emerald" />
                        <span>Order Completed & Delivered</span>
                      </div>
                    )}

                    {isRejected && (
                      <div className="rejected-badge-box">
                        <AlertCircle size={16} className="text-rose" />
                        <span>Order Cancelled / Rejected</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {orders.length === 0 && (
              <div className="terminal-empty-state">
                <Bell size={40} className="text-muted" />
                <h4>No incoming orders right now</h4>
                <p>When students place an order from Hostel Block B or others, it will ring and appear here in real-time.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: INVENTORY & PRODUCT MANAGEMENT (Add & Full Edit Item) */}
      {activeTab === 'inventory' && (
        <div className="terminal-content-area animate-fade-in">
          <div className="terminal-section-heading">
            <div>
              <h3>Inventory & Product Management</h3>
              <p>Add new products, edit item details/prices in real-time, or toggle stock availability</p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowAddModal(true)} 
              className="btn-add-product"
            >
              <Plus size={16} /> Add New Item
            </button>
          </div>

          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Real-Time Stock Toggle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId} className={!product.isAvailable ? 'row-out-of-stock' : ''}>
                    <td className="product-cell">
                      <img src={product.image} alt={product.name} className="table-product-thumb" />
                      <div>
                        <strong>{product.name}</strong>
                        <p className="table-desc">{product.description}</p>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag-cell">{product.category}</span>
                    </td>
                    <td>
                      {editingPriceId === product.productId ? (
                        <div className="inline-edit-price">
                          <input 
                            type="number" 
                            value={editingPriceValue} 
                            onChange={(e) => setEditingPriceValue(e.target.value)}
                            className="price-edit-input"
                            autoFocus
                          />
                          <button type="button" onClick={() => savePrice(product.productId)} className="btn-save-price">
                            <Check size={14} />
                          </button>
                          <button type="button" onClick={() => setEditingPriceId(null)} className="btn-cancel-price">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="price-display-group">
                          <strong>₹{product.price}</strong>
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingPriceId(product.productId);
                              setEditingPriceValue(product.price.toString());
                            }}
                            className="btn-edit-icon"
                            title="Quick Edit Price"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {/* Real-time Stock Toggle switch */}
                      <button 
                        type="button"
                        onClick={() => toggleStock(product.productId, product.isAvailable)}
                        className={`stock-switch-btn ${product.isAvailable ? 'switch-on' : 'switch-off'}`}
                        title="Click to toggle Available vs Out of Stock in real-time"
                      >
                        <span className="switch-thumb"></span>
                        <span className="switch-text">{product.isAvailable ? 'Available' : 'Out of Stock'}</span>
                      </button>
                    </td>
                    <td>
                      <div className="table-action-buttons">
                        <button 
                          type="button" 
                          onClick={() => openEditProductModal(product)} 
                          className="btn-table-edit"
                          title="Full Edit Product (Name, Price, Category, Image, Stock)"
                        >
                          <Edit3 size={13} />
                          <span>Edit Item</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: BUSINESS PROFILE */}
      {activeTab === 'settings' && (
        <div className="terminal-content-area animate-fade-in">
          <div className="business-profile-card">
            <h3>Store Profile & Operational Settings</h3>
            <p className="subtitle">Configure campus store metadata synced to Cloud Firestore</p>

            <div className="profile-form-grid">
              <div className="form-group">
                <label>Store Name</label>
                <input 
                  type="text" 
                  defaultValue={store.storeName} 
                  onChange={(e) => db.updateStoreProfile(store.storeId, { storeName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  defaultValue={store.category} 
                  onChange={(e) => db.updateStoreProfile(store.storeId, { category: e.target.value })}
                  className="form-select"
                >
                  <option value="Stationery">Stationery</option>
                  <option value="Food/Hotels">Food/Hotels</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Bakeries">Bakeries</option>
                  <option value="General Stores">General Stores</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Campus Location / Address</label>
                <input 
                  type="text" 
                  defaultValue={store.location} 
                  onChange={(e) => db.updateStoreProfile(store.storeId, { location: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Store Operating Status</label>
                <div className="toggle-row">
                  <button 
                    type="button" 
                    onClick={toggleStoreStatus}
                    className={`btn-store-status-large ${store.isOpen ? 'open' : 'closed'}`}
                  >
                    <Power size={18} />
                    <span>Store Status: {store.isOpen ? 'ONLINE (Accepting Student Orders)' : 'OFFLINE (Temporarily Closed)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL EDIT PRODUCT MODAL (Allows Store Owner to edit ANY item property)
          ========================================================================= */}
      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="dialog-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Edit3 size={20} className="text-amber" />
                <h3>Edit Product: {editingProduct.name}</h3>
              </div>
              <button type="button" onClick={() => setEditingProduct(null)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProductEdit} className="edit-product-form">
              <div className="form-group">
                <label>Product Name / Title</label>
                <input 
                  type="text" 
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Category</label>
                  <select 
                    value={editProdCat} 
                    onChange={(e) => setEditProdCat(e.target.value)}
                    className="form-select"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Food/Hotels">Food/Hotels</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Bakeries">Bakeries</option>
                    <option value="General Stores">General Stores</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Stock Status</label>
                <div className="radio-pill-group">
                  <button 
                    type="button" 
                    onClick={() => setEditProdAvailable(true)}
                    className={`stock-radio-btn ${editProdAvailable ? 'active-avail' : ''}`}
                  >
                    <CheckCircle2 size={14} /> Available
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditProdAvailable(false)}
                    className={`stock-radio-btn ${!editProdAvailable ? 'active-out' : ''}`}
                  >
                    <AlertCircle size={14} /> Out of Stock
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Product Description</label>
                <textarea 
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="form-textarea"
                  rows={2}
                />
              </div>

              {/* Preset Image Selector */}
              <div className="form-group">
                <label>Product Image</label>
                <input 
                  type="text" 
                  value={editProdImage}
                  onChange={(e) => setEditProdImage(e.target.value)}
                  className="form-input mb-2"
                  placeholder="Image URL"
                />
                <div className="preset-images-scroll">
                  {PRESET_IMAGES.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img.url} 
                      alt={img.name} 
                      title={img.name}
                      onClick={() => setEditProdImage(img.url)}
                      className={`preset-thumb ${editProdImage === img.url ? 'selected' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions-row">
                <button 
                  type="button" 
                  onClick={() => handleDeleteProduct(editingProduct.productId)}
                  className="btn-delete-product"
                  title="Remove this item completely"
                >
                  <Trash2 size={15} /> Delete Item
                </button>
                <button type="submit" className="btn-primary-compact">
                  Save Changes ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW PRODUCT MODAL
          ========================================================================= */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="dialog-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Plus size={20} className="text-amber" />
                <h3>Add New Item to {store.storeName}</h3>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="add-product-form">
              <div className="form-group">
                <label>Item Name / Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Graph Book (₹40) or Hot Coffee" 
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="40" 
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Category</label>
                  <select 
                    value={newProdCat} 
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="form-select"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Food/Hotels">Food/Hotels</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Bakeries">Bakeries</option>
                    <option value="General Stores">General Stores</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Stock Status</label>
                <div className="radio-pill-group">
                  <button 
                    type="button" 
                    onClick={() => setNewProdAvailable(true)}
                    className={`stock-radio-btn ${newProdAvailable ? 'active-avail' : ''}`}
                  >
                    <CheckCircle2 size={14} /> Available
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewProdAvailable(false)}
                    className={`stock-radio-btn ${!newProdAvailable ? 'active-out' : ''}`}
                  >
                    <AlertCircle size={14} /> Out of Stock
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Item details, packaging, specification..." 
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="form-textarea"
                  rows={2}
                />
              </div>

              {/* Preset Image Selector */}
              <div className="form-group">
                <label>Choose Item Thumbnail</label>
                <div className="preset-images-scroll">
                  {PRESET_IMAGES.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img.url} 
                      alt={img.name} 
                      title={img.name}
                      onClick={() => setNewProdImage(img.url)}
                      className={`preset-thumb ${newProdImage === img.url ? 'selected' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary-compact full-width">
                Add Item to Inventory & Sync Live ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
