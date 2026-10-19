import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChefHat, 
  Bike, 
  PackageCheck, 
  Sparkles, 
  Phone, 
  MapPin, 
  User, 
  ArrowRight,
  Filter,
  AlertTriangle
} from 'lucide-react';
import { soundManager } from '../../utils/audioAlert';

export default function OwnerOrders({ 
  orders = [], 
  currentStore, 
  onUpdateStatus, 
  onRejectOrder 
}) {
  const [filterTab, setFilterTab] = useState('active'); // 'active', 'delivered', 'all'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filter orders for this store
  const storeOrders = orders.filter(o => !currentStore || o.storeId === currentStore.storeId);

  const activeOrders = storeOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Rejected');
  const deliveredOrders = storeOrders.filter(o => o.status === 'Delivered');

  const displayedOrders = filterTab === 'active' 
    ? activeOrders 
    : filterTab === 'delivered' 
      ? deliveredOrders 
      : storeOrders;

  const handleToggleSound = () => {
    const enabled = soundManager.toggleSound();
    setSoundEnabled(enabled);
    if (enabled) {
      soundManager.playOrderAlert();
    }
  };

  const getNextStatusAction = (currentStatus) => {
    switch (currentStatus) {
      case 'Accepted':
        return { next: 'Preparing', label: 'Start Preparing 🍳', icon: ChefHat, color: 'blue' };
      case 'Preparing':
        return { next: 'Ready', label: 'Mark Ready for Pickup 📦', icon: PackageCheck, color: 'purple' };
      case 'Ready':
        return { next: 'Out for Delivery', label: 'Dispatch: Out for Delivery 🛵', icon: Bike, color: 'indigo' };
      case 'Out for Delivery':
        return { next: 'Delivered', label: 'Confirm Delivered ✔', icon: Sparkles, color: 'emerald' };
      default:
        return null;
    }
  };

  return (
    <div className="owner-orders-container">
      {/* Top Terminal Bar */}
      <div className="terminal-header-bar">
        <div className="terminal-title-col">
          <div className="terminal-live-tag">
            <span className="live-radar-dot"></span>
            <span>REAL-TIME ORDER DISPATCH TERMINAL</span>
          </div>
          <h3>Incoming Orders Live Feed</h3>
          <p className="terminal-subtitle">
            Firestore listener active for <strong>{currentStore?.storeName || 'Campus Stationery Store'}</strong>
          </p>
        </div>

        <div className="terminal-actions-right">
          <button 
            type="button" 
            className={`sound-toggle-btn ${soundEnabled ? 'sound-on' : 'sound-off'}`}
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Audio Chime ON' : 'Muted'}</span>
          </button>
          
          <button 
            type="button" 
            className="test-chime-btn"
            onClick={() => soundManager.playOrderAlert()}
            title="Test alert sound"
          >
            <Bell size={14} /> Test Bell
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Metrics */}
      <div className="orders-filter-row">
        <div className="orders-tab-group">
          <button 
            type="button" 
            className={`order-tab-btn ${filterTab === 'active' ? 'active' : ''}`}
            onClick={() => setFilterTab('active')}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button 
            type="button" 
            className={`order-tab-btn ${filterTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilterTab('delivered')}
          >
            Delivered ({deliveredOrders.length})
          </button>
          <button 
            type="button" 
            className={`order-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All ({storeOrders.length})
          </button>
        </div>

        <div className="quick-metric-pill">
          <span>Active Queue:</span>
          <strong>{activeOrders.length} orders</strong>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-feed-list">
        {displayedOrders.length === 0 ? (
          <div className="empty-orders-card">
            <div className="empty-icon">📭</div>
            <h4>No {filterTab} orders at this moment</h4>
            <p>New orders placed by students will automatically chime and appear here via Cloud Firestore.</p>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const nextAction = getNextStatusAction(order.status);
            const isNewPlaced = order.status === 'Placed';

            return (
              <div 
                key={order.orderId} 
                className={`order-terminal-card ${isNewPlaced ? 'new-incoming-alert' : ''} status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {/* Order Top Strip */}
                <div className="order-card-strip">
                  <div className="order-id-block">
                    <span className="order-id-badge">{order.displayId || order.orderId}</span>
                    {isNewPlaced && (
                      <span className="new-alert-pill">
                        <Bell size={12} className="alert-bell-anim" /> NEW ORDER
                      </span>
                    )}
                    <span className="order-time-sub">
                      {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="order-status-badge-wrap">
                    <span className={`status-tag status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Customer Details Strip */}
                <div className="customer-info-strip">
                  <div className="customer-detail-item">
                    <User size={14} className="icon-subtle" />
                    <span>Student: <strong>{order.studentName || 'Thejas Gowda'}</strong></span>
                  </div>
                  <div className="customer-detail-item">
                    <MapPin size={14} className="icon-subtle" />
                    <span>Hostel: <strong>{order.hostelBlock || 'Block B'}</strong> (Room {order.roomNumber || '204'})</span>
                  </div>
                  <div className="customer-detail-item">
                    <Phone size={14} className="icon-subtle" />
                    <span>{order.phone || '+91 98765 43210'}</span>
                  </div>
                </div>

                {/* Itemized Order List */}
                <div className="order-items-box">
                  <div className="items-box-title">Itemized List:</div>
                  <div className="items-table">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="item-terminal-row">
                        <div className="item-qty-name">
                          <span className="qty-tag">{item.qty}x</span>
                          <span className="name-tag">{item.name}</span>
                        </div>
                        <div className="item-line-price">
                          ₹{item.price * item.qty}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-total-bar">
                    <div className="payment-type-note">
                      Payment: <strong>{order.paymentMethod || 'COD'}</strong>
                    </div>
                    <div className="total-amount-display">
                      <span>Total Amount:</span>
                      <strong className="grand-val">₹{order.totalAmount}</strong>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="order-terminal-actions">
                  {isNewPlaced ? (
                    /* Placed State Actions: Accept or Reject */
                    <div className="action-buttons-split">
                      <button 
                        type="button" 
                        className="btn-reject"
                        onClick={() => onRejectOrder(order.orderId)}
                      >
                        <XCircle size={16} /> Reject Order
                      </button>
                      <button 
                        type="button" 
                        className="btn-accept"
                        onClick={() => onUpdateStatus(order.orderId, 'Accepted')}
                      >
                        <CheckCircle size={16} /> Accept Order
                      </button>
                    </div>
                  ) : order.status === 'Delivered' ? (
                    <div className="delivered-done-msg">
                      <CheckCircle size={16} color="#10b981" />
                      <span>Order Completed & Delivered at {order.hostelBlock}</span>
                    </div>
                  ) : order.status === 'Rejected' ? (
                    <div className="rejected-msg">
                      <AlertTriangle size={16} color="#ef4444" />
                      <span>Order Rejected by Store</span>
                    </div>
                  ) : (
                    /* In-Progress State Transition Controls */
                    <div className="status-transition-panel">
                      <div className="transition-hint">
                        <span>Advance Order Pipeline:</span>
                      </div>
                      <div className="transition-buttons-row">
                        {nextAction && (
                          <button 
                            type="button" 
                            className={`btn-advance btn-${nextAction.color}`}
                            onClick={() => onUpdateStatus(order.orderId, nextAction.next)}
                          >
                            <nextAction.icon size={16} />
                            <span>{nextAction.label}</span>
                          </button>
                        )}

                        {/* Direct Stage Selectors for instant demonstration flexibility */}
                        <div className="direct-stage-selector">
                          <span className="direct-label">Or jump to:</span>
                          {['Preparing', 'Ready', 'Out for Delivery', 'Delivered'].map(st => (
                            <button
                              key={st}
                              type="button"
                              className={`direct-btn ${order.status === st ? 'current' : ''}`}
                              disabled={order.status === st}
                              onClick={() => onUpdateStatus(order.orderId, st)}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
