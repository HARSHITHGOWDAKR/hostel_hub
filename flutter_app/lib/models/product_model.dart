class ProductModel {
  final String productId;
  final String storeId;
  final String name;
  final double price;
  final bool isAvailable;
  final String category;
  final String? description;
  final String? image;

  ProductModel({
    required this.productId,
    required this.storeId,
    required this.name,
    required this.price,
    required this.isAvailable,
    required this.category,
    this.description,
    this.image,
  });

  factory ProductModel.fromMap(Map<String, dynamic> data, String id) {
    return ProductModel(
      productId: id,
      storeId: data['storeId'] ?? '',
      name: data['name'] ?? '',
      price: (data['price'] as num?)?.toDouble() ?? 0.0,
      isAvailable: data['isAvailable'] ?? true,
      category: data['category'] ?? 'General',
      description: data['description'],
      image: data['image'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'storeId': storeId,
      'name': name,
      'price': price,
      'isAvailable': isAvailable,
      'category': category,
      'description': description,
      'image': image,
    };
  }
}
