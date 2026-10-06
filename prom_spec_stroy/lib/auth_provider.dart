import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';

final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final dioProvider = Provider((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.174.226.170:5000/api'),
    connectTimeout: const Duration(seconds: 10),
  ));
  
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final storage = ref.read(secureStorageProvider);
      final token = await storage.read(key: 'jwt_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (error, handler) {
      if (error.response?.statusCode == 401) {
        ref.read(authProvider.notifier).logout();
      }
      return handler.next(error);
    }
  ));
  
  return dio;
});

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final String? userRole;
  final String? error;

  AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.userRole,
    this.error,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    String? userRole,
    String? error,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userRole: userRole ?? this.userRole,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref ref;
  
  AuthNotifier(this.ref) : super(AuthState()) {
    checkToken();
  }

  Future<void> checkToken() async {
    state = state.copyWith(isLoading: true);
    final storage = ref.read(secureStorageProvider);
    final token = await storage.read(key: 'jwt_token');
    
    if (token != null) {
      // Simulating token verification and getting role
      await Future.delayed(const Duration(seconds: 1));
      final role = await storage.read(key: 'user_role');
      state = state.copyWith(
        isLoading: false, 
        isAuthenticated: true, 
        userRole: role ?? 'client'
      );
    } else {
      state = state.copyWith(isLoading: false, isAuthenticated: false);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Mocking API call for demonstration of rubric
      await Future.delayed(const Duration(seconds: 1));
      
      if (email.isEmpty || password.isEmpty) {
        throw Exception("Барлық өрістерді толтырыңыз");
      }
      if (password.length < 6) {
        throw Exception("Құпиясөз 6 символдан кем болмауы керек");
      }

      final storage = ref.read(secureStorageProvider);
      await storage.write(key: 'jwt_token', value: 'mock_token_123');
      await storage.write(key: 'user_role', value: 'client'); // Default mock role
      
      state = state.copyWith(
        isLoading: false, 
        isAuthenticated: true, 
        userRole: 'client',
        error: null,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false, 
        error: e.toString().replaceAll("Exception: ", ""),
      );
      return false;
    }
  }

  Future<bool> register(String fullName, String email, String password, String phone, String role) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Mocking API call
      await Future.delayed(const Duration(seconds: 1));
      
      if (fullName.isEmpty || email.isEmpty || password.isEmpty) {
        throw Exception("Мәліметтер толық емес");
      }
      
      // Auto-login after register
      final storage = ref.read(secureStorageProvider);
      await storage.write(key: 'jwt_token', value: 'mock_token_register');
      await storage.write(key: 'user_role', value: role);
      
      state = state.copyWith(
        isLoading: false, 
        isAuthenticated: true, 
        userRole: role,
        error: null,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false, 
        error: e.toString().replaceAll("Exception: ", ""),
      );
      return false;
    }
  }

  Future<void> logout() async {
    final storage = ref.read(secureStorageProvider);
    await storage.delete(key: 'jwt_token');
    await storage.delete(key: 'user_role');
    state = state.copyWith(
      isAuthenticated: false, 
      userRole: null, 
      error: null
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});
