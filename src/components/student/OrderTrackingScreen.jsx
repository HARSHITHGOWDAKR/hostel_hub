import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  PackageCheck, 
  Bike, 
  MapPin, 
  Phone, 
  Receipt, 
  Share2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import CampusDeliveryMap from '../map/CampusDeliveryMap';
import confetti from 'canvas-confetti';

const STEPS = [
  { id: 'Placed', label: 'Order Placed', desc: 'Sent to store', icon: Clock },
  { id: 'Accepted', label: 'Accepted', desc: 'Store confirmed order', icon: CheckCircle2 },
  { id: 'Preparing', label: 'Preparing', desc: 'Packing your stationery', icon: ChefHat },
  { id: 'Ready', label: 'Ready for Pickup', desc: 'Awaiting runner', icon: PackageCheck },
  { id: 'Out for Delivery', label: 'Out for Delivery', desc: 'Scooter en route', icon: Bike },
  { id: 'Delivered', label: 'Delivered', desc: 'Enjoy your items!', icon: Sparkles }
];

export default function OrderTrackingScreen({ 
  order, 
  onBackToHome 
}) {
  const [hasFiredDeliveredConfetti, setHasFiredDeliveredConfetti] = useState(false);

  // Status index
  const getStepIndex = (status) => {
    switch (status) {
      case 'Placed': return 0;
      case 'Accepted': return 1;
      case 'Preparing': return 2;
      case 'Ready': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order?.status || 'Placed');

  // Trigger celebratory confetti upon delivery
  useEffect(() => {
    if (order?.status === 'Delivered' && !hasFiredDeliveredConfetti) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
      setHasFiredDeliveredConfetti(true);
    }
  }, [order?.status, hasFiredDeliveredConfetti]);

  if (!order) {
    return (
      <div className="order-tracking-empty">
        <p>No active order selected.</p>
        <button type="button" className="btn-primary" onClick={onBackToHome}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      {/* Top Header */}
      <div className="tracking-top-bar">
        <button type="button" className="nav-back-btn" onClick={onBackToHome}>
          <ArrowLeft size={18} />
          <span>Campus Home</span>
        </button>
        <div className="tracking-order-title">
          <span className="order-num-tag">{order.displayId || order.orderId}</span>
          <span className="live-realtime-badge">
            <span className="dot-pulse"></span> Live Firestore Sync
          </span>
        </div>
      </div>

      {/* Main Status Hero Card */}
      <div className={`tracking-hero-status-card status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="status-hero-left">
          <span className="status-hero-sub">CURRENT ORDER STATUS</span>
          <h2 className="status-hero-title">{order.status}</h2>
          <p className="status-hero-desc">
            {order.status === 'Placed' && 'Your order has been written to Cloud Firestore and waiting for store acceptance.'}
            {order.status === 'Accepted' && 'Store owner accepted your order and began order allocation.'}
            {order.status === 'Preparing' && 'Store is gathering and packaging your requested items.'}
            {order.status === 'Ready' && 'Parcel is packed and ready for campus delivery partner pickup.'}
            {order.status === 'Out for Delivery' && `Rider is on the way to ${order.hostelBlock || 'Block B'}! Meet at security gate.`}
            {order.status === 'Delivered' && `Order successfully handed over at ${order.hostelBlock || 'Block B'}!`}
          </p>
        </div>
        <div className="status-hero-right">
          <div className="hero-status-icon-bubble">
            {order.status === 'Delivered' ? '🎉' : order.status === 'Out for Delivery' ? '🛵' : '📦'}
          </div>
        </div>
      </div>

      {/* Step-by-Step Visual Progress Stepper */}
      <div className="tracking-stepper-card">
        <h4 className="stepper-title">Visual Order Progress Tracker</h4>
        <div className="stepper-track-wrap">
          <div className="stepper-line-bg">
            <div 
              className="stepper-line-fill" 
              style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
            ></div>
          </div>

          <div className="stepper-steps-row">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isPending = idx > currentStepIdx;
              const Icon = step.icon;

              return (
                <div 
                  key={step.id} 
                  className={`stepper-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
                >
                  <div className="node-icon-circle">
                    <Icon size={14} />
                  </div>
                  <div className="node-text-col">
                    <span className="node-label">{step.label}</span>
                    <span className="node-desc">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulated Google Maps Component */}
      <div className="tracking-map-section">
        <div className="map-section-header">
          <h4>Campus Delivery Navigation (Simulated Map)</h4>
          <span className="map-status-pill">
            <Bike size={13} /> {order.status === 'Delivered' ? 'Arrived' : 'Real-time GPS'}
          </span>
        </div>
        <CampusDeliveryMap 
          orderStatus={order.status}
          hostelBlock={order.hostelBlock || 'Block B'}
          roomNumber={order.roomNumber || '204'}
          storeName={order.storeName || 'Campus Stationery Store'}
        />
      </div>

      {/* Order Item Details Card */}
      <div className="tracking-details-card">
        <div className="details-card-header">
          <div className="store-info-row">
            <ShoppingBag size={16} />
            <strong>{order.storeName}</strong>
          </div>
          <span className="payment-tag-badge">{order.paymentMethod || 'COD'}</span>
        </div>

        <div className="itemized-list">
          {order.items?.map((item, idx) => (
            <div key={idx} className="item-row">
              <div className="item-info">
                <span className="item-qty-tag">{item.qty}x</span>
                <span className="item-title">{item.name}</span>
              </div>
              <span className="item-subtotal">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        <div className="card-divider"></div>

        <div className="order-total-row">
          <span>Total Amount</span>
          <span className="total-highlight">₹{order.totalAmount}</span>
        </div>

        <div className="destination-info-box">
          <div className="dest-row">
            <MapPin size={15} />
            <span>Delivery To: <strong>{order.hostelBlock}</strong>, Room <strong>{order.roomNumber}</strong></span>
          </div>
          <div className="dest-row student-row">
            <span>Student: <strong>{order.studentName}</strong> ({order.phone})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
