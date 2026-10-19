import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../models/order_model.dart';
import '../../services/firebase_service.dart';

class OwnerTerminalScreen extends StatefulWidget {
  final String storeId;

  const OwnerTerminalScreen({Key? key, required this.storeId}) : super(key: key);

  @override
  State<OwnerTerminalScreen> createState() => _OwnerTerminalScreenState();
}

class _OwnerTerminalScreenState extends State<OwnerTerminalScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  final AudioPlayer _audioPlayer = AudioPlayer();
  int _lastOrderCount = 0;

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  void _playOrderChime() async {
    try {
      await _audioPlayer.play(AssetSource('sounds/order_chime.mp3'));
    } catch (_) {}
  }

  void _transitionStatus(OrderModel order) {
    const transitions = {
      'Accepted': 'Preparing',
      'Preparing': 'Ready',
      'Ready': 'Out for Delivery',
      'Out for Delivery': 'Delivered',
    };
    final nextStatus = transitions[order.status];
    if (nextStatus != null) {
      _firebaseService.updateOrderStatus(order.orderId, nextStatus);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D131F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text("Store Owner Terminal - Real-Time Stream", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up, color: Color(0xFF34D399)),
            onPressed: _playOrderChime,
            tooltip: "Test Order Alert Sound",
          ),
        ],
      ),
      body: StreamBuilder<List<OrderModel>>(
        stream: _firebaseService.streamStoreOrders(widget.storeId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)));
          }

          final orders = snapshot.data ?? [];
          
          // Trigger audio alert when new order arrives
          if (orders.length > _lastOrderCount && _lastOrderCount > 0) {
            _playOrderChime();
          }
          _lastOrderCount = orders.length;

          if (orders.isEmpty) {
            return const Center(
              child: Text("No incoming orders. Listening to Firestore...", style: TextStyle(color: Colors.white60)),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: orders.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (context, index) {
              final order = orders[index];
              final isPlaced = order.status == 'Placed';
              final isDelivered = order.status == 'Delivered';

              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isPlaced ? const Color(0xFFF59E0B) : Colors.white10,
                    width: isPlaced ? 1.5 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header: Order ID & Status
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text(
                          "Order #${order.orderId.replaceAll('ORDER_', '')}",
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            order.status,
                            style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Student & Room Info
                    Text("Student: ${order.studentName ?? 'Student'}", style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                    Text("Hostel: ${order.hostelBlock ?? 'Block B'} • Room: ${order.roomNumber ?? '204'}", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    Text("Phone: ${order.phone ?? 'N/A'}", style: const TextStyle(color: Colors.white38, fontSize: 11)),
                    const Divider(color: Colors.white10, height: 20),

                    // Itemized list
                    ...order.items.map((item) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.between,
                            children: [
                              Text("${item.name} × ${item.qty}", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                              Text("₹${(item.price * item.qty).toStringAsFixed(0)}", style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        )),
                    const Divider(color: Colors.white10, height: 20),

                    // Total & Payment
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text("Payment: ${order.paymentMethod}", style: const TextStyle(color: Colors.white60, fontSize: 12)),
                        Text("Total: ₹${order.totalAmount.toStringAsFixed(0)}", style: const TextStyle(color: Color(0xFF34D399), fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Action buttons
                    if (isPlaced) ...[
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _firebaseService.updateOrderStatus(order.orderId, 'Accepted'),
                              icon: const Icon(Icons.check, size: 16),
                              label: const Text("Accept Order"),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _firebaseService.updateOrderStatus(order.orderId, 'Rejected'),
                              icon: const Icon(Icons.close, size: 16),
                              label: const Text("Reject"),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.redAccent,
                                side: const BorderSide(color: Colors.redAccent),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ] else if (!isDelivered && order.status != 'Rejected') ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _transitionStatus(order),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            foregroundColor: Colors.white,
                          ),
                          child: Text("Transition to: ${_getNextStatusLabel(order.status)} ➔"),
                        ),
                      ),
                    ] else if (isDelivered) ...[
                      const Center(
                        child: Text("✓ Order Delivered & Completed", style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                    ],
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  String _getNextStatusLabel(String status) {
    switch (status) {
      case 'Accepted': return 'Preparing';
      case 'Preparing': return 'Ready';
      case 'Ready': return 'Out for Delivery';
      case 'Out for Delivery': return 'Delivered';
      default: return 'Completed';
    }
  }
}
