import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'screens/auth/phone_otp_login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // If Firebase is initialized natively (google-services.json / GoogleService-Info.plist)
  // await Firebase.initializeApp();
  runApp(const HostelDeliveryApp());
}

class HostelDeliveryApp extends StatelessWidget {
  const HostelDeliveryApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HostelExpress Campus Delivery',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF6366F1),
        fontFamily: 'Roboto',
      ),
      // Starts directly on the Phone Number & OTP Verification screen
      home: const PhoneOtpLoginScreen(isOwnerLogin: false),
    );
  }
}
