import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/order_model.dart';
import '../../services/firebase_service.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderId;

  const OrderTrackingScreen({Key? key, required this.orderId}) : super(key: key);

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  final Completer<GoogleMapController> _mapController = Completer();

  // Campus coordinates: SAC Stationery Store (Pickup) & Hostel Block B (Dropoff)
  static const LatLng _sacStoreCoords = LatLng(12.97160, 77.59460);
  static const LatLng _blockBCoords = LatLng(12.97240, 77.59620);
  
  LatLng _currentRiderPosition = _sacStoreCoords;
  Timer? _routeSimulationTimer;

  final List<String> _statusFlow = [
    "Placed",
    "Accepted",
    "Preparing",
    "Ready",
    "Out for Delivery",
    "Delivered"
  ];

  @override
  void initState() {
    super.initState();
    _startRouteSimulation();
  }

  @override
  void dispose() {
    _routeSimulationTimer?.cancel();
    super.dispose();
  }

  // Simulated GPS coordinate updates moving from SAC to Block B
  void _startRouteSimulation() {
    double progress = 0.0;
    _routeSimulationTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (!mounted) return;
      progress += 0.08;
      if (progress >= 1.0) {
        progress = 1.0;
        timer.cancel();
      }
      setState(() {
        final lat = _sacStoreCoords.latitude + (_blockBCoords.latitude - _sacStoreCoords.latitude) * progress;
        final lng = _sacStoreCoords.longitude + (_blockBCoords.longitude - _sacStoreCoords.longitude) * progress;
        _currentRiderPosition = LatLng(lat, lng);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text("Live Order Tracking #${widget.orderId.replaceAll('ORDER_', '')}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: StreamBuilder<OrderModel?>(
        stream: _firebaseService.streamOrderById(widget.orderId),
        builder: (context, snapshot) {
          final order = snapshot.data;
          final currentStatus = order?.status ?? "Placed";
          final currentIdx = _statusFlow.indexOf(currentStatus);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Real-time Status Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.between,
                        children: [
                          const Text("Real-Time Order Lifecycle", style: TextStyle(color: Colors.white70, fontSize: 12)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF34D399), shape: BoxShape.circle)),
                                const SizedBox(width: 4),
                                const Text("Firestore Stream Active", style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        currentStatus == "Delivered" ? "🎉 Order Delivered at Gate!" : "Status: $currentStatus",
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),

                      // Step by step timeline
                      Row(
                        children: _statusFlow.map((step) {
                          final stepIdx = _statusFlow.indexOf(step);
                          final isDone = stepIdx <= currentIdx;
                          final isCurrent = stepIdx == currentIdx;

                          return Expanded(
                            child: Column(
                              children: [
                                Container(
                                  width: 20,
                                  height: 20,
                                  decoration: BoxDecoration(
                                    color: isDone ? const Color(0xFF10B981) : Colors.white12,
                                    shape: BoxShape.circle,
                                    border: isCurrent ? Border.all(color: Colors.white, width: 2) : null,
                                  ),
                                  child: isDone
                                      ? const Icon(Icons.check, size: 12, color: Colors.white)
                                      : null,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  step,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 8,
                                    color: isDone ? const Color(0xFF34D399) : Colors.white38,
                                    fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Simulated Google Maps Component
                const Text("Simulated Delivery Route GPS", style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 8),
                Container(
                  height: 240,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white10),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    children: [
                      GoogleMap(
                        initialCameraPosition: const CameraPosition(
                          target: _sacStoreCoords,
                          zoom: 16.5,
                        ),
                        onMapCreated: (controller) => _mapController.complete(controller),
                        markers: {
                          const Marker(
                            markerId: MarkerId('store'),
                            position: _sacStoreCoords,
                            infoWindow: InfoWindow(title: 'Campus Stationery Store'),
                          ),
                          const Marker(
                            markerId: MarkerId('hostel'),
                            position: _blockBCoords,
                            infoWindow: InfoWindow(title: 'Hostel Block B Gate'),
                          ),
                          Marker(
                            markerId: const MarkerId('rider'),
                            position: _currentRiderPosition,
                            icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
                            infoWindow: const InfoWindow(title: 'Delivery Rider'),
                          ),
                        },
                      ),
                      Positioned(
                        bottom: 10,
                        left: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A).withOpacity(0.9),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFF59E0B)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "GPS: ${_currentRiderPosition.latitude.toStringAsFixed(5)}°N, ${_currentRiderPosition.longitude.toStringAsFixed(5)}°E",
                                style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontFamily: 'monospace'),
                              ),
                              const Text("Speed: 18 km/h", style: TextStyle(color: Colors.white70, fontSize: 11)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
