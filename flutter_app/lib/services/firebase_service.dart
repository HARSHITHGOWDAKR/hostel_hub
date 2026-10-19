import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';
import '../models/store_model.dart';
import '../models/product_model.dart';
import '../models/order_model.dart';

class FirebaseService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // --- USERS ---
  Future<UserModel?> getUser(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    if (doc.exists && doc.data() != null) {
      return UserModel.fromMap(doc.data()!, doc.id);
    }
    return null;
  }

  Future<void> updateUser(UserModel user) async {
    await _firestore.collection('users').doc(user.userId).set(user.toMap(), SetOptions(merge: true));
  }

  // --- STORES ---
  Stream<List<StoreModel>> streamStores({String? category}) {
    Query query = _firestore.collection('stores');
    if (category != null && category != 'All') {
      query = query.where('category', isEqualTo: category);
    }
    return query.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => StoreModel.fromMap(doc.data() as Map<String, dynamic>, doc.id)).toList();
    });
  }

  Future<void> updateStoreStatus(String storeId, bool isOpen) async {
    await _firestore.collection('stores').doc(storeId).update({'isOpen': isOpen});
  }

  // --- PRODUCTS ---
  Stream<List<ProductModel>> streamProductsByStore(String storeId) {
    return _firestore
        .collection('products')
        .where('storeId', isEqualTo: storeId)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) => ProductModel.fromMap(doc.data() as Map<String, dynamic>, doc.id)).toList();
    });
  }

  Future<void> updateProductStock(String productId, bool isAvailable) async {
    await _firestore.collection('products').doc(productId).update({'isAvailable': isAvailable});
  }

  Future<void> updateProductPrice(String productId, double newPrice) async {
    await _firestore.collection('products').doc(productId).update({'price': newPrice});
  }

  Future<void> updateProduct(ProductModel product) async {
    await _firestore.collection('products').doc(product.productId).update(product.toMap());
  }

  Future<void> deleteProduct(String productId) async {
    await _firestore.collection('products').doc(productId).delete();
  }

  Future<void> addProduct(ProductModel product) async {
    await _firestore.collection('products').doc(product.productId).set(product.toMap());
  }

  // --- ORDERS ---
  Stream<List<OrderModel>> streamStoreOrders(String storeId) {
    return _firestore
        .collection('orders')
        .where('storeId', isEqualTo: storeId)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) => OrderModel.fromMap(doc.data() as Map<String, dynamic>, doc.id)).toList();
    });
  }

  Stream<OrderModel?> streamOrderById(String orderId) {
    return _firestore.collection('orders').doc(orderId).snapshots().map((doc) {
      if (doc.exists && doc.data() != null) {
        return OrderModel.fromMap(doc.data()!, doc.id);
      }
      return null;
    });
  }

  Future<String> placeOrder(OrderModel order) async {
    final docRef = _firestore.collection('orders').doc(order.orderId);
    await docRef.set(order.toMap());
    return docRef.id;
  }

  Future<void> updateOrderStatus(String orderId, String newStatus) async {
    await _firestore.collection('orders').doc(orderId).update({'status': newStatus});
  }
}
