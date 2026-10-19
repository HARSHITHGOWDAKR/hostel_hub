import 'package:flutter/material.dart';
import '../../models/store_model.dart';
import '../../services/firebase_service.dart';
import 'store_details_screen.dart';

class StudentHomeScreen extends StatefulWidget {
  const StudentHomeScreen({Key? key}) : super(key: key);

  @override
  State<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends State<StudentHomeScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  String _selectedHostel = "Block B";
  String _selectedCategory = "All";

  final List<String> _categories = [
    "All",
    "Stationery",
    "Food/Hotels",
    "Groceries",
    "Bakeries",
    "General Stores"
  ];

  final List<String> _hostels = [
    "Block A",
    "Block B",
    "Girls Hostel Gate 1",
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Campus Hostel Delivery", style: TextStyle(fontSize: 12, color: Colors.white60)),
            DropdownButton<String>(
              value: _selectedHostel,
              underline: const SizedBox(),
              icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF818CF8), size: 18),
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
              items: _hostels.map((h) => DropdownMenuItem(value: h, child: Text(h))).toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedHostel = val);
              },
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Category selector chips
          SizedBox(
            height: 52,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final cat = _categories[idx];
                final isSelected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat, style: TextStyle(color: isSelected ? Colors.white : Colors.white70, fontSize: 12)),
                  selected: isSelected,
                  selectedColor: const Color(0xFF6366F1),
                  backgroundColor: const Color(0xFF1E293B),
                  onSelected: (_) => setState(() => _selectedCategory = cat),
                );
              },
            ),
          ),

          // Stores List
          Expanded(
            child: StreamBuilder<List<StoreModel>>(
              stream: _firebaseService.streamStores(category: _selectedCategory),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
                }

                final stores = snapshot.data ?? [];
                if (stores.isEmpty) {
                  return const Center(child: Text("No stores open in this category.", style: TextStyle(color: Colors.white60)));
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: stores.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final store = stores[index];

                    return InkWell(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => StoreDetailsScreen(
                              store: store,
                              hostelBlock: _selectedHostel,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white10),
                        ),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: store.banner != null
                                  ? Image.network(store.banner!, width: 70, height: 70, fit: BoxFit.cover)
                                  : Container(width: 70, height: 70, color: Colors.white12),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(store.storeName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                                  const SizedBox(height: 4),
                                  Text(store.category, style: const TextStyle(color: Color(0xFF818CF8), fontSize: 12)),
                                  const SizedBox(height: 4),
                                  Text(store.location, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                                ],
                              ),
                            ),
                            const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white38),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
