import 'package:flutter/material.dart';
import '../student/student_home_screen.dart';
import '../owner/owner_terminal_screen.dart';

class PhoneOtpLoginScreen extends StatefulWidget {
  final bool isOwnerLogin;

  const PhoneOtpLoginScreen({Key? key, this.isOwnerLogin = false}) : super(key: key);

  @override
  State<PhoneOtpLoginScreen> createState() => _PhoneOtpLoginScreenState();
}

class _PhoneOtpLoginScreenState extends State<PhoneOtpLoginScreen> {
  final _phoneController = TextEditingController(text: "9876543210");
  final _otpController = TextEditingController();
  bool _otpSent = false;
  String _generatedOtp = "123456";
  String? _errorMessage;

  void _sendOtp() {
    if (_phoneController.text.length < 10) {
      setState(() => _errorMessage = "Please enter a valid 10-digit mobile number");
      return;
    }
    setState(() {
      _otpSent = true;
      _generatedOtp = "123456";
      _errorMessage = null;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("📩 Simulated SMS OTP: $_generatedOtp sent to +91 ${_phoneController.text}"),
        backgroundColor: const Color(0xFF1E293B),
      ),
    );
  }

  void _verifyOtp() {
    if (_otpController.text == _generatedOtp || _otpController.text == "123456") {
      if (widget.isOwnerLogin) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const OwnerTerminalScreen(storeId: 'store_stationery_01')),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const StudentHomeScreen()),
        );
      }
    } else {
      setState(() => _errorMessage = "Invalid OTP code. Enter 123456.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: widget.isOwnerLogin 
                        ? [const Color(0xFFF59E0B), const Color(0xFFD97706)] 
                        : [const Color(0xFF6366F1), const Color(0xFFA855F7)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  widget.isOwnerLogin ? Icons.storefront : Icons.school,
                  size: 32,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                widget.isOwnerLogin ? "Store Owner Login" : "Campus Student Login",
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 6),
              const Text(
                "Phone Number & OTP Verification",
                style: TextStyle(fontSize: 12, color: Colors.white60),
              ),
              const SizedBox(height: 28),

              // Phone Field
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  prefixText: "+91 ",
                  prefixStyle: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  labelText: "Mobile Number",
                  labelStyle: TextStyle(color: Colors.white60),
                  border: OutlineInputBorder(),
                  filled: true,
                  fillColor: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 16),

              // OTP Field
              if (_otpSent) ...[
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 20, letterSpacing: 8, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    labelText: "Enter 6-digit OTP",
                    labelStyle: TextStyle(color: Colors.white60),
                    border: OutlineInputBorder(),
                    filled: true,
                    fillColor: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 8),
                const Text("Test verification code: 123456", style: TextStyle(color: Color(0xFF34D399), fontSize: 11)),
                const SizedBox(height: 16),
              ],

              if (_errorMessage != null) ...[
                Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                const SizedBox(height: 12),
              ],

              // Main Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _otpSent ? _verifyOtp : _sendOtp,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.isOwnerLogin ? const Color(0xFFF59E0B) : const Color(0xFF6366F1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    _otpSent ? "Verify OTP & Continue ➔" : "Send Verification OTP",
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Switch role
              TextButton(
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => PhoneOtpLoginScreen(isOwnerLogin: !widget.isOwnerLogin),
                    ),
                  );
                },
                child: Text(
                  widget.isOwnerLogin ? "Switch to Student Login" : "Switch to Store Owner Terminal Login",
                  style: const TextStyle(color: Color(0xFF818CF8), fontSize: 12),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
