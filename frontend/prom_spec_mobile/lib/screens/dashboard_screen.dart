import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'dart:math' as math;
import '../core/api.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../core/translations.dart';
import '../widgets/notifications_modal.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  Map<String, dynamic>? _stats;
  List<dynamic> _alerts = [];
  bool _isLoading = true;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _loadData();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        DashboardApi.stats(),
        DashboardApi.alerts(),
      ]);
      if (mounted) {
        setState(() {
          _stats = results[0];
          _alerts = (results[1] as Map<String, dynamic>?)?['alerts'] ?? [];
          _isLoading = false;
        });
        _animController.forward();
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _getCurrentDate() {
    final now = DateTime.now();
    const weekdays = ['Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі', 'Жексенбі'];
    const months = ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
      'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'];
    return '${weekdays[now.weekday - 1].toUpperCase()}, ${now.day} ${months[now.month - 1].toUpperCase()}';
  }

  void _showAiScannerDialog(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const AiScannerDialog(),
    );
  }

  void _showPromAiDialog(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const PromAiDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.themeMode == ThemeMode.dark;
    final textColor = isDark ? Colors.white : Colors.black87;
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;
    final fullName = user?['fullName'] ?? user?['full_name'] ?? 'Пайдаланушы';
    final firstName = fullName.toString().split(' ').first;

    final requestsCount = _stats?['requestsCount'] ?? 0;
    final pendingCount = _stats?['pendingRequests'] ?? 0;
    final lowStockCount = _stats?['lowStockCount'] ?? 0;

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadData,
        color: const Color(0xFFF97316),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFFF97316)))
            : FadeTransition(
                opacity: _fadeAnim,
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  children: [
                    // ── Top Bar ──────────────────────────────────────────────
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Logo
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
                            // Dark/Light toggle
                            IconButton(
                              icon: Icon(
                                  isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                                  color: textColor),
                              onPressed: () => themeProvider.toggleTheme(),
                            ),
                            // AI Chatbot button
                            IconButton(
                              icon: Icon(Icons.auto_awesome_rounded,
                                  color: const Color(0xFFF97316)),
                              onPressed: () => _showPromAiDialog(context, isDark),
                              tooltip: 'Prom AI',
                            ),
                            // Notifications
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
                                      builder: (context) => const NotificationsModal(),
                                    );
                                  },
                                ),
                                if (_alerts.isNotEmpty)
                                  Positioned(
                                    right: 8,
                                    top: 8,
                                    child: Container(
                                      padding: const EdgeInsets.all(4),
                                      decoration: const BoxDecoration(
                                          color: Colors.red, shape: BoxShape.circle),
                                      child: Text(
                                        '${_alerts.length}',
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // ── Header ───────────────────────────────────────────────
                    Text(
                      _getCurrentDate(),
                      style: const TextStyle(
                          color: Color(0xFFF97316),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2),
                    ),
                    Text(
                      '${'dash_greeting'.tr(context)}, $firstName!',
                      style: TextStyle(
                          color: textColor,
                          fontSize: 28,
                          fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'dash_project'.tr(context),
                      style: TextStyle(
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                          fontSize: 14),
                    ),
                    const SizedBox(height: 28),

                    // ── Smart Alert Banner ────────────────────────────────────
                    if (_alerts.isNotEmpty)
                      _buildAlertBanner(_alerts, isDark),

                    if (_alerts.isNotEmpty) const SizedBox(height: 16),

                    // ── Active Requests Card ──────────────────────────────────
                    _buildActiveRequestsCard(requestsCount, isDark),
                    const SizedBox(height: 16),

                    // ── 2 Column Cards ────────────────────────────────────────
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            label: 'dash_pending'.tr(context),
                            value: '$pendingCount',
                            subLabel: pendingCount > 0 ? '$pendingCount ${'dash_urgent_reqs'.tr(context)}' : 'dash_all_approved'.tr(context),
                            subColor: pendingCount > 0 ? Colors.orange : Colors.green,
                            icon: Icons.access_time_rounded,
                            onTap: () => context.go('/requests'),
                            isDark: isDark,
                            textColor: textColor,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildStatCard(
                            label: 'dash_low_stock'.tr(context),
                            value: '$lowStockCount',
                            subLabel: lowStockCount > 0 ? '$lowStockCount ${'dash_critical_items'.tr(context)}' : 'dash_stock_ok'.tr(context),
                            subColor: lowStockCount > 0 ? Colors.redAccent : Colors.green,
                            icon: Icons.warning_amber_rounded,
                            onTap: () => context.go('/materials'),
                            isDark: isDark,
                            textColor: textColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // ── Quick Actions ─────────────────────────────────────────
                    Text('dash_quick_actions'.tr(context),
                        style: TextStyle(
                            color: textColor,
                            fontSize: 18,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),

                    // AI Scanner
                    _buildActionCard(
                      icon: Icons.qr_code_scanner_rounded,
                      title: 'dash_ai_scanner'.tr(context),
                      subtitle: 'dash_ai_scanner_sub'.tr(context),
                      isDark: isDark,
                      textColor: textColor,
                      onTap: () => _showAiScannerDialog(context, isDark),
                      gradient: const [Color(0xFF7C3AED), Color(0xFF6D28D9)],
                    ),
                    const SizedBox(height: 12),

                    // New Request
                    _buildActionCard(
                      icon: Icons.add_circle_outline_rounded,
                      title: 'dash_new_req'.tr(context),
                      subtitle: 'dash_new_req_sub'.tr(context),
                      isDark: isDark,
                      textColor: textColor,
                      onTap: () => context.go('/requests'),
                      gradient: const [Color(0xFF0EA5E9), Color(0xFF0284C7)],
                    ),
                    const SizedBox(height: 12),

                    // Prom AI Chat
                    _buildActionCard(
                      icon: Icons.smart_toy_rounded,
                      title: 'dash_prom_ai'.tr(context),
                      subtitle: 'dash_prom_ai_sub'.tr(context),
                      isDark: isDark,
                      textColor: textColor,
                      onTap: () => _showPromAiDialog(context, isDark),
                      gradient: const [Color(0xFFF97316), Color(0xFFEA580C)],
                    ),

                    const SizedBox(height: 32),

                    // ── Recent Transactions ───────────────────────────────────
                    if (_stats?['recentTransactions'] != null &&
                        (_stats!['recentTransactions'] as List).isNotEmpty) ...[
                      Text('dash_recent_tx'.tr(context),
                          style: TextStyle(
                              color: textColor,
                              fontSize: 18,
                              fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      ..._buildRecentTransactions(
                          _stats!['recentTransactions'] as List, isDark, textColor),
                    ],
                    const SizedBox(height: 32),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildAlertBanner(List<dynamic> alerts, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('dash_alert_title'.tr(context),
                    style: const TextStyle(
                        color: Colors.red,
                        fontSize: 13,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  alerts.take(2).map((a) => '${a['name']}: ${a['current_quantity']} ${a['unit']}').join(' • '),
                  style: TextStyle(
                      color: Colors.red.withValues(alpha: 0.8), fontSize: 11),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.go('/materials'),
            child: Text('dash_alert_view'.tr(context),
                style: const TextStyle(color: Colors.red, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveRequestsCard(int count, bool isDark) {
    return InkWell(
      onTap: () => context.go('/requests'),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('dash_active_reqs'.tr(context),
                    style: const TextStyle(color: Colors.white70, fontSize: 14)),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF97316).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.assignment_outlined,
                      color: Color(0xFFF97316), size: 20),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              '$count',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  height: 1),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF22C55E).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.arrow_upward, color: Color(0xFF22C55E), size: 12),
                      const SizedBox(width: 2),
                      Text('dash_active_badge'.tr(context), style: const TextStyle(color: Color(0xFF22C55E), fontSize: 11)),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text('dash_project_name'.tr(context),
                    style: const TextStyle(color: Colors.white38, fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required String subLabel,
    required Color subColor,
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
    required Color textColor,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label,
                    style: TextStyle(
                        color: isDark ? Colors.white70 : Colors.black54,
                        fontSize: 11)),
                Icon(icon,
                    color: isDark ? Colors.white38 : Colors.black38,
                    size: 16),
              ],
            ),
            const SizedBox(height: 12),
            Text(value,
                style: TextStyle(
                    color: textColor, fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(subLabel,
                style: TextStyle(color: subColor, fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isDark,
    required Color textColor,
    required VoidCallback onTap,
    required List<Color> gradient,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: gradient[0].withValues(alpha: 0.2)),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2)),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                    colors: gradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: gradient[0].withValues(alpha: 0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(icon, color: Colors.white, size: 26),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          color: textColor,
                          fontSize: 15,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 3),
                  Text(subtitle,
                      style: TextStyle(
                          color: isDark ? Colors.white54 : Colors.black54,
                          fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded,
                color: isDark ? Colors.white38 : Colors.black38),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildRecentTransactions(
      List<dynamic> txs, bool isDark, Color textColor) {
    return txs.take(4).map((tx) {
      final isIn = tx['type'] == 'in';
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: (isIn ? Colors.green : Colors.orange).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                isIn ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                color: isIn ? Colors.green : Colors.orange,
                size: 16,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tx['material_name'] ?? '',
                      style: TextStyle(
                          color: textColor,
                          fontSize: 13,
                          fontWeight: FontWeight.w600)),
                  Text(tx['user_name'] ?? '',
                      style: TextStyle(
                          color: isDark ? Colors.white38 : Colors.black38,
                          fontSize: 11)),
                ],
              ),
            ),
            Text(
              '${isIn ? '+' : '-'}${tx['quantity']} ${tx['unit'] ?? 'дана'}',
              style: TextStyle(
                  color: isIn ? Colors.green : Colors.orange,
                  fontSize: 13,
                  fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
    }).toList();
  }
}

// ─── AI Scanner Dialog ─────────────────────────────────────────────────────────
class AiScannerDialog extends StatefulWidget {
  const AiScannerDialog({super.key});

  @override
  State<AiScannerDialog> createState() => _AiScannerDialogState();
}

class _AiScannerDialogState extends State<AiScannerDialog>
    with SingleTickerProviderStateMixin {
  bool _scanning = false;
  Map<String, dynamic>? _result;
  late AnimationController _scanAnim;

  @override
  void initState() {
    super.initState();
    _scanAnim = AnimationController(
        vsync: this, duration: const Duration(seconds: 2))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _scanAnim.dispose();
    super.dispose();
  }

  Future<void> _startScan() async {
    setState(() {
      _scanning = true;
      _result = null;
    });

    // Mock AI scan result (real implementation: image_picker + backend)
    await Future.delayed(const Duration(seconds: 2));

    final mockResults = [
      {'name': 'Цемент M400', 'confidence': 94, 'unit': 'қап', 'in_stock': 18, 'status': 'Аз қалды'},
      {'name': 'Арматура А500С', 'confidence': 89, 'unit': 'тонна', 'in_stock': 1.4, 'status': 'Норма'},
      {'name': 'Кірпіш M150', 'confidence': 92, 'unit': 'дана', 'in_stock': 640, 'status': 'Жеткілікті'},
    ];
    final rnd = math.Random();

    if (mounted) {
      setState(() {
        _scanning = false;
        _result = mockResults[rnd.nextInt(mockResults.length)];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF1E293B) : Colors.white;

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2))),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                    gradient: const LinearGradient(
                        colors: [Color(0xFF7C3AED), Color(0xFF6D28D9)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight),
                    borderRadius: BorderRadius.circular(14)),
                child: const Icon(Icons.qr_code_scanner_rounded,
                    color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('AI Сканер',
                      style: TextStyle(
                          color: isDark ? Colors.white : Colors.black,
                          fontSize: 20,
                          fontWeight: FontWeight.bold)),
                  Text('Материалды суреттен тану',
                      style: TextStyle(
                          color: isDark ? Colors.white54 : Colors.black54,
                          fontSize: 12)),
                ],
              ),
              const Spacer(),
              IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 24),

          // Camera Frame
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: const Color(0xFF7C3AED).withValues(alpha: 0.5),
                    width: 2),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Placeholder camera view
                    Container(
                      color: const Color(0xFF0F172A),
                      child: const Center(
                        child: Icon(Icons.camera_alt_rounded,
                            color: Colors.white38, size: 64),
                      ),
                    ),
                    // Scanning animation
                    if (_scanning)
                      AnimatedBuilder(
                        animation: _scanAnim,
                        builder: (context, child) {
                          return Positioned(
                            top: _scanAnim.value *
                                (MediaQuery.of(context).size.height * 0.3),
                            left: 0,
                            right: 0,
                            child: Container(
                              height: 2,
                              color: const Color(0xFF7C3AED).withValues(alpha: 0.8),
                            ),
                          );
                        },
                      ),
                    // Corner brackets
                    Positioned(
                      top: 20,
                      left: 20,
                      child: _cornerBracket(true, true),
                    ),
                    Positioned(
                      top: 20,
                      right: 20,
                      child: _cornerBracket(true, false),
                    ),
                    Positioned(
                      bottom: 20,
                      left: 20,
                      child: _cornerBracket(false, true),
                    ),
                    Positioned(
                      bottom: 20,
                      right: 20,
                      child: _cornerBracket(false, false),
                    ),
                    if (_result != null)
                      Container(
                        padding: const EdgeInsets.all(20),
                        margin: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle_rounded,
                                color: Color(0xFF22C55E), size: 40),
                            const SizedBox(height: 8),
                            Text(_result!['name'],
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('Дәлдік: ${_result!['confidence']}%',
                                style: const TextStyle(
                                    color: Colors.white60, fontSize: 12)),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: _result!['status'] == 'Аз қалды'
                                    ? Colors.orange.withValues(alpha: 0.2)
                                    : Colors.green.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Қоймада: ${_result!['in_stock']} ${_result!['unit']} • ${_result!['status']}',
                                style: TextStyle(
                                  color: _result!['status'] == 'Аз қалды'
                                      ? Colors.orange
                                      : Colors.green,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Scan button
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _scanning ? null : _startScan,
              icon: _scanning
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.camera_alt_rounded, color: Colors.white),
              label: Text(_scanning ? 'Сканерленуде...' : 'Сурет түсіру',
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _cornerBracket(bool isTop, bool isLeft) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        border: Border(
          top: isTop
              ? const BorderSide(color: Color(0xFF7C3AED), width: 3)
              : BorderSide.none,
          bottom: !isTop
              ? const BorderSide(color: Color(0xFF7C3AED), width: 3)
              : BorderSide.none,
          left: isLeft
              ? const BorderSide(color: Color(0xFF7C3AED), width: 3)
              : BorderSide.none,
          right: !isLeft
              ? const BorderSide(color: Color(0xFF7C3AED), width: 3)
              : BorderSide.none,
        ),
      ),
    );
  }
}

// ─── Prom AI Dialog ────────────────────────────────────────────────────────────
class PromAiDialog extends StatefulWidget {
  const PromAiDialog({super.key});

  @override
  State<PromAiDialog> createState() => _PromAiDialogState();
}

class _PromAiDialogState extends State<PromAiDialog> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, String>> _messages = [
    {
      'role': 'bot',
      'text':
          'Сәлем! Мен Prom AI — қойма және өтінімдер бойынша көмекшіңізбін.\n\nМысалы:\n• "Цемент қанша бар?"\n• "Аз қалған материалдар"\n• "Бүгінгі өтінімдер"'
    },
  ];
  bool _isTyping = false;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.add({'role': 'user', 'text': text});
      _isTyping = true;
    });
    _controller.clear();
    _scrollToBottom();

    try {
      final res = await DashboardApi.aiChat(text);
      if (mounted) {
        setState(() {
          _messages.add({'role': 'bot', 'text': res['reply'] ?? 'Кешіріңіз, түсінбедім.'});
          _isTyping = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add({
            'role': 'bot',
            'text': 'Желі қатесі. Backend іске қосулы ма? Тексеріңіз.'
          });
          _isTyping = false;
        });
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF1E293B) : Colors.white;

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        top: 24,
        left: 24,
        right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2))),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                      colors: [Color(0xFFF97316), Color(0xFFEA580C)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.smart_toy_rounded,
                    color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Prom AI',
                      style: TextStyle(
                          color: isDark ? Colors.white : Colors.black,
                          fontSize: 20,
                          fontWeight: FontWeight.bold)),
                  Row(
                    children: [
                      Container(
                          width: 7,
                          height: 7,
                          decoration: const BoxDecoration(
                              color: Color(0xFF22C55E), shape: BoxShape.circle)),
                      const SizedBox(width: 4),
                      Text('Белсенді',
                          style: TextStyle(
                              color: isDark ? Colors.white54 : Colors.black54,
                              fontSize: 11)),
                    ],
                  ),
                ],
              ),
              const Spacer(),
              IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context)),
            ],
          ),
          const Divider(height: 24),

          // Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (_isTyping && index == _messages.length) {
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF2D3748)
                            : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(16)
                            .copyWith(bottomLeft: Radius.zero),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _dot(isDark),
                          const SizedBox(width: 4),
                          _dot(isDark),
                          const SizedBox(width: 4),
                          _dot(isDark),
                        ],
                      ),
                    ),
                  );
                }
                final msg = _messages[index];
                final isBot = msg['role'] == 'bot';
                return Align(
                  alignment:
                      isBot ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    constraints: BoxConstraints(
                        maxWidth:
                            MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isBot
                          ? (isDark
                              ? const Color(0xFF2D3748)
                              : const Color(0xFFF1F5F9))
                          : const Color(0xFFF97316),
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomLeft: isBot
                            ? Radius.zero
                            : const Radius.circular(16),
                        bottomRight: !isBot
                            ? Radius.zero
                            : const Radius.circular(16),
                      ),
                    ),
                    child: Text(
                      msg['text']!,
                      style: TextStyle(
                        color: isBot
                            ? (isDark ? Colors.white : Colors.black87)
                            : Colors.white,
                        fontSize: 13,
                        height: 1.5,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Quick chips
          if (_messages.length <= 1)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _chip('Аз қалған материалдар?', isDark),
                    const SizedBox(width: 8),
                    _chip('Бүгінгі өтінімдер', isDark),
                    const SizedBox(width: 8),
                    _chip('Қойма жағдайы', isDark),
                  ],
                ),
              ),
            ),

          // Input
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF2D3748) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                  color: const Color(0xFFF97316).withValues(alpha: 0.2)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    onSubmitted: _sendMessage,
                    style: TextStyle(
                        color: isDark ? Colors.white : Colors.black87),
                    decoration: InputDecoration(
                      hintText: 'Сұрағыңызды жазыңыз...',
                      hintStyle: TextStyle(
                          color: isDark ? Colors.white54 : Colors.black54),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send_rounded,
                      color: Color(0xFFF97316)),
                  onPressed: () => _sendMessage(_controller.text),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Center(
            child: Text('AI қателесуі мүмкін. Маңызды деректерді тексеріңіз.',
                style: TextStyle(
                    color: Colors.grey.withValues(alpha: 0.6), fontSize: 9)),
          ),
        ],
      ),
    );
  }

  Widget _dot(bool isDark) => Container(
        width: 6,
        height: 6,
        decoration: BoxDecoration(
          color: isDark ? Colors.white38 : Colors.black26,
          shape: BoxShape.circle,
        ),
      );

  Widget _chip(String text, bool isDark) => InkWell(
        onTap: () => _sendMessage(text),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFF97316).withValues(alpha: 0.4)),
            borderRadius: BorderRadius.circular(16),
            color: const Color(0xFFF97316).withValues(alpha: 0.05),
          ),
          child: Text(text,
              style: TextStyle(
                  color: const Color(0xFFF97316), fontSize: 12)),
        ),
      );
}
