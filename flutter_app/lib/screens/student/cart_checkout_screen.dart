import 'package:flutter/material.dart';
import '../../models/store_model.dart';
import '../../models/order_model.dart';
import '../../services/firebase_service.dart';
import 'order_tracking_screen.dart';

class CartCheckoutScreen extends StatefulWidget {
  final StoreModel store;
  final Map<String, int> cart; // productId -> qty
  final String hostelBlock;

  const CartCheckoutScreen({
    Key? key,
    required this.store,
    required this.cart,
    required this.hostelBlock,
  }) : super(key: key);

  @override
  State<CartCheckoutScreen> createState() => _CartCheckoutScreenState();
}

class _CartCheckoutScreenState extends State<CartCheckoutScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  String _paymentMethod = 'COD';
  String _roomNumber = '204';
  late String _selectedHostel;

  @override
  void initState() {
    super.initState();
    _selectedHostel = widget.hostelBlock;
  }

  double _calculateTotal() {
    // Demonstration mock products pricing
    double sum = 0;
    widget.cart.forEach((id, qty) {
      if (id.contains('record_book')) sum += 80 * qty;
      else if (id.contains('pen')) sum += 10 * qty;
      else sum += 50 * qty;
    });
    return sum;
  }

  Future<void> _placeOrder() async {
    final orderId = 'ORDER_${DateTime.now().millisecondsSinceEpoch % 10000}';
    final items = widget.cart.entries.map((entry) {
      String name = 'Item';
      double price = 50.0;
      if (entry.key.contains('record_book')) {
        name = 'Record Book (₹80)';
        price = 80.0;
      } else if (entry.key.contains('pen')) {
        name = 'Pen (₹10)';
        price = 10.0;
      }
      return OrderItem(productId: entry.key, name: name, price: price, qty: entry.value);
    }).toList();

    final order = OrderModel(
      orderId: orderId,
      userId: 'user_thejas_01',
      storeId: widget.store.storeId,
      storeName: widget.store.storeName,
      studentName: 'Thejas Gowda',
      phone: '+91 98765 43210',
      hostelBlock: _selectedHostel,
      roomNumber: _roomNumber,
      items: items,
      totalAmount: _calculateTotal(),
      status: 'Placed',
      timestamp: DateTime.now(),
      paymentMethod: _paymentMethod,
    );

    await _firebaseService.placeOrder(order);

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrderTrackingScreen(orderId: order.orderId),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = _calculateTotal();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("Interactive Shopping Cart", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Store & Hostel Info
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Color(0xFF818CF8), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          "Delivery to: $_selectedHostel, Room $_roomNumber",
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: _selectedHostel,
                    dropdownColor: const Color(0xFF1E293B),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: const InputDecoration(
                      labelText: "Hostel Block / Gate",
                      labelStyle: TextStyle(color: Colors.white60),
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                    items: const [
                      DropdownMenuItem(value: "Block A", child: Text("Hostel Block A")),
                      DropdownMenuItem(value: "Block B", child: Text("Hostel Block B")),
                      DropdownMenuItem(value: "Girls Hostel Gate 1", child: Text("Girls Hostel Gate 1")),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedHostel = val);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Itemized Order List
            const Text("Order Items", style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: widget.cart.entries.map((e) {
                  String name = e.key.contains('record_book') ? 'Record Book (₹80)' : 'Pen (₹10)';
                  double price = e.key.contains('record_book') ? 80.0 : 10.0;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text("$name × ${e.value}", style: const TextStyle(color: Colors.white, fontSize: 13)),
                        Text("₹${(price * e.value).toStringAsFixed(0)}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 16),

            // Payment method toggle: COD / Pay at Gate
            const Text("Payment Method", style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _paymentMethod = 'COD'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                      decoration: BoxDecoration(
                        color: _paymentMethod == 'COD' ? const Color(0xFF10B981).withOpacity(0.2) : const Color(0xFF1E293B),
                        border: Border.all(color: _paymentMethod == 'COD' ? const Color(0xFF10B981) : Colors.white10),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text("💵 Cash on Delivery (COD)", style: TextStyle(color: _paymentMethod == 'COD' ? const Color(0xFF34D399) : Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _paymentMethod = 'Pay at Gate'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                      decoration: BoxDecoration(
                        color: _paymentMethod == 'Pay at Gate' ? const Color(0xFF10B981).withOpacity(0.2) : const Color(0xFF1E293B),
                        border: Border.all(color: _paymentMethod == 'Pay at Gate' ? const Color(0xFF10B981) : Colors.white10),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text("🚪 Pay at Gate (UPI)", style: TextStyle(color: _paymentMethod == 'Pay at Gate' ? const Color(0xFF34D399) : Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Bill Total & Place Order Button
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text("Total Payable:", style: TextStyle(color: Colors.white, fontSize: 14)),
                  Text("₹${total.toStringAsFixed(0)}", style: const TextStyle(color: Color(0xFF34D399), fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: widget.cart.isEmpty ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text("Place Order ➔", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
