import { 
  INITIAL_USERS, 
  INITIAL_STORES, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS,
  ORDER_STATUS_FLOW 
} from '../utils/mockData';
import { soundManager } from '../utils/audioAlert';

// Cross-tab and dual-panel real-time communication channel
const CHANNEL_NAME = 'hostel_delivery_firestore_sync';
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

// In-memory / LocalStorage reactive store simulating Firestore collections
class ReactiveFirestore {
  constructor() {
    this.subscribers = new Set();
    this.nextOrderNumber = 1001; // Demonstration requirement: "Order #1001 for ₹90"
    this.loadState();
    this.setupListeners();
  }

  loadState() {
    try {
      const storedUsers = localStorage.getItem('fs_users');
      const storedStores = localStorage.getItem('fs_stores');
      const storedProducts = localStorage.getItem('fs_products');
      const storedOrders = localStorage.getItem('fs_orders');
      const storedOrderSeq = localStorage.getItem('fs_order_seq');

      this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS];
      this.stores = storedStores ? JSON.parse(storedStores) : [...INITIAL_STORES];
      this.products = storedProducts ? JSON.parse(storedProducts) : [...INITIAL_PRODUCTS];
      this.orders = storedOrders ? JSON.parse(storedOrders) : [...INITIAL_ORDERS];
      this.nextOrderNumber = storedOrderSeq ? parseInt(storedOrderSeq, 10) : 1001;
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      this.users = [...INITIAL_USERS];
      this.stores = [...INITIAL_STORES];
      this.products = [...INITIAL_PRODUCTS];
      this.orders = [...INITIAL_ORDERS];
      this.nextOrderNumber = 1001;
    }
  }

  persist() {
    try {
      localStorage.setItem('fs_users', JSON.stringify(this.users));
      localStorage.setItem('fs_stores', JSON.stringify(this.stores));
      localStorage.setItem('fs_products', JSON.stringify(this.products));
      localStorage.setItem('fs_orders', JSON.stringify(this.orders));
      localStorage.setItem('fs_order_seq', this.nextOrderNumber.toString());
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  setupListeners() {
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data;
        this.loadState();
        this.notifyAll(type, payload, false);
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('fs_')) {
          this.loadState();
          this.notifyAll('storage_update', null, false);
        }
      });
    }
  }

  notifyAll(type, payload, broadcast = true) {
    this.subscribers.forEach((callback) => {
      try {
        callback({ type, payload, state: this.getState() });
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });

    if (broadcast && broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type, payload });
      } catch (err) {
        console.warn('Broadcast error:', err);
      }
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    // Immediate callback with current snapshot
    callback({ type: 'init', payload: null, state: this.getState() });
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getState() {
    return {
      users: [...this.users],
      stores: [...this.stores],
      products: [...this.products],
      orders: [...this.orders]
    };
  }

  resetToDemo() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.stores = JSON.parse(JSON.stringify(INITIAL_STORES));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.nextOrderNumber = 1001;
    this.persist();
    this.notifyAll('reset', null);
  }

  // --- FIRESTORE USERS COLLECTION ---
  getUser(userId) {
    return this.users.find((u) => u.userId === userId) || this.users[0];
  }

  updateUser(userId, data) {
    const idx = this.users.findIndex((u) => u.userId === userId);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...data };
    } else {
      this.users.push({ userId, ...data });
    }
    this.persist();
    this.notifyAll('user_updated', { userId, data });
    return this.getUser(userId);
  }

  // --- FIRESTORE STORES COLLECTION ---
  getStores(category = null, hostelBlock = null) {
    let list = this.stores;
    if (category && category !== 'All') {
      list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }
    if (hostelBlock) {
      list = list.filter((s) => !s.allowedHostels || s.allowedHostels.includes(hostelBlock));
    }
    return list;
  }

  getStore(storeId) {
    return this.stores.find((s) => s.storeId === storeId);
  }

  updateStoreStatus(storeId, isOpen) {
    const store = this.stores.find((s) => s.storeId === storeId);
    if (store) {
      store.isOpen = isOpen;
      this.persist();
      this.notifyAll('store_status_changed', { storeId, isOpen });
    }
    return store;
  }

  updateStoreProfile(storeId, updateData) {
    const idx = this.stores.findIndex((s) => s.storeId === storeId);
    if (idx !== -1) {
      this.stores[idx] = { ...this.stores[idx], ...updateData };
      this.persist();
      this.notifyAll('store_updated', { storeId, store: this.stores[idx] });
      return this.stores[idx];
    }
    return null;
  }

  // --- FIRESTORE PRODUCTS COLLECTION ---
  getProductsByStore(storeId) {
    return this.products.filter((p) => p.storeId === storeId);
  }

  updateProductStock(productId, isAvailable) {
    const product = this.products.find((p) => p.productId === productId);
    if (product) {
      product.isAvailable = isAvailable;
      product.stockStatus = isAvailable ? 'Available' : 'Out of Stock';
      this.persist();
      this.notifyAll('product_stock_changed', { productId, isAvailable, stockStatus: product.stockStatus });
    }
    return product;
  }

  updateProductPrice(productId, newPrice) {
    const product = this.products.find((p) => p.productId === productId);
    if (product) {
      product.price = Number(newPrice);
      this.persist();
      this.notifyAll('product_price_changed', { productId, newPrice: product.price });
    }
    return product;
  }

  updateProduct(productId, updateData) {
    const idx = this.products.findIndex((p) => p.productId === productId);
    if (idx !== -1) {
      const updated = {
        ...this.products[idx],
        ...updateData,
        price: updateData.price !== undefined ? Number(updateData.price) : this.products[idx].price,
        stockStatus: (updateData.isAvailable !== undefined ? updateData.isAvailable : this.products[idx].isAvailable) ? 'Available' : 'Out of Stock'
      };
      this.products[idx] = updated;
      this.persist();
      this.notifyAll('product_updated', { productId, product: updated });
      return updated;
    }
    return null;
  }

  deleteProduct(productId) {
    const idx = this.products.findIndex((p) => p.productId === productId);
    if (idx !== -1) {
      const removed = this.products.splice(idx, 1)[0];
      this.persist();
      this.notifyAll('product_deleted', { productId, product: removed });
      return removed;
    }
    return null;
  }

  addProduct(productData) {
    const newProduct = {
      productId: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      storeId: productData.storeId,
      name: productData.name,
      price: Number(productData.price),
      isAvailable: productData.isAvailable !== undefined ? productData.isAvailable : true,
      category: productData.category || 'General',
      description: productData.description || '',
      image: productData.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      stockStatus: productData.isAvailable === false ? 'Out of Stock' : 'Available'
    };
    this.products.unshift(newProduct);
    this.persist();
    this.notifyAll('product_added', { product: newProduct });
    return newProduct;
  }

  // --- FIRESTORE ORDERS COLLECTION ---
  getOrders(storeId = null) {
    if (storeId) {
      return this.orders.filter((o) => o.storeId === storeId);
    }
    return this.orders;
  }

  getOrder(orderId) {
    return this.orders.find((o) => o.orderId === orderId);
  }

  placeOrder({ userId, storeId, items, totalAmount, hostelBlock, roomNumber, studentName, phone, paymentMethod = 'COD' }) {
    const store = this.getStore(storeId);
    const orderNum = this.nextOrderNumber++;
    const orderId = `ORDER_${orderNum}`; // e.g. "ORDER_1001"

    const newOrder = {
      orderId,
      displayId: `#${orderNum}`,
      userId,
      storeId,
      storeName: store ? store.storeName : 'Campus Store',
      studentName: studentName || 'Thejas Gowda',
      phone: phone || '+91 98765 43210',
      hostelBlock: hostelBlock || 'Block B',
      roomNumber: roomNumber || '204',
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      totalAmount: Number(totalAmount),
      status: 'Placed',
      paymentMethod,
      timestamp: new Date().toISOString(),
      timeline: [
        { status: 'Placed', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Order placed by student' }
      ]
    };

    this.orders.unshift(newOrder);
    this.persist();

    // Trigger audio chime for Store Owner
    soundManager.playOrderAlert();

    this.notifyAll('order_placed', { order: newOrder });
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find((o) => o.orderId === orderId);
    if (!order) return null;

    order.status = newStatus;
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: newStatus,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: `Status updated to ${newStatus}`
    });

    this.persist();
    soundManager.playStatusUpdateSound();
    this.notifyAll('order_status_updated', { orderId, newStatus, order });
    return order;
  }

  rejectOrder(orderId, reason = 'Store is busy or items out of stock') {
    const order = this.orders.find((o) => o.orderId === orderId);
    if (!order) return null;
    order.status = 'Rejected';
    order.rejectionReason = reason;
    this.persist();
    this.notifyAll('order_rejected', { orderId, order });
    return order;
  }
}

export const db = new ReactiveFirestore();
