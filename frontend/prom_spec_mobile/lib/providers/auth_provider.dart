import 'package:flutter/material.dart';
import '../core/api.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  AuthProvider() {
    checkAuth();
  }

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;

  // Premium status check
  bool get isPremium {
    if (_user == null) return false;
    final premiumStatus = _user!['is_premium'];
    if (premiumStatus == true || premiumStatus == 1 || premiumStatus == 'true') {
      // Check expiry date if it exists
      if (_user!['premium_expiry'] != null) {
        final expiry = DateTime.parse(_user!['premium_expiry'].toString());
        return expiry.isAfter(DateTime.now());
      }
      return true; // Premium active, no expiry date limit
    }
    return false;
  }

  // Premium expiration warning (e.g., 3 days left)
  bool get shouldShowRenewalWarning {
    if (!isPremium || _user == null || _user!['premium_expiry'] == null) return false;
    final expiry = DateTime.parse(_user!['premium_expiry'].toString());
    return expiry.difference(DateTime.now()).inDays <= 3;
  }

  bool _isLocked = false;
  bool get isLocked => _isLocked;

  Future<void> checkAuth() async {
    _isLoading = true;
    try {
      final res = await AuthApi.me();
      _user = res['user'];
      
      final storage = const FlutterSecureStorage();
      final pin = await storage.read(key: 'user_pin');
      final bio = await storage.read(key: 'use_biometrics');
      if (pin != null || bio == 'true') {
        _isLocked = true;
      }
    } catch (e) {
      _user = null;
    }
    _isLoading = false;
    notifyListeners();
  }

  void unlockApp() {
    _isLocked = false;
    notifyListeners();
  }

  Future<void> login(String loginStr, String password) async {
    try {
      final res = await AuthApi.login({'email': loginStr, 'password': password});
      if (res['user'] != null) {
        _user = res['user'];
      } else {
        final meRes = await AuthApi.me();
        _user = meRes['user'];
      }
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> oauthLogin(String provider) async {
    try {
      final res = await AuthApi.oauthMock(provider);
      if (res['user'] != null) {
        _user = res['user'];
      } else {
        final meRes = await AuthApi.me();
        _user = meRes['user'];
      }
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> register(String fullName, String email, String password) async {
    try {
      final res = await AuthApi.register({
        'full_name': fullName,
        'email': email,
        'password': password,
        'role': 'client',
        'phone': ''
      });
      if (res['user'] != null) {
        _user = res['user'];
      } else {
        final meRes = await AuthApi.me();
        _user = meRes['user'];
      }
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    final res = await UsersApi.updateProfile(data);
    if (res['user'] != null) {
      _user = res['user'];
      notifyListeners();
    }
  }

  Future<void> updatePassword(String oldPassword, String newPassword) async {
    await UsersApi.updatePassword(oldPassword, newPassword);
  }

  Future<void> logout() async {
    await AuthApi.logout();
    _user = null;
    notifyListeners();
  }
}
