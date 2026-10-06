import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api.dart';
import '../providers/theme_provider.dart';

class NotificationsModal extends StatefulWidget {
  const NotificationsModal({super.key});

  @override
  State<NotificationsModal> createState() => _NotificationsModalState();
}

class _NotificationsModalState extends State<NotificationsModal> {
  List<dynamic> _alerts = [];
  bool _isLoading = true;

  // Статикалық хабарламалар
  final List<Map<String, dynamic>> _staticNotifications = [
    {
      'title': 'Өтінім мақұлданды',
      'message': 'REQ-0247 өтінімін Директор мақұлдады.',
      'time': '8 минут бұрын',
      'icon': Icons.check_circle_rounded,
      'iconBgColor': Color(0xFFDCFCE7),
      'iconColor': Color(0xFF16A34A),
      'isUnread': true,
    },
    {
      'title': 'Апталық есеп дайын',
      'message': 'Құрылыс нысандары бойынша шығын есебі.',
      'time': 'Кеше, 18:40',
      'icon': Icons.trending_up_rounded,
      'iconBgColor': Color(0xFFDBEAFE),
      'iconColor': Color(0xFF2563EB),
      'isUnread': false,
    },
    {
      'title': 'Жаңа пайдаланушы тіркелді',
      'message': 'Жаңа прораб аккаунты расталуды күтуде.',
      'time': '2 күн бұрын',
      'icon': Icons.person_add_rounded,
      'iconBgColor': Color(0xFFF3E8FF),
      'iconColor': Color(0xFF7C3AED),
      'isUnread': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadAlerts();
  }

  Future<void> _loadAlerts() async {
    try {
      final res = await DashboardApi.alerts();
      if (mounted) {
        setState(() {
          _alerts = (res as Map<String, dynamic>?)?['alerts'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.themeMode == ThemeMode.dark;
    final bgColor = isDark ? const Color(0xFF1E293B) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      constraints:
          BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.88),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[700] : Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('ОРТАЛЫҚ',
                          style: TextStyle(
                              color: Color(0xFFF97316),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2)),
                      const SizedBox(height: 4),
                      Text('Хабарландырулар',
                          style: TextStyle(
                              color: textColor,
                              fontSize: 24,
                              fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Row(
                    children: [
                      if (_alerts.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('${_alerts.length} ескерту',
                              style: const TextStyle(
                                  color: Colors.red,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold)),
                        ),
                      const SizedBox(width: 8),
                      IconButton(
                          icon: Icon(Icons.close, color: textColor),
                          onPressed: () => Navigator.pop(context)),
                    ],
                  ),
                ],
              ),
            ),

            // List
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                children: [
                  // Smart Alerts from backend
                  if (_isLoading)
                    const Center(child: CircularProgressIndicator(color: Color(0xFFF97316)))
                  else if (_alerts.isNotEmpty) ...[
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text('⚠️ Аз қор ескертулері',
                          style: TextStyle(
                              color: Colors.red,
                              fontSize: 13,
                              fontWeight: FontWeight.bold)),
                    ),
                    ..._alerts.take(5).map((alert) {
                      final level = alert['alert_level'] ?? 'medium';
                      final color = level == 'critical'
                          ? Colors.red
                          : level == 'high'
                              ? Colors.deepOrange
                              : Colors.orange;
                      return Column(
                        children: [
                          _buildNotificationItem(
                            title:
                                '${level == 'critical' ? '🔴 Критикалық' : level == 'high' ? '🟠 Жоғары' : '🟡 Орташа'}: ${alert['name']}',
                            message:
                                'Қалды: ${alert['current_quantity']} ${alert['unit']} (мин: ${alert['min_quantity']} ${alert['unit']})',
                            time: 'Автоматты ескерту',
                            icon: Icons.warning_amber_rounded,
                            iconBgColor: color.withValues(alpha: 0.1),
                            iconColor: color,
                            isUnread: true,
                            isDark: isDark,
                            textColor: textColor,
                          ),
                          _buildDivider(isDark),
                        ],
                      );
                    }),
                    const SizedBox(height: 8),
                  ],

                  // Static notifications
                  ..._staticNotifications.map((n) => Column(
                        children: [
                          _buildNotificationItem(
                            title: n['title'],
                            message: n['message'],
                            time: n['time'],
                            icon: n['icon'],
                            iconBgColor: n['iconBgColor'],
                            iconColor: n['iconColor'],
                            isUnread: n['isUnread'],
                            isDark: isDark,
                            textColor: textColor,
                          ),
                          _buildDivider(isDark),
                        ],
                      )),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationItem({
    required String title,
    required String message,
    required String time,
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required bool isUnread,
    required bool isDark,
    required Color textColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        color: textColor,
                        fontSize: 14,
                        fontWeight:
                            isUnread ? FontWeight.bold : FontWeight.w500)),
                const SizedBox(height: 4),
                Text(message,
                    style: TextStyle(
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                        fontSize: 12,
                        height: 1.4)),
                const SizedBox(height: 6),
                Text(time,
                    style: TextStyle(
                        color: isDark ? Colors.grey[500] : Colors.grey[400],
                        fontSize: 11)),
              ],
            ),
          ),
          if (isUnread)
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(top: 6, left: 4),
              decoration: const BoxDecoration(
                  color: Color(0xFFF97316), shape: BoxShape.circle),
            ),
        ],
      ),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Divider(
        height: 1,
        thickness: 0.5,
        color: isDark ? Colors.grey[800] : Colors.grey[200]);
  }
}
