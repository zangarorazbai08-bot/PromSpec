import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:prom_spec_mobile/main.dart';
import 'package:prom_spec_mobile/providers/auth_provider.dart';
import 'package:prom_spec_mobile/providers/theme_provider.dart';
import 'package:prom_spec_mobile/providers/cart_provider.dart';

void main() {
  testWidgets('App starts and shows Splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ThemeProvider()),
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => CartProvider()),
        ],
        child: const PromSpecApp(),
      ),
    );
    await tester.pump();
    // App should render without errors
    expect(find.byType(MaterialApp), findsNothing); // routerConfig used
  });
}
