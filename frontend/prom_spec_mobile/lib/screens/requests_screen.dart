import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api.dart';
import '../providers/theme_provider.dart';
import '../core/translations.dart';
import '../widgets/notifications_modal.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({super.key});

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen>
    with SingleTickerProviderStateMixin {
  List<dynamic> _requests = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final List<String> _filterKeys = [
    'req_filter_all',
    'req_filter_pending',
    'req_filter_approved',
    'req_filter_rejected',
  ];
  // Status filter internal value (English key)
  int _selectedFilterIndex = 0;
  late TabController _tabController;
  bool _isListening = false;
  final TextEditingController _searchCtrl = TextEditingController();

  // Mock data for offline fallback
  final List<Map<String, dynamic>> _mockRequests = [
    {
      'id': 1,
      'display_title': 'Цемент жеткізу',
      'status': 'pending',
      'material': 'Цемент M400',
      'quantity': '50 қап',
      'date': '05 Қазан 2026',
      'priority': 'high',
      'items_count': 1,
    },
    {
      'id': 2,
      'display_title': 'Арматура тапсырысы',
      'status': 'approved',
      'material': 'Арматура А500С',
      'quantity': '2 тонна',
      'date': '04 Қазан 2026',
      'priority': 'normal',
      'items_count': 1,
    },
    {
      'id': 3,
      'display_title': 'Кірпіш жеткізу',
      'status': 'rejected',
      'material': 'Кірпіш M150',
      'quantity': '1000 дана',
      'date': '03 Қазан 2026',
      'priority': 'low',
      'items_count': 1,
    },
    {
      'id': 4,
      'display_title': 'Бетон блоктар',
      'status': 'pending',
      'material': 'Бетон блок D500',
      'quantity': '200 дана',
      'date': '02 Қазан 2026',
      'priority': 'normal',
      'items_count': 1,
    },
    {
      'id': 5,
      'display_title': 'Болат профиль',
      'status': 'approved',
      'material': 'Болат профиль 20x20',
      'quantity': '500 м.п.',
      'date': '01 Қазан 2026',
      'priority': 'high',
      'items_count': 1,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _filterKeys.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _selectedFilterIndex = _tabController.index);
      }
    });
    _loadRequests();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadRequests() async {
    setState(() => _isLoading = true);
    try {
      final res = await RequestsApi.list();
      if (mounted) {
        setState(() {
          _requests = (res as Map<String, dynamic>?)?['requests'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<dynamic> get _filteredRequests {
    final source = _requests.isEmpty ? _mockRequests : _requests;
    return source.where((r) {
      final title = (r['display_title'] ?? r['title'] ?? 'Req #${r['id']}')
          .toString()
          .toLowerCase();
      final material = (r['material'] ?? '').toString().toLowerCase();
      final matchSearch = _searchQuery.isEmpty ||
          title.contains(_searchQuery.toLowerCase()) ||
          material.contains(_searchQuery.toLowerCase());

      if (_selectedFilterIndex == 0) return matchSearch;
      final statusMap = {
        1: 'pending',
        2: 'approved',
        3: 'rejected',
      };
      final filterStatus = statusMap[_selectedFilterIndex];
      return matchSearch && r['status'] == filterStatus;
    }).toList();
  }

  // Stats
  int get _pendingCount =>
      (_requests.isEmpty ? _mockRequests : _requests)
          .where((r) => r['status'] == 'pending')
          .length;

  int get _approvedCount =>
      (_requests.isEmpty ? _mockRequests : _requests)
          .where((r) => r['status'] == 'approved')
          .length;

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

  void _showCreateRequestDialog(BuildContext context, bool isDark) {
    final titleCtrl = TextEditingController();
    final materialCtrl = TextEditingController();
    final quantityCtrl = TextEditingController();
    String selectedPriority = 'normal';
    bool isSending = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.88,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: EdgeInsets.only(
            top: 24,
            left: 24,
            right: 24,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
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
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(T.get(context, 'req_new_title'),
                      style: TextStyle(
                          color: isDark ? Colors.white : Colors.black,
                          fontSize: 22,
                          fontWeight: FontWeight.bold)),
                  IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 24),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildInputLabel(T.get(context, 'req_input_title'), isDark),
                      _buildTextField(
                          titleCtrl, T.get(context, 'req_input_title'), isDark),
                      const SizedBox(height: 16),
                      _buildInputLabel(T.get(context, 'req_input_mat'), isDark),
                      _buildTextField(
                          materialCtrl, T.get(context, 'req_input_mat'), isDark),
                      const SizedBox(height: 16),
                      _buildInputLabel(T.get(context, 'req_input_qty'), isDark),
                      _buildTextField(
                          quantityCtrl, T.get(context, 'req_input_qty'), isDark,
                          keyboardType: TextInputType.number),
                      const SizedBox(height: 16),
                      _buildInputLabel(T.get(context, 'req_input_priority'), isDark),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _buildPriorityChip('low', T.get(context, 'req_prio_low'), Colors.green,
                              selectedPriority,
                              (v) => setModalState(() => selectedPriority = v),
                              isDark),
                          const SizedBox(width: 8),
                          _buildPriorityChip('normal', T.get(context, 'req_prio_normal'), Colors.orange,
                              selectedPriority,
                              (v) => setModalState(() => selectedPriority = v),
                              isDark),
                          const SizedBox(width: 8),
                          _buildPriorityChip('high', T.get(context, 'req_prio_high'), Colors.red,
                              selectedPriority,
                              (v) => setModalState(() => selectedPriority = v),
                              isDark),
                        ],
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          onPressed: isSending
                              ? null
                              : () async {
                                  if (titleCtrl.text.isEmpty ||
                                      materialCtrl.text.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                            content: Text('Барлық өрістерді толтырыңыз')));
                                    return;
                                  }
                                  setModalState(() => isSending = true);
                                  try {
                                    await RequestsApi.createSimple({
                                      'title': titleCtrl.text,
                                      'material_name': materialCtrl.text,
                                      'quantity': quantityCtrl.text,
                                      'priority': selectedPriority,
                                    });
                                    if (ctx.mounted) {
                                      Navigator.pop(ctx);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text('✅ Өтінім сәтті жіберілді!'),
                                          backgroundColor: Color(0xFF22C55E),
                                        ),
                                      );
                                      _loadRequests();
                                    }
                                  } catch (e) {
                                    setModalState(() => isSending = false);
                                    if (!context.mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                            'Қате: ${e.toString().replaceAll('Exception: ', '')}'),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF97316),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          child: isSending
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2))
                              : Text(T.get(context, 'req_btn_send'),
                                  style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(label,
          style: TextStyle(
              color: isDark ? Colors.white70 : Colors.black54,
              fontSize: 13,
              fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String hint, bool isDark,
      {TextInputType keyboardType = TextInputType.text}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2D3748) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
      ),
      child: TextField(
        controller: ctrl,
        keyboardType: keyboardType,
        style:
            TextStyle(color: isDark ? Colors.white : Colors.black87),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(
              color: isDark ? Colors.white38 : Colors.black38),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildPriorityChip(String value, String label, Color color,
      String selected, ValueChanged<String> onTap, bool isDark) {
    final isSelected = selected == value;
    return Expanded(
      child: InkWell(
        onTap: () => onTap(value),
        borderRadius: BorderRadius.circular(10),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? color.withValues(alpha: 0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
                color: isSelected ? color : Colors.grey.withValues(alpha: 0.3)),
          ),
          alignment: Alignment.center,
          child: Text(label,
              style: TextStyle(
                  color: isSelected
                      ? color
                      : (isDark ? Colors.white54 : Colors.black54),
                  fontWeight:
                      isSelected ? FontWeight.bold : FontWeight.normal,
                  fontSize: 13)),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.themeMode == ThemeMode.dark;
    final textColor = isDark ? Colors.white : Colors.black87;
    final filtered = _filteredRequests;

    return SafeArea(
      child: Column(
        children: [
          // ── Header ─────────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                            if (_pendingCount > 0)
                              Positioned(
                                right: 8,
                                top: 8,
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                      color: Colors.red, shape: BoxShape.circle),
                                  child: Text('$_pendingCount',
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

                // Title + Add button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('GREEN PARK',
                            style: TextStyle(
                                color: Color(0xFFF97316),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.2)),
                        const SizedBox(height: 4),
                        Text(T.get(context, 'req_title'),
                            style: TextStyle(
                                color: textColor,
                                fontSize: 32,
                                fontWeight: FontWeight.bold)),
                      ],
                    ),
                    InkWell(
                      onTap: () => _showCreateRequestDialog(context, isDark),
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
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
                        child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
                      ),
                    ),
                  ],
                ),

                // Stats row
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildMiniStat(T.get(context, 'req_filter_pending'), '$_pendingCount', Colors.orange, isDark),
                    const SizedBox(width: 12),
                    _buildMiniStat(T.get(context, 'req_filter_approved'), '$_approvedCount', Colors.green, isDark),
                    const SizedBox(width: 12),
                    _buildMiniStat(T.get(context, 'req_filter_all'),
                        '${(_requests.isEmpty ? _mockRequests : _requests).length}',
                        Colors.blue, isDark),
                  ],
                ),
                const SizedBox(height: 16),

                // Search Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
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
                          onChanged: (val) =>
                              setState(() => _searchQuery = val),
                          style: TextStyle(color: textColor),
                          decoration: InputDecoration(
                            hintText: T.get(context, 'req_search_hint'),
                            hintStyle: TextStyle(
                                color: isDark ? Colors.white38 : Colors.black38),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                            _isListening ? Icons.mic : Icons.mic_none_rounded,
                            color: _isListening
                                ? Colors.red
                                : (isDark ? Colors.white54 : Colors.grey),
                            size: 22),
                        onPressed: _startVoiceSearch,
                        tooltip: 'Дауыспен іздеу',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Filter Tabs
                TabBar(
                  controller: _tabController,
                  isScrollable: true,
                  tabAlignment: TabAlignment.start,
                  dividerColor: Colors.transparent,
                  indicatorColor: const Color(0xFFF97316),
                  indicatorWeight: 3,
                  labelColor: const Color(0xFFF97316),
                  unselectedLabelColor:
                      isDark ? Colors.white54 : Colors.black54,
                  labelStyle: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 13),
                  tabs: _filterKeys.map((k) => Tab(text: T.get(context, k))).toList(),
                ),
              ],
            ),
          ),

          // ── List ────────────────────────────────────────────────────────────
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFFF97316)))
                : RefreshIndicator(
                    onRefresh: _loadRequests,
                    color: const Color(0xFFF97316),
                    child: filtered.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.assignment_outlined,
                                    size: 64,
                                    color: isDark
                                        ? Colors.white24
                                        : Colors.black26),
                                const SizedBox(height: 16),
                                Text(T.get(context, 'req_empty'),
                                    style: TextStyle(
                                        color: isDark
                                            ? Colors.white54
                                            : Colors.black54,
                                        fontSize: 16)),
                                const SizedBox(height: 12),
                                TextButton.icon(
                                  onPressed: () =>
                                      _showCreateRequestDialog(context, isDark),
                                  icon: const Icon(Icons.add,
                                      color: Color(0xFFF97316)),
                                  label: Text(T.get(context, 'req_create_btn'),
                                      style:
                                          const TextStyle(color: Color(0xFFF97316))),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 8),
                            itemCount: filtered.length,
                            separatorBuilder: (_, i) =>
                                const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              return _buildRequestCard(
                                  filtered[index], isDark, textColor);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(
      String label, String value, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Text(value,
              style: TextStyle(
                  color: color, fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  color: color.withValues(alpha: 0.8), fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildRequestCard(
      Map<String, dynamic> r, bool isDark, Color textColor) {
    final status = r['status'] ?? 'pending';
    final priority = r['priority'] ?? 'normal';
    final title = r['display_title'] ?? r['title'] ?? 'Өтінім #${r['id']}';

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (status) {
      case 'approved':
        statusColor = const Color(0xFF22C55E);
        statusLabel = T.get(context, 'req_filter_approved');
        statusIcon = Icons.check_circle_outline_rounded;
        break;
      case 'rejected':
        statusColor = Colors.red;
        statusLabel = T.get(context, 'req_filter_rejected');
        statusIcon = Icons.cancel_outlined;
        break;
      case 'issued':
        statusColor = Colors.blue;
        statusLabel = T.get(context, 'req_status_issued');
        statusIcon = Icons.local_shipping_outlined;
        break;
      case 'confirmed':
        statusColor = Colors.purple;
        statusLabel = T.get(context, 'req_status_confirmed');
        statusIcon = Icons.verified_outlined;
        break;
      default:
        statusColor = const Color(0xFFF97316);
        statusLabel = T.get(context, 'req_filter_pending');
        statusIcon = Icons.access_time_rounded;
    }

    Color priorityColor;
    String priorityLabel;
    switch (priority) {
      case 'high':
        priorityColor = Colors.red;
        priorityLabel = T.get(context, 'req_prio_high');
        break;
      case 'low':
        priorityColor = Colors.green;
        priorityLabel = T.get(context, 'req_prio_low');
        break;
      default:
        priorityColor = Colors.orange;
        priorityLabel = T.get(context, 'req_prio_normal');
    }

    return InkWell(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Өтінім #${r['id']} — $title')));
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    _statusBadge(statusIcon, statusColor, statusLabel),
                    const SizedBox(width: 8),
                    _priorityBadge(priorityColor, priorityLabel),
                    if ((r['items_count'] ?? 0) > 1) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.blue.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text('${r['items_count']} материал',
                            style: const TextStyle(
                                color: Colors.blue, fontSize: 9)),
                      ),
                    ],
                  ],
                ),
                Text('#${r['id']}',
                    style: TextStyle(
                        color: isDark ? Colors.white38 : Colors.black38,
                        fontSize: 12)),
              ],
            ),
            const SizedBox(height: 12),
            Text(title,
                style: TextStyle(
                    color: textColor,
                    fontSize: 16,
                    fontWeight: FontWeight.bold),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
            if (r['material'] != null && r['material'].toString().isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.inventory_2_outlined,
                      size: 14,
                      color: isDark ? Colors.white54 : Colors.black54),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      '${r['material']}${r['quantity'] != null ? ' • ${r['quantity']}' : ''}',
                      style: TextStyle(
                          color: isDark ? Colors.white54 : Colors.black54,
                          fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
            if (r['date'] != null) ...[
              const SizedBox(height: 6),
              Row(
                children: [
                  Icon(Icons.calendar_today_outlined,
                      size: 12,
                      color: isDark ? Colors.white38 : Colors.black38),
                  const SizedBox(width: 4),
                  Text(r['date'],
                      style: TextStyle(
                          color: isDark ? Colors.white38 : Colors.black38,
                          fontSize: 12)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(IconData icon, Color color, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 12),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  color: color, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _priorityBadge(Color color, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}
