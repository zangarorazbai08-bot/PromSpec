import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/premium_badge.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final authProvider = context.watch<AuthProvider>();
    
    final bool isPremium = authProvider.isPremium;
    final totals = cartProvider.getFinalCheckoutTotals(isPremium);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Себет'),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: PremiumBadge(isPremium: isPremium),
            ),
          )
        ],
      ),
      body: cartProvider.items.isEmpty
          ? const Center(child: Text('Себет бос. Тауарлар қосыңыз!'))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    itemCount: cartProvider.items.length,
                    itemBuilder: (context, index) {
                      final item = cartProvider.items[index];
                      return ListTile(
                        leading: const Icon(Icons.shopping_bag),
                        title: Text(item['name'] ?? 'Тауар'),
                        subtitle: Text('Саны: ${item['quantity'] ?? 1}'),
                        trailing: Text('${item['price'] ?? 0} ₸', style: const TextStyle(fontWeight: FontWeight.bold)),
                        onLongPress: () => cartProvider.removeItem(index),
                      );
                    },
                  ),
                ),
                _buildCartSummary(context, authProvider, totals),
              ],
            ),
    );
  }

  Widget _buildCartSummary(BuildContext context, AuthProvider authProvider, Map<String, double> totals) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Warning if subscription is ending soon
            if (authProvider.shouldShowRenewalWarning)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8)
                ),
                child: const Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: Colors.red),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Назар аударыңыз: VIP жазылымыңыз 3 күннен соң аяқталады!',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Тауарлар құны:', style: TextStyle(fontSize: 16, color: Colors.grey)),
                Text('${totals['subtotal']} ₸', style: const TextStyle(fontSize: 16)),
              ],
            ),
            const SizedBox(height: 8),
            
            // VIP Discount Row
            if (authProvider.isPremium)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                       Icon(Icons.stars, color: Colors.orange, size: 18),
                       SizedBox(width: 4),
                       Text('VIP Жеңілдік (15%):', style: TextStyle(fontSize: 16, color: Colors.orange, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  Text('-${totals['discount']} ₸', style: const TextStyle(fontSize: 16, color: Colors.orange, fontWeight: FontWeight.bold)),
                ],
              ),
            
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Жеткізу:', style: TextStyle(fontSize: 16, color: Colors.grey)),
                Text(
                  authProvider.isPremium ? 'Тегін (Priority)' : '${totals['delivery']} ₸',
                  style: TextStyle(
                    fontSize: 16, 
                    color: authProvider.isPremium ? Colors.green : null,
                    fontWeight: authProvider.isPremium ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
            
            const Divider(height: 32, thickness: 1),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Барлығы:', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text(
                  '${totals['total']} ₸',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () {
                  // Checkout logic here
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Төлемге өтуде...'))
                  );
                },
                child: const Text('Төлем жасау', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
