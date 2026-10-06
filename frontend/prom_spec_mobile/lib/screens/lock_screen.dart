import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import '../providers/auth_provider.dart';


class LockScreen extends StatefulWidget {
  const LockScreen({super.key});

  @override
  State<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends State<LockScreen> {
  final _storage = const FlutterSecureStorage();
  final _localAuth = LocalAuthentication();
  String _savedPin = '';
  String _enteredPin = '';
  bool _useBiometrics = false;
  bool _isError = false;

  @override
  void initState() {
    super.initState();
    _initAuth();
  }

  Future<void> _initAuth() async {
    _savedPin = await _storage.read(key: 'user_pin') ?? '';
    final bioStr = await _storage.read(key: 'use_biometrics');
    _useBiometrics = bioStr == 'true';

    if (_useBiometrics) {
      _triggerBiometrics();
    }
  }

  Future<void> _triggerBiometrics() async {
    try {
      final canCheck = await _localAuth.canCheckBiometrics || await _localAuth.isDeviceSupported();
      if (!canCheck) return;

      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Жүйеге кіру үшін растаңыз',
      );
      if (authenticated && mounted) {
        context.read<AuthProvider>().unlockApp();
      }
    } catch (e) {
      // Handle error gracefully
    }
  }

  void _onNumPress(String num) {
    if (_enteredPin.length < 4) {
      setState(() {
        _enteredPin += num;
        _isError = false;
      });

      if (_enteredPin.length == 4) {
        _verifyPin();
      }
    }
  }

  void _onDeletePress() {
    if (_enteredPin.isNotEmpty) {
      setState(() {
        _enteredPin = _enteredPin.substring(0, _enteredPin.length - 1);
        _isError = false;
      });
    }
  }

  void _verifyPin() {
    if (_enteredPin == _savedPin) {
      context.read<AuthProvider>().unlockApp();
    } else {
      setState(() {
        _isError = true;
        _enteredPin = '';
      });
    }
  }

  Widget _buildNumButton(String num, bool isDark) {
    return InkWell(
      onTap: () => _onNumPress(num),
      borderRadius: BorderRadius.circular(40),
      child: Container(
        width: 72,
        height: 72,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isDark ? Colors.white10 : Colors.black12,
        ),
        child: Text(
          num,
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.white : Colors.black,
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(IconData icon, VoidCallback onTap, bool isDark) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(40),
      child: Container(
        width: 72,
        height: 72,
        alignment: Alignment.center,
        child: Icon(icon, size: 28, color: isDark ? Colors.white : Colors.black),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = context.read<AuthProvider>().user;
    final userName = user?['full_name'] ?? 'Пайдаланушы';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(flex: 2),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFF97316).withValues(alpha: 0.1),
              ),
              child: const Icon(Icons.lock_outline, size: 48, color: Color(0xFFF97316)),
            ),
            const SizedBox(height: 24),
            Text(
              'Қош келдіңіз, $userName',
              style: TextStyle(
                fontSize: 18,
                color: isDark ? Colors.white70 : Colors.black54,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'PIN-кодты енгізіңіз',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black,
              ),
            ),
            const SizedBox(height: 32),
            // PIN Dots
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (index) {
                final isFilled = index < _enteredPin.length;
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 12),
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isFilled
                        ? const Color(0xFFF97316)
                        : (isDark ? Colors.white24 : Colors.black12),
                  ),
                );
              }),
            ),
            if (_isError) ...[
              const SizedBox(height: 16),
              const Text('Қате PIN-код', style: TextStyle(color: Colors.red, fontSize: 16)),
            ] else ...[
              const SizedBox(height: 35),
            ],
            const Spacer(flex: 2),
            // Numpad
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 48),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildNumButton('1', isDark),
                      _buildNumButton('2', isDark),
                      _buildNumButton('3', isDark),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildNumButton('4', isDark),
                      _buildNumButton('5', isDark),
                      _buildNumButton('6', isDark),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildNumButton('7', isDark),
                      _buildNumButton('8', isDark),
                      _buildNumButton('9', isDark),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _useBiometrics
                          ? _buildActionButton(Icons.fingerprint, _triggerBiometrics, isDark)
                          : const SizedBox(width: 72, height: 72),
                      _buildNumButton('0', isDark),
                      _buildActionButton(Icons.backspace_outlined, _onDeletePress, isDark),
                    ],
                  ),
                ],
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () {
                context.read<AuthProvider>().logout();
              },
              child: const Text('Басқа аккаунтпен кіру', style: TextStyle(color: Colors.grey)),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
