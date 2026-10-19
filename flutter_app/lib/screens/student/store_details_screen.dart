import 'package:flutter/material.dart';
import '../../models/store_model.dart';
import '../../models/product_model.dart';
import '../../services/firebase_service.dart';
import 'cart_checkout_screen.dart';

class StoreDetailsScreen extends StatefulWidget {
  final StoreModel store;
  final String hostelBlock;

  const StoreDetailsScreen({
    Key? key,
    required this.store,
    required this.hostelBlock,
  }) : super(key: key);

  @override
  State<StoreDetailsScreen> createState() => _StoreDetailsScreenState();
}

class _StoreDetailsScreenState extends State<StoreDetailsScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  final Map<String, int> _cart = {}; // productId -> quantity

  void _addToCart(ProductModel product) {
    if (!product.isAvailable) return; // Do not add if out of stock
    setState(() {
      _cart[product.productId] = (_cart[product.productId] ?? 0) + 1;
    });
  }

  void _updateCartQty(String productId, int delta) {
    setState(() {
      final current = _cart[productId] ?? 0;
      final next = current + delta;
      if (next <= 0) {
        _cart.remove(productId);
      } else {
        _cart[productId] = next;
      }
    });
  }

  int get _cartItemCount => _cart.values.fold(0, (sum, q) => sum + q);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text(widget.store.storeName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CartCheckoutScreen(
                        store: widget.store,
                        cart: _cart,
                        hostelBlock: widget.hostelBlock,
                      ),
                    ),
                  );
                },
              ),
              if (_cartItemCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$_cartItemCount',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: StreamBuilder<List<ProductModel>>(
        stream: _firebaseService.streamProductsByStore(widget.store.storeId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
          }

          final products = snapshot.data ?? [];
          if (products.isEmpty) {
            return const Center(
              child: Text("No items available in this store.", style: TextStyle(color: Colors.white70)),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final product = products[index];
              final inCartCount = _cart[product.productId] ?? 0;
              final bool isOutOfStock = !product.isAvailable;

              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isOutOfStock ? const Color(0xFF1E293B).withOpacity(0.5) : const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isOutOfStock ? Colors.redAccent.withOpacity(0.3) : Colors.white10,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Image & Stock Badge
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: product.image != null
                              ? Image.network(product.image!, width: 75, height: 75, fit: BoxFit.cover)
                              : Container(
                                  width: 75,
                                  height: 75,
                                  color: Colors.white12,
                                  child: const Icon(Icons.image, color: Colors.white30),
                                ),
                        ),
                        Positioned(
                          bottom: 2,
                          left: 2,
                          right: 2,
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 2),
                            decoration: BoxDecoration(
                              color: isOutOfStock ? Colors.redAccent : Colors.green,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              isOutOfStock ? "Out of Stock" : "Available",
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),

                    // Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product.name,
                            style: TextStyle(
                              color: isOutOfStock ? Colors.white54 : Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "₹${product.price.toStringAsFixed(0)}",
                            style: const TextStyle(color: Color(0xFF34D399), fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          if (product.description != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              product.description!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(color: Colors.white38, fontSize: 11),
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Add to Cart / Qty Stepper / Disabled button
                    Align(
                      alignment: Alignment.bottomRight,
                      child: isOutOfStock
                          ? ElevatedButton(
                              onPressed: null, // DISABLED FOR OUT OF STOCK
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.grey.shade800,
                                disabledBackgroundColor: Colors.grey.shade800,
                                disabledForegroundColor: Colors.white38,
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                              child: const Text("Out of Stock", style: TextStyle(fontSize: 11)),
                            )
                          : inCartCount > 0
                              ? Container(
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF6366F1).withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFF6366F1)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove, size: 14, color: Colors.white),
                                        onPressed: () => _updateCartQty(product.productId, -1),
                                        constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                        padding: EdgeInsets.zero,
                                      ),
                                      Text(
                                        '$inCartCount',
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.add, size: 14, color: Colors.white),
                                        onPressed: () => _updateCartQty(product.productId, 1),
                                        constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                        padding: EdgeInsets.zero,
                                      ),
                                    ],
                                  ),
                                )
                              : ElevatedButton.icon(
                                  onPressed: () => _addToCart(product),
                                  icon: const Icon(Icons.add, size: 14),
                                  label: const Text("Add", style: TextStyle(fontSize: 12)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF6366F1),
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                                  ),
                                ),
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
