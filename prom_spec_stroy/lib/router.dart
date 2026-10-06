import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:prom_spec_stroy/auth_provider.dart';
import 'package:prom_spec_stroy/screens.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuth = authState.isAuthenticated;
      final isSplash = state.uri.toString() == '/splash';
      final isLogin = state.uri.toString() == '/login';
      final isRegister = state.uri.toString() == '/register';

      if (authState.isLoading) return null;

      if (!isAuth && !isSplash && !isLogin && !isRegister) {
        return '/login';
      }

      if (isAuth && (isSplash || isLogin || isRegister)) {
        return '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
        routes: [
          GoRoute(
            path: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: 'scanner',
            builder: (context, state) => const ScannerScreen(),
          ),
        ]
      ),
    ],
  );
});
