import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Check, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function OwnerInventory({ 
  products = [], 
  currentStore, 
  onUpdateStock, 
  onUpdatePrice, 
  onAddProduct 
}) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: currentStore?.category || 'Stationery',
    description: '',
    isAvailable: true,
    image: ''
  });

  // Filter products for this store
  const storeProducts = products.filter(p => !currentStore || p.storeId === currentStore.storeId);
  const filteredProducts = storeProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartEditPrice = (product) => {
    setEditingPriceId(product.productId);
    setTempPrice(product.price.toString());
  };

  const handleSavePrice = (productId) => {
    const val = parseFloat(tempPrice);
    if (!isNaN(val) && val >= 0) {
      onUpdatePrice(productId, val);
    }
    setEditingPriceId(null);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    onAddProduct({
      storeId: currentStore?.storeId || 'store_stationery_01',
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      description: newProduct.description,
      isAvailable: newProduct.isAvailable,
      image: newProduct.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80'
    });

    setNewProduct({
      name: '',
      price: '',
      category: currentStore?.category || 'Stationery',
      description: '',
      isAvailable: true,
      image: ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="owner-inventory-container">
      {/* Inventory Header */}
      <div className="inventory-header-row">
        <div>
          <h3>Product Catalog & Live Stock Control</h3>
          <p className="inventory-sub">
            Manage real-time availability and live pricing for <strong>{currentStore?.storeName || 'Campus Stationery Store'}</strong>
          </p>
        </div>

        <button 
          type="button" 
          className="btn-add-product"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Search and Quick Filters */}
      <div className="inventory-toolbar">
        <div className="inventory-search-wrap">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Filter products in inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="stock-count-pills">
          <span className="pill-stat in-stock">
            Available: {storeProducts.filter(p => p.isAvailable).length}
          </span>
          <span className="pill-stat out-of-stock">
            Out of Stock: {storeProducts.filter(p => !p.isAvailable).length}
          </span>
        </div>
      </div>

      {/* Products Table / Cards */}
      <div className="inventory-table-card">
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Real-time Stock Toggle</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const isEditingThisPrice = editingPriceId === product.productId;

                return (
                  <tr key={product.productId} className={!product.isAvailable ? 'row-out-of-stock' : ''}>
                    {/* Product Name & Thumb */}
                    <td className="product-col">
                      <div className="product-meta-cell">
                        <img src={product.image} alt={product.name} className="table-thumb" />
                        <div>
                          <div className="table-product-name">{product.name}</div>
                          <div className="table-product-desc">{product.description || 'No description'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="category-pill-table">{product.category}</span>
                    </td>

                    {/* Price with Real-time Inline Edit */}
                    <td className="price-col">
                      {isEditingThisPrice ? (
                        <div className="price-inline-editor">
                          <input 
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePrice(product.productId);
                              if (e.key === 'Escape') setEditingPriceId(null);
                            }}
                            autoFocus
                            className="inline-price-input"
                          />
                          <button 
                            type="button" 
                            className="btn-save-price" 
                            onClick={() => handleSavePrice(product.productId)}
                            title="Save Price"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="price-display-clickable"
                          onClick={() => handleStartEditPrice(product)}
                          title="Click to edit price in real-time"
                        >
                          <span className="price-text">₹{product.price}</span>
                          <Edit3 size={13} className="edit-icon-hint" />
                        </div>
                      )}
                    </td>

                    {/* Real-time Stock Toggle */}
                    <td>
                      <div className="stock-toggle-wrapper">
                        <button 
                          type="button"
                          className={`switch-toggle ${product.isAvailable ? 'switch-on' : 'switch-off'}`}
                          onClick={() => onUpdateStock(product.productId, !product.isAvailable)}
                          title={`Toggle stock for ${product.name}`}
                        >
                          <div className="switch-thumb"></div>
                        </button>
                        <span className="toggle-label-text">
                          {product.isAvailable ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      {product.isAvailable ? (
                        <span className="status-badge-table in-stock">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="status-badge-table out-of-stock">
                          <AlertCircle size={12} /> Out of Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content inventory-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-tag">INVENTORY MANAGER</span>
                <h3>Add New Product to Store</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="inventory-form">
              <div className="form-group">
                <label>Product Title / Name *</label>
                <input 
                  type="text" 
                  required 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Spiral Note Book 200 Pages"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. 75"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
                <label>Item Description</label>
                <textarea 
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Details, specifications or package size..."
                />
              </div>

              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={16} /> Save to Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
