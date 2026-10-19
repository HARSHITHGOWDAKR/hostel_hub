import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart = [], 
  store, 
  currentUser, 
  onUpdateQty, 
  onClearCart, 
  onOrderPlaced 
}) {
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'GateUPI'
  const [gateLocation, setGateLocation] = useState('Hostel Main Security Gate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Subtotal calculation
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = 0; // Free campus delivery promo
  const packagingFee = 0;
  const grandTotal = subtotal + deliveryFee + packagingFee;

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Fire celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const orderData = {
        userId: currentUser?.userId || 'user_thejas_01',
        studentName: currentUser?.name || 'Thejas Gowda',
        phone: currentUser?.phone || '+91 98765 43210',
        hostelBlock: currentUser?.hostelBlock || 'Block B',
        roomNumber: currentUser?.roomNumber || '204',
        storeId: store?.storeId || 'store_stationery_01',
        items: cart.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty
        })),
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Pay at Gate (UPI)',
        deliveryGate: gateLocation
      };

      // Call parent handler which writes document to Cloud Firestore
      await onOrderPlaced(orderData);
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      console.error('Error placing order:', e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cart-drawer-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} className="cart-header-icon" />
            <div>
              <h3>Your Campus Cart</h3>
              <p className="cart-store-sub">Ordering from {store?.storeName || 'Campus Store'}</p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <div className="empty-cart-icon">🛒</div>
            <h4>Your cart is empty</h4>
            <p>Add stationery, lab records or snacks from the store catalog to continue.</p>
            <button type="button" className="btn-primary" onClick={onClose}>
              Browse Store Items
            </button>
          </div>
        ) : (
          <div className="cart-drawer-body">
            {/* Cart Items List */}
            <div className="cart-items-section">
              <div className="cart-section-title">
                <span>Items Selected ({cart.reduce((a, b) => a + b.qty, 0)})</span>
                <button type="button" className="clear-cart-link" onClick={onClearCart}>
                  Clear All
                </button>
              </div>

              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.productId} className="cart-item-row">
                    <img src={item.image} alt={item.name} className="cart-item-thumb" />
                    <div className="cart-item-details">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-unit-price">₹{item.price} each</div>
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-qty-pill">
                        <button 
                          type="button" 
                          onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{item.qty}</span>
                        <button 
                          type="button" 
                          onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className="cart-item-total">
                        ₹{item.price * item.qty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Location / Hostel Gate Selector */}
            <div className="cart-delivery-section">
              <div className="cart-section-title">
                <span><MapPin size={15} /> Delivery Location / Hostel Gate</span>
              </div>
              <div className="hostel-badge-preview">
                <div className="hostel-preview-left">
                  <Building size={16} />
                  <div>
                    <strong>{currentUser?.hostelBlock || 'Block B'}</strong>
                    <span className="hostel-room-label">Room {currentUser?.roomNumber || '204'}</span>
                  </div>
                </div>
              </div>

              <div className="gate-options-group">
                <label className="gate-label">Drop-off Point:</label>
                <select 
                  value={gateLocation} 
                  onChange={(e) => setGateLocation(e.target.value)}
                  className="gate-select-input"
                >
                  <option value="Hostel Main Security Gate">Hostel Main Security Gate</option>
                  <option value="Hostel Porch / Bicycle Stand">Hostel Porch / Bicycle Stand</option>
                  <option value="Direct Room Delivery (Room 204)">Direct Room Delivery (Room 204)</option>
                  <option value="Hostel Common Room">Hostel Common Room Ground Floor</option>
                </select>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="cart-payment-section">
              <div className="cart-section-title">
                <span>Payment Method</span>
              </div>
              <div className="payment-options-grid">
                <div 
                  className={`payment-option-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="payment-radio-circle">
                    {paymentMethod === 'COD' && <div className="inner-dot"></div>}
                  </div>
                  <Banknote size={20} className="payment-icon" />
                  <div className="payment-texts">
                    <div className="payment-name">Cash on Delivery (COD)</div>
                    <div className="payment-desc">Pay cash when courier arrives</div>
                  </div>
                </div>

                <div 
                  className={`payment-option-card ${paymentMethod === 'GateUPI' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('GateUPI')}
                >
                  <div className="payment-radio-circle">
                    {paymentMethod === 'GateUPI' && <div className="inner-dot"></div>}
                  </div>
                  <CreditCard size={20} className="payment-icon" />
                  <div className="payment-texts">
                    <div className="payment-name">Pay at Gate (UPI / QR)</div>
                    <div className="payment-desc">Scan GPay/PhonePe at delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="cart-bill-section">
              <div className="bill-row">
                <span>Item Total</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-row">
                <span>Campus Delivery Fee</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="bill-row">
                <span>Platform Fee</span>
                <span className="free-tag">₹0</span>
              </div>
              <div className="bill-divider"></div>
              <div className="bill-row grand-total-row">
                <span>To Pay (Grand Total)</span>
                <span className="grand-price">₹{grandTotal}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <div className="cart-drawer-footer">
              <div className="order-cta-summary">
                <span className="total-label">Grand Total:</span>
                <span className="total-val">₹{grandTotal}</span>
              </div>
              <button 
                type="button" 
                className="place-order-btn"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
              >
                {isSubmitting ? (
                  <span>Writing to Cloud Firestore...</span>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
