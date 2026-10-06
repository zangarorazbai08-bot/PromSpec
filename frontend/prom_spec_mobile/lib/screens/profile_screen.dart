import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/language_provider.dart';
import '../core/translations.dart';
import '../widgets/notifications_modal.dart';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _notificationsEnabled = true;
  bool _pushAlertsEnabled = true;
  bool _biometricsEnabled = false;
  final _storage = const FlutterSecureStorage();
  final _localAuth = LocalAuthentication();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final bioStr = await _storage.read(key: 'use_biometrics');
    if (mounted) {
      setState(() {
        _biometricsEnabled = bioStr == 'true';
      });
    }
  }

  Future<void> _toggleBiometrics(bool value) async {
    if (value) {
      final canCheck = await _localAuth.canCheckBiometrics || await _localAuth.isDeviceSupported();
      if (!canCheck) {
        _showSnack('Құрылғы биометрияны қолдамайды');
        return;
      }
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Биометрияны қосу үшін растаңыз',
        // Fallback for different local_auth versions
        // If it throws an error we'll fix it, but usually biometricOnly is a direct arg in older versions
        // In local_auth 2.0+ it's options: const AuthenticationOptions(...)
        // I will just omit options for now to see if it passes basic auth
      );
      if (authenticated) {
        await _storage.write(key: 'use_biometrics', value: 'true');
        setState(() => _biometricsEnabled = true);
        _showSnack('Биометрия қосылды');
      }
    } else {
      await _storage.write(key: 'use_biometrics', value: 'false');
      setState(() => _biometricsEnabled = false);
      _showSnack('Биометрия өшірілді');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.themeMode == ThemeMode.dark;

    final fullName =
        user?['fullName'] ?? user?['full_name'] ?? 'Арман Төлегенов';
    final email = user?['email'] ?? 'user@promspec.kz';
    final role = user?['role'] ?? 'foreman';

    String getInitials(String name) {
      if (name.isEmpty) return 'U';
      final parts = name.trim().split(' ');
      if (parts.length > 1) {
        return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
      }
      return name[0].toUpperCase();
    }

    final initials = getInitials(fullName);

    final roleLabel = {
      'admin': T.get(context, 'role_admin'),
      'director': T.get(context, 'role_director'),
      'foreman': T.get(context, 'role_foreman'),
      'storekeeper': T.get(context, 'role_storekeeper'),
      'supplier': T.get(context, 'role_supplier'),
      'client': T.get(context, 'role_client'),
    }[role] ?? T.get(context, 'role_foreman');

    final roleIcon = {
      'admin': Icons.admin_panel_settings_rounded,
      'director': Icons.business_center_rounded,
      'foreman': Icons.engineering_rounded,
      'storekeeper': Icons.warehouse_rounded,
      'supplier': Icons.local_shipping_rounded,
      'client': Icons.person_rounded,
    }[role] ?? Icons.person_rounded;

    final textColor = isDark ? Colors.white : Colors.black87;
    final bgColor = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final cardColor = isDark ? const Color(0xFF1E293B) : Colors.white;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Top Bar ────────────────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFF97316), Color(0xFFEA580C)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFF97316).withValues(alpha: 0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: const Text('P',
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.bold)),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: Icon(
                              isDark
                                  ? Icons.light_mode_rounded
                                  : Icons.dark_mode_rounded,
                              color: textColor),
                          onPressed: () => themeProvider.toggleTheme(),
                        ),
                        Stack(
                          children: [
                            IconButton(
                              icon: Icon(Icons.notifications_none_rounded,
                                  color: textColor, size: 28),
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (context) =>
                                      const NotificationsModal(),
                                );
                              },
                            ),
                            Positioned(
                              right: 8,
                              top: 8,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle),
                                child: const Text('1',
                                    style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // ── Title ──────────────────────────────────────────────────
                Text('prof_account'.tr(context),
                    style: const TextStyle(
                        color: Color(0xFFF97316),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2)),
                const SizedBox(height: 6),
                Text('nav_profile'.tr(context),
                    style: TextStyle(
                        color: textColor,
                        fontSize: 32,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),

                // ── User Card ──────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 16,
                          offset: const Offset(0, 6)),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Avatar
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFF97316), Color(0xFFEA580C)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                                color: const Color(0xFFF97316).withValues(alpha: 0.4),
                                blurRadius: 12,
                                offset: const Offset(0, 4)),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: Text(initials,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(fullName,
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(roleIcon, color: Colors.white70, size: 14),
                                const SizedBox(width: 4),
                                Text('$roleLabel • Green Park',
                                    style: const TextStyle(
                                        color: Colors.white70, fontSize: 13)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(email,
                                style: const TextStyle(
                                    color: Colors.white54, fontSize: 12)),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF22C55E).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                    color: const Color(0xFF22C55E).withValues(alpha: 0.4)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.verified_rounded,
                                      color: Color(0xFF22C55E), size: 12),
                                  const SizedBox(width: 4),
                                  Text(T.get(context, 'prof_verified'),
                                      style: const TextStyle(
                                          color: Color(0xFF22C55E),
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // ── Section: Жеке мәліметтер ──────────────────────────────
                _sectionTitle('prof_sec_personal'.tr(context), textColor),
                const SizedBox(height: 12),
                _buildMenuCard(cardColor, [
                  _menuItem(
                    icon: Icons.person_outline_rounded,
                    iconColor: Colors.blue,
                    title: 'prof_name'.tr(context),
                    trailing: Text(fullName.split(' ').first,
                        style: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black45,
                            fontSize: 13)),
                    onTap: () => _showEditFieldDialog(context, authProvider, 'full_name', 'prof_name'.tr(context), fullName, isDark),
                    isDark: isDark,
                    textColor: textColor,
                  ),
                  _menuItem(
                    icon: Icons.email_outlined,
                    iconColor: Colors.purple,
                    title: 'Email',
                    trailing: Text(email,
                        style: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black45,
                            fontSize: 12)),
                    onTap: () => _showEditFieldDialog(context, authProvider, 'email', 'Email', email, isDark),
                    isDark: isDark,
                    textColor: textColor,
                  ),
                  _menuItem(
                    icon: Icons.phone_outlined,
                    iconColor: Colors.green,
                    title: 'Телефон',
                    trailing: Text(user?['phone'] ?? '+7 *** *** ** **',
                        style: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black45,
                            fontSize: 13)),
                    onTap: () => _showEditFieldDialog(context, authProvider, 'phone', 'Телефон', user?['phone'] ?? '', isDark),
                    isDark: isDark,
                    textColor: textColor,
                    showDivider: false,
                  ),
                ]),

                const SizedBox(height: 20),

                // ── Section: Қауіпсіздік ──────────────────────────────────
                _sectionTitle('prof_sec_security'.tr(context), textColor),
                const SizedBox(height: 12),
                _buildMenuCard(cardColor, [
                  _menuItem(
                    icon: Icons.lock_outline_rounded,
                    iconColor: Colors.orange,
                    title: 'prof_pass'.tr(context),
                    onTap: () => _showChangePasswordDialog(context, authProvider, isDark),
                    isDark: isDark,
                    textColor: textColor,
                  ),
                  _menuItem(
                    icon: Icons.pin_outlined,
                    iconColor: Colors.teal,
                    title: 'PIN-код орнату',
                    onTap: () => _showPinDialog(context, isDark),
                    isDark: isDark,
                    textColor: textColor,
                  ),
                  _menuItem(
                    icon: Icons.fingerprint_rounded,
                    iconColor: Colors.indigo,
                    title: 'Биометриялық кіру',
                    trailing: Switch(
                      value: _biometricsEnabled,
                      onChanged: (val) => _toggleBiometrics(val),
                      activeThumbColor: const Color(0xFFF97316),
                    ),
                    onTap: null,
                    isDark: isDark,
                    textColor: textColor,
                    showDivider: false,
                  ),
                ]),

                const SizedBox(height: 20),

                // ── Section: Хабарламалар ─────────────────────────────────
                _sectionTitle('prof_sec_notifs'.tr(context), textColor),
                const SizedBox(height: 12),
                _buildMenuCard(cardColor, [
                  _menuItem(
                    icon: Icons.notifications_active_outlined,
                    iconColor: Colors.red,
                    title: 'prof_push'.tr(context),
                    trailing: Switch(
                      value: _notificationsEnabled,
                      onChanged: (val) =>
                          setState(() => _notificationsEnabled = val),
                      activeThumbColor: const Color(0xFFF97316),
                    ),
                    onTap: null,
                    isDark: isDark,
                    textColor: textColor,
                  ),
                  _menuItem(
                    icon: Icons.warning_amber_outlined,
                    iconColor: Colors.orange,
                    title: 'prof_alerts'.tr(context),
                    trailing: Switch(
                      value: _pushAlertsEnabled,
                      onChanged: (val) =>
                          setState(() => _pushAlertsEnabled = val),
                      activeThumbColor: const Color(0xFFF97316),
                    ),
                    onTap: null,
                    isDark: isDark,
                    textColor: textColor,
                    showDivider: false,
                  ),
                ]),

                const SizedBox(height: 20),

                // ── Section: Жалпы ────────────────────────────────────────
                _sectionTitle('prof_sec_general'.tr(context), textColor),
                const SizedBox(height: 12),
                _buildMenuCard(cardColor, [
                  _menuItem(
                    icon: Icons.language_rounded,
                    iconColor: Colors.blue,
                    title: 'prof_lang'.tr(context),
                    trailing: Text(context.watch<LanguageProvider>().currentLang.toUpperCase(),
                        style: TextStyle(
                            color: isDark ? Colors.white54 : Colors.black45,
                            fontSize: 13)),
                    onTap: () => _showLanguageDialog(context, isDark),
                    isDark: isDark,
                    textColor: textColor,
                  ),
                  _menuItem(
                    icon: Icons.dark_mode_rounded,
                    iconColor: Colors.purple,
                    title: 'prof_dark'.tr(context),
                    trailing: Switch(
                      value: isDark,
                      onChanged: (_) => themeProvider.toggleTheme(),
                      activeThumbColor: const Color(0xFFF97316),
                    ),
                    onTap: null,
                    isDark: isDark,
                    textColor: textColor,
                  ),
                  _menuItem(
                    icon: Icons.headset_mic_outlined,
                    iconColor: Colors.teal,
                    title: 'prof_support'.tr(context),
                    onTap: () => _showSnack('Қолдау: +7 701 234 5678'),
                    isDark: isDark,
                    textColor: textColor,
                    showDivider: false,
                  ),
                ]),

                const SizedBox(height: 20),

                // ── Logout Button ─────────────────────────────────────────
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: OutlinedButton.icon(
                    onPressed: () => _confirmLogout(context, authProvider),
                    icon: const Icon(Icons.logout_rounded,
                        color: Colors.red),
                    label: Text('prof_logout'.tr(context),
                        style: const TextStyle(
                            color: Colors.red,
                            fontSize: 16,
                            fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red, width: 1.5),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),

                const SizedBox(height: 24),
                Center(
                  child: Text('PromSpec Supply v2.4.0',
                      style: TextStyle(
                          color: isDark ? Colors.grey[600] : Colors.grey[400],
                          fontSize: 12)),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  Widget _sectionTitle(String title, Color textColor) {
    return Text(title,
        style: TextStyle(
            color: textColor, fontSize: 16, fontWeight: FontWeight.bold));
  }

  Widget _buildMenuCard(Color cardColor, List<Widget> items) {
    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(children: items),
    );
  }

  Widget _menuItem({
    required IconData icon,
    required Color iconColor,
    required String title,
    Widget? trailing,
    required VoidCallback? onTap,
    required bool isDark,
    required Color textColor,
    bool showDivider = true,
  }) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: iconColor, size: 18),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(title,
                      style: TextStyle(
                          color: textColor,
                          fontSize: 15,
                          fontWeight: FontWeight.w500)),
                ),
                trailing ??
                    Icon(Icons.chevron_right_rounded,
                        color: isDark ? Colors.white38 : Colors.black38),
              ],
            ),
          ),
        ),
        if (showDivider)
          Divider(
              height: 1,
              thickness: 0.5,
              color: Colors.grey.withValues(alpha: 0.15),
              indent: 16,
              endIndent: 16),
      ],
    );
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg), duration: const Duration(seconds: 2)));
  }

  void _showEditFieldDialog(BuildContext context, AuthProvider authProvider, String fieldKey, String title, String currentValue, bool isDark) {
    final ctrl = TextEditingController(text: currentValue);
    bool isLoading = false;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (context, setState) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(title,
              style: TextStyle(color: isDark ? Colors.white : Colors.black)),
          content: TextField(
            controller: ctrl,
            style: TextStyle(color: isDark ? Colors.white : Colors.black),
            decoration: InputDecoration(
              hintStyle: TextStyle(color: isDark ? Colors.white54 : Colors.black54),
            ),
          ),
          actions: [
            TextButton(
                onPressed: isLoading ? null : () => Navigator.pop(ctx),
                child: Text('cancel'.tr(context))),
            ElevatedButton(
              onPressed: isLoading ? null : () async {
                setState(() => isLoading = true);
                try {
                  await authProvider.updateProfile({fieldKey: ctrl.text.trim()});
                  if (ctx.mounted) Navigator.pop(ctx);
                  _showSnack('Сәтті сақталды');
                } catch (e) {
                  _showSnack('Қате: ${e.toString().replaceAll('Exception: ', '')}');
                } finally {
                  if (ctx.mounted) setState(() => isLoading = false);
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF97316)),
              child: isLoading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('save'.tr(context), style: const TextStyle(color: Colors.white)),
            ),
          ],
        );
      }),
    );
  }

  void _showChangePasswordDialog(BuildContext context, AuthProvider authProvider, bool isDark) {
    final oldCtrl = TextEditingController();
    final newCtrl = TextEditingController();
    bool isLoading = false;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(builder: (context, setState) {
        return AlertDialog(
          backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text('prof_pass'.tr(context),
              style: TextStyle(color: isDark ? Colors.white : Colors.black)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: oldCtrl,
                obscureText: true,
                style: TextStyle(color: isDark ? Colors.white : Colors.black),
                decoration: const InputDecoration(hintText: 'Ескі құпия сөз'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: newCtrl,
                obscureText: true,
                style: TextStyle(color: isDark ? Colors.white : Colors.black),
                decoration: const InputDecoration(hintText: 'Жаңа құпия сөз'),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: isLoading ? null : () => Navigator.pop(ctx),
                child: Text('cancel'.tr(context))),
            ElevatedButton(
              onPressed: isLoading ? null : () async {
                setState(() => isLoading = true);
                try {
                  await authProvider.updatePassword(oldCtrl.text, newCtrl.text);
                  if (ctx.mounted) Navigator.pop(ctx);
                  _showSnack('✅ Құпия сөз сәтті өзгертілді!');
                } catch (e) {
                  _showSnack('Қате: ${e.toString().replaceAll('Exception: ', '')}');
                } finally {
                  if (ctx.mounted) setState(() => isLoading = false);
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF97316)),
              child: isLoading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : Text('save'.tr(context), style: const TextStyle(color: Colors.white)),
            ),
          ],
        );
      }),
    );
  }

  void _showPinDialog(BuildContext context, bool isDark) {
    final pinCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('PIN-код орнату',
            style: TextStyle(color: isDark ? Colors.white : Colors.black)),
        content: TextField(
          controller: pinCtrl,
          keyboardType: TextInputType.number,
          obscureText: true,
          maxLength: 4,
          style: TextStyle(
              color: isDark ? Colors.white : Colors.black,
              fontSize: 24,
              letterSpacing: 12),
          decoration: const InputDecoration(
              hintText: '4 санды PIN', counterText: ''),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('cancel'.tr(context))),
          ElevatedButton(
            onPressed: () async {
              if (pinCtrl.text.length != 4) {
                _showSnack('PIN-код 4 саннан тұруы керек');
                return;
              }
              await _storage.write(key: 'user_pin', value: pinCtrl.text);
              if (ctx.mounted) Navigator.pop(ctx);
              _showSnack('✅ PIN-код сақталды!');
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF97316)),
            child: Text('save'.tr(context), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showLanguageDialog(BuildContext context, bool isDark) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Тілді таңдаңыз',
            style: TextStyle(color: isDark ? Colors.white : Colors.black)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            {'code': 'kk', 'label': 'Қазақша'},
            {'code': 'ru', 'label': 'Русский'},
            {'code': 'en', 'label': 'English'},
          ].map((lang) {
            final isSelected = context.watch<LanguageProvider>().currentLang == lang['code'];
            return ListTile(
              title: Text(lang['label']!,
                  style: TextStyle(
                      color: isDark ? Colors.white : Colors.black,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
              leading: Icon(
                  isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                  color: isSelected ? const Color(0xFFF97316) : Colors.grey),
              onTap: () {
                context.read<LanguageProvider>().setLanguage(lang['code']!);
                Navigator.pop(ctx);
                _showSnack('Тіл өзгертілді: ${lang['label']}');
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext context, AuthProvider authProvider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('prof_logout'.tr(context),
            style: TextStyle(color: isDark ? Colors.white : Colors.black)),
        content: Text(
            'Жүйеден шығуды растаңыз.',
            style: TextStyle(color: isDark ? Colors.white70 : Colors.black54)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('cancel'.tr(context))),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              authProvider.logout();
              context.go('/login');
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: Text('prof_logout'.tr(context)),
          ),
        ],
      ),
    );
  }
}
