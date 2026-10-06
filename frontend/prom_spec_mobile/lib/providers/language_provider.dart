import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider with ChangeNotifier {
  String _currentLang = 'kk'; // 'kk', 'ru', 'en'

  String get currentLang => _currentLang;

  LanguageProvider() {
    _loadLang();
  }

  Future<void> _loadLang() async {
    final prefs = await SharedPreferences.getInstance();
    _currentLang = prefs.getString('pss_lang') ?? 'kk';
    notifyListeners();
  }

  Future<void> setLanguage(String langCode) async {
    if (_currentLang == langCode) return;
    _currentLang = langCode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('pss_lang', langCode);
  }
}
