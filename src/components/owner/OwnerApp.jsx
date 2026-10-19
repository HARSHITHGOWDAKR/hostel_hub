import React, { useState, useEffect } from 'react';
import OwnerOrders from './OwnerOrders';
import OwnerInventory from './OwnerInventory';
import OwnerProfile from './OwnerProfile';
import { db } from '../../firebase/database';
import { 
  Store, 
  ShoppingBag, 
  Layers, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Bell, 
  Settings, 
  Power,
  ChevronDown
} from 'lucide-react';

export default function OwnerApp({ 
  highlightOrderId = null 
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'inventory', 'profile'
  const [stores, setStores] = useState(() => db.getStores());
  const [currentStoreId, setCurrentStoreId] = useState('store_stationery_01');
  const [orders, setOrders] = useState(() => db.getOrders());
  const [products, setProducts] = useState(() => db.products);

  // Subscribe to real-time Firestore database
  useEffect(() => {
    const unsubscribe = db.subscribe(({ type, payload, state }) => {
      setStores(state.stores);
      setProducts(state.products);
      setOrders(state.orders);
    });

    return () => unsubscribe();
  }, []);

  const currentStore = stores.find(s => s.storeId === currentStoreId) || stores[0];
  const storeOrders = orders.filter(o => o.storeId === currentStore?.storeId);
  const pendingOrdersCount = storeOrders.filter(o => o.status === 'Placed').length;
  const inProgressCount = storeOrders.filter(o => ['Accepted', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.status)).length;
  const totalRevenue = storeOrders.reduce((sum, o) => sum + (o.status !== 'Rejected' ? o.totalAmount : 0), 0);

  // Handlers for Firestore updates
  const handleUpdateStatus = (orderId, newStatus) => {
    db.updateOrderStatus(orderId, newStatus);
  };

  const handleRejectOrder = (orderId) => {
    db.rejectOrder(orderId);
  };

  const handleUpdateStock = (productId, isAvailable) => {
    db.updateProductStock(productId, isAvailable);
  };

  const handleUpdatePrice = (productId, newPrice) => {
    db.updateProductPrice(productId, newPrice);
  };

  const handleAddProduct = (productData) => {
    db.addProduct(productData);
  };

  const handleUpdateProfile = (profileData) => {
    db.updateStoreProfile(currentStore.storeId, profileData);
  };

  const handleToggleStoreStatus = (storeId, isOpen) => {
    db.updateStoreStatus(storeId, isOpen);
  };

  return (
    <div className="owner-app-root">
      {/* Top POS Terminal Navigation Bar */}
      <div className="owner-top-nav">
        <div className="nav-brand-section">
          <div className="brand-icon-box">
            <Store size={20} />
          </div>
          <div className="brand-text-col">
            <div className="brand-app-title">STORE OWNER DISPATCH TERMINAL</div>
            <div className="store-selector-dropdown">
              <select 
                value={currentStoreId} 
                onChange={(e) => setCurrentStoreId(e.target.value)}
                className="store-select-native"
              >
                {stores.map(s => (
                  <option key={s.storeId} value={s.storeId}>
                    {s.storeName} ({s.category})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Quick Metrics */}
        <div className="owner-nav-metrics">
          <div className="metric-box">
            <span className="metric-sub">New Orders</span>
            <div className="metric-val-row">
              <span className={`metric-count ${pendingOrdersCount > 0 ? 'badge-pulsing' : ''}`}>
                {pendingOrdersCount}
              </span>
              {pendingOrdersCount > 0 && <span className="pending-indicator">Action Required</span>}
            </div>
          </div>

          <div className="metric-box">
            <span className="metric-sub">In Pipeline</span>
            <span className="metric-count count-blue">{inProgressCount}</span>
          </div>

          <div className="metric-box">
            <span className="metric-sub">Today's Total</span>
            <span className="metric-count count-green">₹{totalRevenue}</span>
          </div>

          <div className="metric-box status-metric-box">
            <span className="metric-sub">Store Status</span>
            <span className={`store-status-pill ${currentStore?.isOpen ? 'open' : 'closed'}`}>
              {currentStore?.isOpen ? '● ONLINE' : '○ OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal View Switcher Tabs */}
      <div className="owner-terminal-tabs">
        <button 
          type="button" 
          className={`terminal-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Bell size={16} />
          <span>Orders Terminal</span>
          {pendingOrdersCount > 0 && (
            <span className="tab-alert-badge">{pendingOrdersCount}</span>
          )}
        </button>

        <button 
          type="button" 
          className={`terminal-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Layers size={16} />
          <span>Inventory & Live Stock</span>
        </button>

        <button 
          type="button" 
          className={`terminal-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Settings size={16} />
          <span>Store Profile & Operations</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div className="owner-main-body">
        {activeTab === 'orders' && (
          <OwnerOrders 
            orders={orders}
            currentStore={currentStore}
            onUpdateStatus={handleUpdateStatus}
            onRejectOrder={handleRejectOrder}
          />
        )}

        {activeTab === 'inventory' && (
          <OwnerInventory 
            products={products}
            currentStore={currentStore}
            onUpdateStock={handleUpdateStock}
            onUpdatePrice={handleUpdatePrice}
            onAddProduct={handleAddProduct}
          />
        )}

        {activeTab === 'profile' && (
          <OwnerProfile 
            currentStore={currentStore}
            onUpdateProfile={handleUpdateProfile}
            onToggleStoreStatus={handleToggleStoreStatus}
          />
        )}
      </div>
    </div>
  );
}
