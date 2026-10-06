import 'package:flutter/material.dart';

class CartProvider extends ChangeNotifier {
  final List<Map<String, dynamic>> _items = [];

  List<Map<String, dynamic>> get items => _items;

  void addItem(Map<String, dynamic> item) {
    _items.add(item);
    notifyListeners();
  }

  void removeItem(int index) {
    if (index >= 0 && index < _items.length) {
      _items.removeAt(index);
      notifyListeners();
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  // Calculate Subtotal
  double getSubtotal() {
    return _items.fold(0, (sum, item) {
      double price = (item['price'] ?? 0).toDouble();
      int quantity = (item['quantity'] ?? 1) as int;
      return sum + (price * quantity);
    });
  }

  // Calculate VIP Discount, Delivery and Total
  Map<String, double> getFinalCheckoutTotals(bool isUserPremium) {
    double subtotal = getSubtotal();
    double discount = 0.0;
    double deliveryFee = 1500.0; // Standard delivery fee

    if (isUserPremium) {
      discount = subtotal * 0.15; // 15% VIP discount
      deliveryFee = 0.0; // Free priority delivery for VIP
    }

    double total = (subtotal - discount) + deliveryFee;

    return {
      'subtotal': subtotal,
      'discount': discount,
      'delivery': deliveryFee,
      'total': total,
    };
  }
}
