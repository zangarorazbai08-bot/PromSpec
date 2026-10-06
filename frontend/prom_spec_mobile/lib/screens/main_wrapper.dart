import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../core/translations.dart';
import '../screens/dashboard_screen.dart' show AiScannerDialog;

class MainWrapper extends StatefulWidget {
  final Widget child;
  const MainWrapper({super.key, required this.child});

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  int _currentIndex = 0;

  void _onItemTapped(int index, BuildContext context) {
    setState(() {
      _currentIndex = index;
    });
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/requests');
        break;
      case 2:
        // FAB action (scan / create)
        break;
      case 3:
        context.go('/materials');
        break;
      case 4:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    if (user == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    
    final themeProvider = context.watch<ThemeProvider>();
    final isDark = themeProvider.themeMode == ThemeMode.dark;
    final bgColor = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final navColor = isDark ? const Color(0xFF1E293B) : Colors.white;
    const activeColor = Color(0xFFF97316);
    final inactiveColor = isDark ? Colors.grey[500]! : Colors.grey[400]!;

    // Determine current index based on route location
    // Note: this is a simple string match, for robust apps you'd listen to router state properly
    final String location = GoRouterState.of(context).uri.toString();
    if (location == '/') {
      _currentIndex = 0;
    } else if (location.startsWith('/requests')) {
      _currentIndex = 1;
    } else if (location.startsWith('/materials')) {
      _currentIndex = 3;
    } else if (location.startsWith('/profile')) {
      _currentIndex = 4;
    }

    return Scaffold(
      backgroundColor: bgColor,
      body: widget.child,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: FloatingActionButton(
        backgroundColor: activeColor,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            backgroundColor: Colors.transparent,
            builder: (context) => const AiScannerDialog(),
          );
        },
        child: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 28),
      ),
      bottomNavigationBar: BottomAppBar(
        color: navColor,
        shape: const CircularNotchedRectangle(),
        notchMargin: 8.0,
        padding: EdgeInsets.zero,
        child: SizedBox(
          height: 65,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(Icons.home_outlined, Icons.home_rounded, 'nav_home'.tr(context), 0, activeColor, inactiveColor),
              _buildNavItem(Icons.assignment_outlined, Icons.assignment_rounded, 'nav_requests'.tr(context), 1, activeColor, inactiveColor),
              const SizedBox(width: 48),
              _buildNavItem(Icons.inventory_2_outlined, Icons.inventory_2_rounded, 'nav_materials'.tr(context), 3, activeColor, inactiveColor),
              _buildNavItem(Icons.person_outline_rounded, Icons.person_rounded, 'nav_profile'.tr(context), 4, activeColor, inactiveColor),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData outlineIcon, IconData solidIcon, String label, int index, Color activeColor, Color inactiveColor) {
    final isSelected = _currentIndex == index;
    final color = isSelected ? activeColor : inactiveColor;
    return Expanded(
      child: InkWell(
        onTap: () => _onItemTapped(index, context),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(isSelected ? solidIcon : outlineIcon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
