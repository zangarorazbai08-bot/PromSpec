import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api.dart';
import '../providers/theme_provider.dart';
import '../core/translations.dart';
import '../widgets/notifications_modal.dart';

class MaterialsScreen extends StatefulWidget {
  const MaterialsScreen({super.key});

  @override
  State<MaterialsScreen> createState() => _MaterialsScreenState();
}

class _MaterialsScreenState extends State<MaterialsScreen> {
  List<dynamic> _materials = [];
  Map<String, dynamic>? _summary;
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isListening = false;

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        MaterialsApi.list(),
        MaterialsApi.summary(),
      ]);
      if (mounted) {
        setState(() {
          _materials = (results[0] as Map<String, dynamic>?)?['materials'] ?? [];
          _summary = results[1] as Map<String, dynamic>?;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _searchMaterials(String query) async {
    if (query.isEmpty) {
      _loadAll();
      return;
    }
    setState(() => _isLoading = true);
    try {
      final res = await MaterialsApi.list(search: query);
      if (mounted) {
        setState(() {
          _materials = (res as Map<String, dynamic>?)?['materials'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Дауыстық іздеу (mock — нақты: speech_to_text package)
  void _startVoiceSearch() {
    setState(() => _isListening = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isListening = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎤 Дауыстық іздеу: speech_to_text пакетін қосу қажет'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    });
  }

  List<dynamic> get _filteredMaterials {
    if (_searchQuery.isEmpty) return _materials;
    return _materials.where((m) {
      final name = (m['name'] ?? '').toString().toLowerCase();
      final cat = (m['category'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.toLowerCase()) ||
          cat.contains(_searchQuery.toLowerCase());
    }).toList();
  }

  // Null-safe unit helper
  String _safeUnit(dynamic unit) {
    if (unit == null || unit.toString().trim().isEmpty || unit.toString() == 'null') {
      return 'дана';
    }
    return unit.toString().trim();
  }

  // Null-safe quantity helper
  String _safeQty(dynamic qty) {
    if (qty == null) return '0';
    final d = double.tryParse(qty.toString()) ?? 0.0;
    if (d == d.truncateToDouble()) return d.truncate().toString();
    return d.toStringAsFixed(1);
  }

  // Progress color based on stock level
  Color _stockColor(dynamic current, dynamic min) {
    final c = double.tryParse(current?.toString() ?? '0') ?? 0;
    final m = double.tryParse(min?.toString() ?? '0') ?? 0;
    if (m == 0) return const Color(0xFF22C55E);
    final ratio = c / m;
    if (c == 0) return Colors.red;
    if (ratio <= 0.5) return Colors.redAccent;
    if (ratio <= 1.0) return Colors.orange;
    return const Color(0xFF22C55E);
  }

  double _stockProgress(dynamic current, dynamic min) {
    final c = double.tryParse(current?.toString() ?? '0') ?? 0;
    final m = double.tryParse(min?.toString() ?? '0') ?? 0;
    if (m == 0) return 1.0;
    return (c / (m * 2)).clamp(0.0, 1.0);
  }

  String _stockLabel(BuildContext context, dynamic current, dynamic min) {
    final c = double.tryParse(current?.toString() ?? '0') ?? 0;
    final m = double.tryParse(min?.toString() ?? '0') ?? 0;
    if (c == 0) return T.get(context, 'status_out');
    if (m == 0) return T.get(context, 'status_normal');
    if (c <= m * 0.5) return T.get(context, 'status_critical');
    if (c <= m) return T.get(context, 'status_low');
    return T.get(context, 'status_sufficient');
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.themeMode == ThemeMode.dark;
    final textColor = isDark ? Colors.white : Colors.black87;

    final displayed = _filteredMaterials;

    // Summary values
    final totalPositions = _summary?['totalPositions'] ?? _materials.length;
    final lowStockCount = _summary?['lowStockCount'] ?? 0;
    final totalValue = _summary?['totalValue'] ?? 0.0;
    final formattedValue = _formatValue(totalValue);

    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Top Bar ──────────────────────────────────────────────────
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
                              isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
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
                                    color: Colors.red, shape: BoxShape.circle),
                                child: Text('$lowStockCount',
                                    style: const TextStyle(
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

                // ── Title ─────────────────────────────────────────────────────
                Text(T.get(context, 'mat_subtitle'),
                    style: const TextStyle(
                        color: Color(0xFFF97316),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2)),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(T.get(context, 'mat_title'),
                        style: TextStyle(
                            color: textColor,
                            fontSize: 32,
                            fontWeight: FontWeight.bold)),
                    Container(
                      width: 48,
                      height: 48,
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
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.qr_code_scanner_rounded,
                            color: Colors.white),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                                content:
                                    Text('${T.get(context, 'dash_ai_scanner')}...')));
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // ── Search Bar ────────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: Colors.grey.withValues(alpha: 0.2)),
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.search_rounded,
                          color: isDark ? Colors.white54 : Colors.grey),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _searchCtrl,
                          onChanged: (val) {
                            setState(() => _searchQuery = val);
                            if (val.isEmpty) _loadAll();
                          },
                          onSubmitted: _searchMaterials,
                          style: TextStyle(color: textColor),
                          decoration: InputDecoration(
                            hintText: T.get(context, 'mat_search_hint'),
                            hintStyle: TextStyle(
                                color: isDark ? Colors.white38 : Colors.black38),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      // Voice search button
                      IconButton(
                        icon: Icon(
                          _isListening ? Icons.mic : Icons.mic_none_rounded,
                          color: _isListening
                              ? Colors.red
                              : (isDark ? Colors.white54 : Colors.grey),
                          size: 22,
                        ),
                        onPressed: _startVoiceSearch,
                        tooltip: 'Дауыспен іздеу',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // ── Summary Card ──────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
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
                          offset: const Offset(0, 6)),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildSummaryStat(
                          T.get(context, 'mat_total_value'), '$formattedValue ₸', Colors.white),
                      Container(
                          width: 1,
                          height: 40,
                          color: Colors.white.withValues(alpha: 0.1)),
                      _buildSummaryStat(T.get(context, 'mat_total_items'), '$totalPositions', Colors.white),
                      Container(
                          width: 1,
                          height: 40,
                          color: Colors.white.withValues(alpha: 0.1)),
                      _buildSummaryStat(
                          T.get(context, 'dash_low_stock'), '$lowStockCount', Colors.redAccent),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Materials List ────────────────────────────────────────────────
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: Color(0xFFF97316)))
                : RefreshIndicator(
                    onRefresh: _loadAll,
                    color: const Color(0xFFF97316),
                    child: displayed.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.inventory_2_outlined,
                                    size: 64,
                                    color: isDark
                                        ? Colors.white24
                                        : Colors.black26),
                                const SizedBox(height: 16),
                                Text(
                                  _searchQuery.isEmpty
                                      ? 'Материалдар жоқ'
                                      : '"$_searchQuery" бойынша ештеме табылмады',
                                  style: TextStyle(
                                      color: isDark
                                          ? Colors.white54
                                          : Colors.black54,
                                      fontSize: 15),
                                ),
                                if (_searchQuery.isNotEmpty) ...[
                                  const SizedBox(height: 12),
                                  TextButton.icon(
                                    onPressed: () {
                                      _searchCtrl.clear();
                                      setState(() => _searchQuery = '');
                                      _loadAll();
                                    },
                                    icon: const Icon(Icons.clear,
                                        color: Color(0xFFF97316)),
                                    label: const Text('Тазарту',
                                        style: TextStyle(
                                            color: Color(0xFFF97316))),
                                  ),
                                ],
                              ],
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 8),
                            itemCount: displayed.length,
                            separatorBuilder: (_, i) =>
                                const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              final m = displayed[index];
                              return _buildMaterialCard(m, isDark, textColor);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryStat(String label, String value, Color valueColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(color: Colors.white54, fontSize: 10)),
        const SizedBox(height: 4),
        Text(value,
            style: TextStyle(
                color: valueColor, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildMaterialCard(
      Map<String, dynamic> m, bool isDark, Color textColor) {
    final name = m['name'] ?? 'Атаусыз';
    final unit = _safeUnit(m['unit']);
    final qty = _safeQty(m['current_quantity']);
    final minQty = _safeQty(m['min_quantity']);
    final isLow = m['is_low_stock'] == true ||
        (double.tryParse(m['current_quantity']?.toString() ?? '0') ?? 0) <=
            (double.tryParse(m['min_quantity']?.toString() ?? '0') ?? 0) &&
                (double.tryParse(m['min_quantity']?.toString() ?? '0') ?? 0) > 0;

    final progressColor =
        _stockColor(m['current_quantity'], m['min_quantity']);
    final progress = _stockProgress(m['current_quantity'], m['min_quantity']);
    // ignore: unused_local_variable
    final stockLabel = _stockLabel(context, m['current_quantity'], m['min_quantity']);
    final category = m['category'] ?? '';

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isLow
              ? Colors.redAccent.withValues(alpha: 0.3)
              : Colors.grey.withValues(alpha: 0.1),
        ),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isLow
                  ? Colors.red.withValues(alpha: 0.1)
                  : const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isLow
                  ? Icons.warning_amber_rounded
                  : Icons.inventory_2_outlined,
              color: isLow ? Colors.redAccent : const Color(0xFF3B82F6),
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(name,
                          style: TextStyle(
                              color: textColor,
                              fontSize: 14,
                              fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ),
                    if (isLow)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(stockLabel,
                            style: const TextStyle(
                                color: Colors.redAccent,
                                fontSize: 9,
                                fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
                if (category.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(category,
                      style: TextStyle(
                          color: isDark ? Colors.white38 : Colors.black38,
                          fontSize: 10)),
                ],
                const SizedBox(height: 8),
                // Progress bar
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: LinearProgressIndicator(
                          value: progress,
                          backgroundColor:
                              Colors.grey.withValues(alpha: 0.15),
                          valueColor:
                              AlwaysStoppedAnimation<Color>(progressColor),
                          minHeight: 5,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('мин: $minQty $unit',
                        style: TextStyle(
                            color: isDark ? Colors.white38 : Colors.black38,
                            fontSize: 9)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Quantity
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(qty,
                  style: TextStyle(
                      color: textColor,
                      fontSize: 22,
                      fontWeight: FontWeight.bold)),
              Text(unit,
                  style: TextStyle(
                      color: isDark ? Colors.white54 : Colors.black54,
                      fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  String _formatValue(dynamic value) {
    final d = double.tryParse(value?.toString() ?? '0') ?? 0.0;
    if (d >= 1000000) {
      return '${(d / 1000000).toStringAsFixed(1)} млн';
    } else if (d >= 1000) {
      return '${(d / 1000).toStringAsFixed(0)} мың';
    }
    return d.toStringAsFixed(0);
  }
}
