import React, { useState, useEffect } from 'react';
import HomeScreen from './HomeScreen';
import StoreDetails from './StoreDetails';
import CartDrawer from './CartDrawer';
import OrderTrackingScreen from './OrderTrackingScreen';
import StudentAuthModal from './StudentAuthModal';
import HostelSelectorModal from './HostelSelectorModal';
import { db } from '../../firebase/database';
import { Home, ShoppingBag, Clock, User, Compass } from 'lucide-react';

export default function StudentApp({ 
  onOrderPlacedExternally,
  forceTrackOrderId = null 
}) {
  const [currentUser, setCurrentUser] = useState(() => db.getUser('user_thejas_01'));
  const [stores, setStores] = useState(() => db.getStores());
  const [products, setProducts] = useState(() => db.products);
  const [selectedHostel, setSelectedHostel] = useState('Block B');
  const [selectedStore, setSelectedStore] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeScreen, setActiveScreen] = useState('home'); // 'home', 'store', 'tracking'
  const [trackedOrder, setTrackedOrder] = useState(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Real-time Firestore Subscription
  useEffect(() => {
    const unsubscribe = db.subscribe(({ type, payload, state }) => {
      setStores(state.stores);
      setProducts(state.products);
      
      // If we are currently tracking an order, keep it updated in real-time!
      if (trackedOrder) {
        const updated = state.orders.find(o => o.orderId === trackedOrder.orderId);
        if (updated) {
          setTrackedOrder(updated);
        }
      }
    });

    return () => unsubscribe();
  }, [trackedOrder]);

  // Handle external track order request
  useEffect(() => {
    if (forceTrackOrderId) {
      const ord = db.getOrder(forceTrackOrderId);
      if (ord) {
        setTrackedOrder(ord);
        setActiveScreen('tracking');
      }
    }
  }, [forceTrackOrderId]);

  // Cart operations
  const handleAddToCart = (product) => {
    if (!product.isAvailable) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.productId);
      if (existing) {
        return prev.map(item => 
          item.productId === product.productId 
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleUpdateCartQty = (productId, newQty) => {
    setCart(prev => {
      if (newQty <= 0) {
        return prev.filter(item => item.productId !== productId);
      }
      return prev.map(item => 
        item.productId === productId ? { ...item, qty: newQty } : item
      );
    });
  };

  const handleClearCart = () => setCart([]);

  // Place Order handler (writes to Firestore)
  const handleOrderPlaced = (orderData) => {
    const newOrder = db.placeOrder(orderData);
    setCart([]);
    setTrackedOrder(newOrder);
    setActiveScreen('tracking');
    if (onOrderPlacedExternally) {
      onOrderPlacedExternally(newOrder);
    }
  };

  const handleSaveProfile = (profileData) => {
    const updated = db.updateUser(currentUser.userId, profileData);
    setCurrentUser(updated);
    if (profileData.hostelBlock) {
      setSelectedHostel(profileData.hostelBlock);
    }
  };

  return (
    <div className="student-app-root">
      {/* Dynamic Screen View */}
      <div className="student-screen-content">
        {activeScreen === 'home' && (
          <HomeScreen 
            stores={stores}
            selectedHostel={selectedHostel}
            currentUser={currentUser}
            onSelectStore={(store) => {
              setSelectedStore(store);
              setActiveScreen('store');
            }}
            onOpenLocationSelector={() => setShowHostelModal(true)}
            onOpenProfile={() => setShowAuthModal(true)}
          />
        )}

        {activeScreen === 'store' && selectedStore && (
          <StoreDetails 
            store={selectedStore}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onBack={() => setActiveScreen('home')}
            onOpenCart={() => setShowCartDrawer(true)}
          />
        )}

        {activeScreen === 'tracking' && trackedOrder && (
          <OrderTrackingScreen 
            order={trackedOrder}
            onBackToHome={() => setActiveScreen('home')}
          />
        )}
      </div>

      {/* Student App Bottom Navigation Bar */}
      <div className="student-bottom-nav">
        <button 
          type="button" 
          className={`nav-tab-btn ${activeScreen === 'home' ? 'active' : ''}`}
          onClick={() => setActiveScreen('home')}
        >
          <Home size={19} />
          <span>Stores</span>
        </button>

        <button 
          type="button" 
          className={`nav-tab-btn ${showHostelModal ? 'active' : ''}`}
          onClick={() => setShowHostelModal(true)}
        >
          <Compass size={19} />
          <span>Hostel</span>
        </button>

        <button 
          type="button" 
          className="nav-tab-btn cart-nav-btn"
          onClick={() => setShowCartDrawer(true)}
        >
          <div className="nav-cart-icon-wrap">
            <ShoppingBag size={19} />
            {cart.length > 0 && (
              <span className="nav-cart-badge">{cart.reduce((a, b) => a + b.qty, 0)}</span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {trackedOrder && (
          <button 
            type="button" 
            className={`nav-tab-btn ${activeScreen === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveScreen('tracking')}
          >
            <Clock size={19} />
            <span>Track</span>
          </button>
        )}

        <button 
          type="button" 
          className="nav-tab-btn"
          onClick={() => setShowAuthModal(true)}
        >
          <User size={19} />
          <span>Profile</span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <CartDrawer 
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        cart={cart}
        store={selectedStore || stores[0]}
        currentUser={currentUser}
        onUpdateQty={handleUpdateCartQty}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
      />

      <StudentAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
      />

      <HostelSelectorModal 
        isOpen={showHostelModal}
        onClose={() => setShowHostelModal(false)}
        selectedHostel={selectedHostel}
        onSelectHostel={(h) => {
          setSelectedHostel(h);
          handleSaveProfile({ ...currentUser, hostelBlock: h });
        }}
      />
    </div>
  );
}
