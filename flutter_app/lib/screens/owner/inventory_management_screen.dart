import 'package:flutter/material.dart';
import '../../models/product_model.dart';
import '../../services/firebase_service.dart';

class InventoryManagementScreen extends StatefulWidget {
  final String storeId;

  const InventoryManagementScreen({Key? key, required this.storeId}) : super(key: key);

  @override
  State<InventoryManagementScreen> createState() => _InventoryManagementScreenState();
}

class _InventoryManagementScreenState extends State<InventoryManagementScreen> {
  final FirebaseService _firebaseService = FirebaseService();

  // Add New Product Dialog
  void _showAddProductDialog() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String category = 'Stationery';
    bool isAvailable = true;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text("Add New Store Item", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: "Product Name", labelStyle: TextStyle(color: Colors.white60)),
                ),
                TextField(
                  controller: priceCtrl,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: "Price (₹)", labelStyle: TextStyle(color: Colors.white60)),
                ),
                TextField(
                  controller: descCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: "Description", labelStyle: TextStyle(color: Colors.white60)),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Stock Status:", style: TextStyle(color: Colors.white70)),
                    Switch(
                      value: isAvailable,
                      activeColor: const Color(0xFF10B981),
                      onChanged: (val) => setDialogState(() => isAvailable = val),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
            ElevatedButton(
              onPressed: () {
                if (nameCtrl.text.isNotEmpty && priceCtrl.text.isNotEmpty) {
                  final newProd = ProductModel(
                    productId: 'prod_${DateTime.now().millisecondsSinceEpoch}',
                    storeId: widget.storeId,
                    name: nameCtrl.text,
                    price: double.tryParse(priceCtrl.text) ?? 50.0,
                    description: descCtrl.text,
                    isAvailable: isAvailable,
                    category: category,
                    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
                  );
                  _firebaseService.addProduct(newProd);
                  Navigator.pop(ctx);
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B)),
              child: const Text("Add & Sync Live"),
            ),
          ],
        ),
      ),
    );
  }

  // Full Edit Product Dialog (Name, Price, Category, Description, Stock Status)
  void _showFullEditProductDialog(ProductModel product) {
    final nameCtrl = TextEditingController(text: product.name);
    final priceCtrl = TextEditingController(text: product.price.toStringAsFixed(0));
    final descCtrl = TextEditingController(text: product.description ?? '');
    bool isAvailable = product.isAvailable;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: Text("Edit: ${product.name}", style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: "Product Name", labelStyle: TextStyle(color: Colors.white60)),
                ),
                TextField(
                  controller: priceCtrl,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: "Price (₹)", labelStyle: TextStyle(color: Colors.white60)),
                ),
                TextField(
                  controller: descCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(labelText: "Description", labelStyle: TextStyle(color: Colors.white60)),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAvailable ? "Status: Available" : "Status: Out of Stock",
                      style: TextStyle(color: isAvailable ? const Color(0xFF34D399) : Colors.redAccent, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    Switch(
                      value: isAvailable,
                      activeColor: const Color(0xFF10B981),
                      inactiveThumbColor: Colors.redAccent,
                      onChanged: (val) => setDialogState(() => isAvailable = val),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                _firebaseService.deleteProduct(product.productId);
                Navigator.pop(ctx);
              },
              child: const Text("Delete", style: TextStyle(color: Colors.redAccent)),
            ),
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
            ElevatedButton(
              onPressed: () {
                final updated = ProductModel(
                  productId: product.productId,
                  storeId: product.storeId,
                  name: nameCtrl.text,
                  price: double.tryParse(priceCtrl.text) ?? product.price,
                  description: descCtrl.text,
                  isAvailable: isAvailable,
                  category: product.category,
                  image: product.image,
                );
                _firebaseService.updateProduct(updated);
                Navigator.pop(ctx);
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
              child: const Text("Save Changes"),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D131F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("Inventory & Product Management", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Color(0xFFF59E0B)),
            onPressed: _showAddProductDialog,
            tooltip: "Add New Product",
          ),
        ],
      ),
      body: StreamBuilder<List<ProductModel>>(
        stream: _firebaseService.streamProductsByStore(widget.storeId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final products = snapshot.data ?? [];

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final product = products[index];

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: product.isAvailable ? Colors.white10 : Colors.redAccent.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(product.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Text("₹${product.price.toStringAsFixed(0)}", style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 13)),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(product.category, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Edit Button
                    IconButton(
                      icon: const Icon(Icons.edit_note, color: Color(0xFF818CF8), size: 22),
                      onPressed: () => _showFullEditProductDialog(product),
                      tooltip: "Edit Product Details",
                    ),

                    // Real-time Stock Toggle Switch
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Switch(
                          value: product.isAvailable,
                          activeColor: const Color(0xFF10B981),
                          inactiveThumbColor: Colors.redAccent,
                          inactiveTrackColor: Colors.redAccent.withOpacity(0.3),
                          onChanged: (val) {
                            _firebaseService.updateProductStock(product.productId, val);
                          },
                        ),
                        Text(
                          product.isAvailable ? "Available" : "Out of Stock",
                          style: TextStyle(
                            fontSize: 10,
                            color: product.isAvailable ? const Color(0xFF34D399) : Colors.redAccent,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
