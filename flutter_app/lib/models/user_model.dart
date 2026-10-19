class UserModel {
  final String userId;
  final String name;
  final String phone;
  final String hostelBlock;
  final String roomNumber;

  UserModel({
    required this.userId,
    required this.name,
    required this.phone,
    required this.hostelBlock,
    required this.roomNumber,
  });

  factory UserModel.fromMap(Map<String, dynamic> data, String id) {
    return UserModel(
      userId: id,
      name: data['name'] ?? '',
      phone: data['phone'] ?? '',
      hostelBlock: data['hostelBlock'] ?? 'Block B',
      roomNumber: data['roomNumber'] ?? '204',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'name': name,
      'phone': phone,
      'hostelBlock': hostelBlock,
      'roomNumber': roomNumber,
    };
  }
}
