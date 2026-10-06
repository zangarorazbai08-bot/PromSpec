import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

class Api {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api';
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      // Direct connection via WiFi - firewall port 5000 is now open
      return 'http://10.202.20.126:5000/api';
    }
    return 'http://localhost:5000/api';
  }

  static Future<Map<String, String>> get headers async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('pss_token');
    return {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true', // Required for localtunnel
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<dynamic> request(String path,
      {String method = 'GET', Map<String, dynamic>? body}) async {
    final uri = Uri.parse('$baseUrl$path');
    final h = await headers;
    http.Response response;

    try {
      if (method == 'POST') {
        response = await http
            .post(uri, headers: h, body: body != null ? jsonEncode(body) : null)
            .timeout(const Duration(seconds: 15));
      } else if (method == 'PUT') {
        response = await http
            .put(uri, headers: h, body: body != null ? jsonEncode(body) : null)
            .timeout(const Duration(seconds: 15));
      } else if (method == 'PATCH') {
        response = await http
            .patch(uri, headers: h, body: body != null ? jsonEncode(body) : null)
            .timeout(const Duration(seconds: 15));
      } else {
        response = await http
            .get(uri, headers: h)
            .timeout(const Duration(seconds: 15));
      }
    } catch (e) {
      throw Exception('Желі қатесі: $e');
    }

    dynamic data;
    if (response.headers['content-type']?.contains('application/json') ?? false) {
      data = jsonDecode(response.body);
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data?['message'] ?? 'Сұраныс сәтсіз: ${response.statusCode}');
    }
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
class AuthApi {
  static Future<dynamic> register(Map<String, dynamic> data) async {
    final res = await Api.request('/auth/register', method: 'POST', body: data);
    if (res['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('pss_token', res['token']);
    }
    return res;
  }

  static Future<dynamic> login(Map<String, dynamic> data) async {
    final res = await Api.request('/auth/login', method: 'POST', body: data);
    if (res['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('pss_token', res['token']);
    }
    return res;
  }

  static Future<dynamic> oauthMock(String provider) async {
    final res = await Api.request('/auth/oauth-mock', method: 'POST', body: {'provider': provider});
    if (res['token'] != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('pss_token', res['token']);
    }
    return res;
  }

  static Future<dynamic> me() => Api.request('/auth/me');

  static Future<void> logout() async {
    try {
      await Api.request('/auth/logout', method: 'POST');
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('pss_token');
  }
}

// ─── Materials ────────────────────────────────────────────────────────────────
class MaterialsApi {
  static Future<dynamic> list({String? search}) =>
      Api.request('/materials${search != null ? '?search=${Uri.encodeComponent(search)}' : ''}');

  static Future<dynamic> summary() => Api.request('/materials/summary');
}

// ─── Requests ─────────────────────────────────────────────────────────────────
class RequestsApi {
  static Future<dynamic> list({String? status}) =>
      Api.request('/requests${status != null ? '?status=$status' : ''}');

  static Future<dynamic> createSimple(Map<String, dynamic> data) =>
      Api.request('/requests/simple', method: 'POST', body: data);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
class DashboardApi {
  static Future<dynamic> stats() => Api.request('/dashboard/stats');
  static Future<dynamic> alerts() => Api.request('/dashboard/alerts');

  static Future<dynamic> aiChat(String message) =>
      Api.request('/dashboard/ai-chat', method: 'POST', body: {'message': message});
}

// ─── Users ────────────────────────────────────────────────────────────────────
class UsersApi {
  static Future<dynamic> list() => Api.request('/users');
  static Future<dynamic> updateProfile(Map<String, dynamic> data) => Api.request('/users/profile', method: 'PUT', body: data);
  static Future<dynamic> updatePassword(String oldPassword, String newPassword) => Api.request('/users/profile/password', method: 'PUT', body: {'oldPassword': oldPassword, 'newPassword': newPassword});
}
