import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/language_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/main_wrapper.dart';
import 'screens/dashboard_screen.dart';
import 'screens/materials_screen.dart';
import 'screens/requests_screen.dart';
import 'screens/users_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/welcome_screen.dart';
import 'screens/lock_screen.dart';
void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
      ],
      child: const PromSpecApp(),
    ),
  );
}

class PromSpecApp extends StatefulWidget {
  const PromSpecApp({super.key});

  @override
  State<PromSpecApp> createState() => _PromSpecAppState();
}

class _PromSpecAppState extends State<PromSpecApp> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    final authProvider = context.read<AuthProvider>();

    _router = GoRouter(
      initialLocation: '/splash',
      refreshListenable: authProvider,
      redirect: (context, state) {
        final isLoggedIn = authProvider.user != null;
        final path = state.uri.path;

        // Don't redirect during auth check, except keep them on splash
        if (authProvider.isLoading) return null;

        if (path == '/splash') {
          return isLoggedIn ? '/' : '/welcome';
        }

        final publicRoutes = ['/welcome', '/auth', '/register'];

        if (!isLoggedIn && !publicRoutes.contains(path)) {
          return '/welcome';
        }
        
        if (isLoggedIn) {
          if (authProvider.isLocked && path != '/lock') {
            return '/lock';
          }
          if (!authProvider.isLocked && path == '/lock') {
            return '/';
          }
          if (publicRoutes.contains(path)) {
            return '/';
          }
        }
        return null;
      },
      routes: [
        // Splash (Rubric 2)
        GoRoute(
          path: '/splash',
          builder: (context, state) => const SplashScreen(),
        ),
        // Welcome Screen
        GoRoute(
          path: '/welcome',
          builder: (context, state) => const WelcomeScreen(),
        ),
        // Login (Rubric 4)
        GoRoute(
          path: '/auth',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        // Register (Rubric 3)
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterScreen(),
        ),
        // Lock Screen
        GoRoute(
          path: '/lock',
          builder: (context, state) => const LockScreen(),
        ),
        // Main Shell (Rubric 6, 7, 8, 9)
        ShellRoute(
          builder: (context, state, child) => MainWrapper(child: child),
          routes: [
            GoRoute(
              path: '/',
              builder: (context, state) => const DashboardScreen(),
            ),
            GoRoute(
              path: '/materials',
              builder: (context, state) => const MaterialsScreen(),
            ),
            GoRoute(
              path: '/requests',
              builder: (context, state) => const RequestsScreen(),
            ),
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen(),
            ),
            GoRoute(
              path: '/users',
              builder: (context, state) => const UsersScreen(),
            ),
            GoRoute(
              path: '/cart',
              builder: (context, state) => const CartScreen(),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();

    return MaterialApp.router(
      title: 'Prom Spec Stroy',
      debugShowCheckedModeBanner: false,
      themeMode: themeProvider.themeMode,
      theme: ThemeData.light().copyWith(
        primaryColor: const Color(0xFF7C3AED),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          elevation: 0,
        ),
        colorScheme: const ColorScheme.light(primary: Color(0xFF7C3AED)),
      ),
      darkTheme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFF8B5CF6),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E293B),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        colorScheme: const ColorScheme.dark(primary: Color(0xFF8B5CF6)),
      ),
      routerConfig: _router,
    );
  }
}
