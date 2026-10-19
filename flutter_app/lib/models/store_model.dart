class StoreModel {
  final String storeId;
  final String storeName;
  final String category;
  final String location;
  final String ownerId;
  final bool isOpen;
  final String? banner;
  final double rating;

  StoreModel({
    required this.storeId,
    required this.storeName,
    required this.category,
    required this.location,
    required this.ownerId,
    required this.isOpen,
    this.banner,
    this.rating = 4.8,
  });

  factory StoreModel.fromMap(Map<String, dynamic> data, String id) {
    return StoreModel(
      storeId: id,
      storeName: data['storeName'] ?? '',
      category: data['category'] ?? 'General',
      location: data['location'] ?? '',
      ownerId: data['ownerId'] ?? '',
      isOpen: data['isOpen'] ?? true,
      banner: data['banner'],
      rating: (data['rating'] as num?)?.toDouble() ?? 4.8,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'storeId': storeId,
      'storeName': storeName,
      'category': category,
      'location': location,
      'ownerId': ownerId,
      'isOpen': isOpen,
      'banner': banner,
      'rating': rating,
    };
  }
}
