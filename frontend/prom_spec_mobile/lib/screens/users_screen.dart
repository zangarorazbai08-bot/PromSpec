import 'package:flutter/material.dart';
import '../core/api.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  List<dynamic> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    try {
      final res = await UsersApi.list();
      setState(() {
        _users = res['users'] ?? [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _loadUsers,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _users.length,
        itemBuilder: (context, index) {
          final u = _users[index];
          return Card(
            child: ListTile(
              leading: CircleAvatar(child: Text((u['full_name'] ?? 'U')[0])),
              title: Text(u['full_name'] ?? 'Атаусыз'),
              subtitle: Text('Роль: ${u['role']}'),
            ),
          );
        },
      ),
    );
  }
}
