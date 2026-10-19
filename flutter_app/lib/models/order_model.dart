class OrderItem {
  final String? productId;
  final String name;
  final double price;
  final int qty;

  OrderItem({
    this.productId,
    required this.name,
    required this.price,
    required this.qty,
  });

  factory OrderItem.fromMap(Map<String, dynamic> data) {
    return OrderItem(
      productId: data['productId'],
      name: data['name'] ?? '',
      price: (data['price'] as num?)?.toDouble() ?? 0.0,
      qty: data['qty'] ?? 1,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'name': name,
      'price': price,
      'qty': qty,
    };
  }
}

class OrderModel {
  final String orderId;
  final String userId;
  final String storeId;
  final String? storeName;
  final String? studentName;
  final String? phone;
  final String? hostelBlock;
  final String? roomNumber;
  final List<OrderItem> items;
  final double totalAmount;
  final String status; // "Placed", "Accepted", "Preparing", "Ready", "Out for Delivery", "Delivered", "Rejected"
  final DateTime timestamp;
  final String paymentMethod;

  OrderModel({
    required this.orderId,
    required this.userId,
    required this.storeId,
    this.storeName,
    this.studentName,
    this.phone,
    this.hostelBlock,
    this.roomNumber,
    required this.items,
    required this.totalAmount,
    required this.status,
    required this.timestamp,
    this.paymentMethod = 'COD',
  });

  factory OrderModel.fromMap(Map<String, dynamic> data, String id) {
    return OrderModel(
      orderId: id,
      userId: data['userId'] ?? '',
      storeId: data['storeId'] ?? '',
      storeName: data['storeName'],
      studentName: data['studentName'],
      phone: data['phone'],
      hostelBlock: data['hostelBlock'],
      roomNumber: data['roomNumber'],
      items: (data['items'] as List<dynamic>?)
              ?.map((item) => OrderItem.fromMap(item as Map<String, dynamic>))
              .toList() ??
          [],
      totalAmount: (data['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: data['status'] ?? 'Placed',
      timestamp: data['timestamp'] != null
          ? (data['timestamp'] is String 
              ? DateTime.parse(data['timestamp'])
              : (data['timestamp'] as dynamic).toDate())
          : DateTime.now(),
      paymentMethod: data['paymentMethod'] ?? 'COD',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'orderId': orderId,
      'userId': userId,
      'storeId': storeId,
      'storeName': storeName,
      'studentName': studentName,
      'phone': phone,
      'hostelBlock': hostelBlock,
      'roomNumber': roomNumber,
      'items': items.map((i) => i.toMap()).toList(),
      'totalAmount': totalAmount,
      'status': status,
      'timestamp': timestamp.toIso8601String(),
      'paymentMethod': paymentMethod,
    };
  }
}
