import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Search, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';

export default function StoreDetails({ 
  store, 
  products = [], 
  cart = [], 
  onAddToCart, 
  onUpdateCartQty, 
  onBack, 
  onOpenCart 
}) {
  const [productSearch, setProductSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Filter products for this store
  const storeProducts = products.filter(p => p.storeId === store.storeId);

  const filteredProducts = storeProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesTab = activeTab === 'All' || 
                       (activeTab === 'In Stock' && p.isAvailable) ||
                       (activeTab === 'Out of Stock' && !p.isAvailable);
    return matchesSearch && matchesTab;
  });

  // Calculate cart summary
  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartAmount = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const getItemCartQty = (productId) => {
    const item = cart.find(c => c.productId === productId);
    return item ? item.qty : 0;
  };

  return (
    <div className="store-details-container">
      {/* Top Navigation */}
      <div className="store-nav-header">
        <button type="button" className="nav-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Back to Stores</span>
        </button>
        <div className="nav-store-title">{store.storeName}</div>
        <button type="button" className="nav-cart-trigger" onClick={onOpenCart}>
          <ShoppingBag size={18} />
          {totalCartCount > 0 && <span className="cart-badge-dot">{totalCartCount}</span>}
        </button>
      </div>

      {/* Store Hero Banner */}
      <div className="store-hero-card">
        <div className="store-hero-image-wrap">
          <img src={store.banner} alt={store.storeName} className="store-hero-img" />
          <div className="store-hero-gradient"></div>
        </div>
        <div className="store-hero-content">
          <div className="store-hero-badge-row">
            <span className={`status-pill ${store.isOpen ? 'open' : 'closed'}`}>
              {store.isOpen ? '● OPEN FOR DELIVERY' : '○ CURRENTLY CLOSED'}
            </span>
            <span className="category-pill-hero">{store.category}</span>
          </div>
          <h2>{store.storeName}</h2>
          <div className="store-meta-pills">
            <span className="pill-item"><Star size={13} fill="#f59e0b" color="#f59e0b" /> {store.rating} ({store.reviewsCount}+ ratings)</span>
            <span className="pill-item"><Clock size={13} /> {store.deliveryTime}</span>
            <span className="pill-item"><MapPin size={13} /> {store.location}</span>
          </div>
        </div>
      </div>

      {/* In-store Search & Filters */}
      <div className="store-filter-bar">
        <div className="store-search-input">
          <Search size={16} />
          <input 
            type="text" 
            placeholder={`Search items in ${store.storeName}...`}
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>
        <div className="store-filter-chips">
          {['All', 'In Stock', 'Out of Stock'].map(tab => (
            <button 
              key={tab}
              type="button" 
              className={`filter-chip ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Products Catalog */}
      <div className="products-list-section">
        <div className="products-section-header">
          <h3>Store Inventory ({filteredProducts.length} items)</h3>
          <span className="live-sync-indicator">
            <Sparkles size={13} /> Live Stock Indicators
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-products-msg">
            <p>No products match your current search.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const cartQty = getItemCartQty(product.productId);
              const isAvailable = product.isAvailable;
              const stockStatusText = product.stockStatus || (isAvailable ? 'Available' : 'Out of Stock');

              return (
                <div 
                  key={product.productId} 
                  className={`product-card ${!isAvailable ? 'product-out-of-stock' : ''}`}
                >
                  <div className="product-image-wrap">
                    <img src={product.image} alt={product.name} className="product-img" />
                    {/* Real-time Stock Indicator Badge */}
                    <div className="stock-indicator-badge">
                      {isAvailable ? (
                        <span className="stock-available">
                          <CheckCircle2 size={12} /> Available
                        </span>
                      ) : (
                        <span className="stock-unavailable">
                          <XCircle size={12} /> Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="product-details">
                    <div className="product-title-row">
                      <h4 className="product-name">{product.name}</h4>
                      <div className="product-price">₹{product.price}</div>
                    </div>
                    {product.description && (
                      <p className="product-desc">{product.description}</p>
                    )}

                    <div className="product-action-row">
                      <span className="product-category-sub">{product.category}</span>

                      {/* Add to Cart or Quantity Controls */}
                      {isAvailable ? (
                        cartQty > 0 ? (
                          <div className="cart-qty-control">
                            <button 
                              type="button" 
                              className="qty-btn"
                              onClick={() => onUpdateCartQty(product.productId, cartQty - 1)}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-number">{cartQty}</span>
                            <button 
                              type="button" 
                              className="qty-btn"
                              onClick={() => onUpdateCartQty(product.productId, cartQty + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            className="add-to-cart-btn"
                            onClick={() => onAddToCart(product)}
                          >
                            <Plus size={14} /> Add
                          </button>
                        )
                      ) : (
                        /* Disabled Add to Cart button for Out of Stock items */
                        <button 
                          type="button" 
                          className="add-to-cart-btn disabled"
                          disabled
                          title="Item is currently out of stock"
                        >
                          Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="floating-cart-bar" onClick={onOpenCart}>
          <div className="cart-bar-left">
            <div className="cart-items-count">
              <span>{totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}</span>
              <span className="bullet">|</span>
              <span className="cart-total-price">₹{totalCartAmount}</span>
            </div>
            <div className="cart-store-name">From {store.storeName}</div>
          </div>
          <button type="button" className="cart-bar-btn">
            View Cart & Checkout <ShoppingBag size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
