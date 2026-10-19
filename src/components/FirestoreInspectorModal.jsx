import React, { useState } from 'react';
import { Database, X, Copy, Check, Layers, Code, RefreshCw } from 'lucide-react';

export default function FirestoreInspectorModal({ isOpen, onClose, dbState, db }) {
  const [activeCollection, setActiveCollection] = useState('orders');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const collections = [
    { id: 'orders', name: 'orders Collection', count: dbState.orders.length, data: dbState.orders },
    { id: 'products', name: 'products Collection', count: dbState.products.length, data: dbState.products },
    { id: 'stores', name: 'stores Collection', count: dbState.stores.length, data: dbState.stores },
    { id: 'users', name: 'users Collection', count: dbState.users.length, data: dbState.users },
  ];

  const currentCol = collections.find(c => c.id === activeCollection) || collections[0];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(currentCol.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="firestore-inspector-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Database size={22} className="text-amber" />
            <div>
              <h3>Cloud Firestore Database Schema & Live State</h3>
              <p className="modal-sub">Real-time reactive state reflecting collections: users, stores, products, orders</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Collection Selector Tabs */}
        <div className="inspector-tabs">
          {collections.map((col) => (
            <button
              type="button"
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              className={`inspector-tab-btn ${activeCollection === col.id ? 'active' : ''}`}
            >
              <Layers size={15} />
              <span>{col.name}</span>
              <span className="count-pill-tab">{col.count}</span>
            </button>
          ))}
        </div>

        {/* Schema Specification Reference */}
        <div className="schema-reference-bar">
          <Code size={14} className="text-muted" />
          <span className="schema-label">Firestore Schema Fields:</span>
          {activeCollection === 'users' && <code>userId, name, phone, hostelBlock, roomNumber</code>}
          {activeCollection === 'stores' && <code>storeId, storeName, category, location, ownerId, isOpen</code>}
          {activeCollection === 'products' && <code>productId, storeId, name, price, isAvailable (boolean), category</code>}
          {activeCollection === 'orders' && <code>orderId, userId, storeId, items (array of items with name, price, qty), totalAmount, status, timestamp</code>}
        </div>

        {/* JSON Viewer */}
        <div className="json-viewer-container">
          <div className="viewer-toolbar">
            <span>Documents snapshot ({currentCol.count} records)</span>
            <button type="button" onClick={copyToClipboard} className="btn-copy-json">
              {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="json-code-block">
            {JSON.stringify(currentCol.data, null, 2)}
          </pre>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={() => db.resetToDemo()} className="btn-secondary-compact">
            <RefreshCw size={14} /> Reset Collections to Demo
          </button>
          <button type="button" onClick={onClose} className="btn-primary-compact">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
