import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function DashboardScreen() {
  const { logout, user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('dashboard/');
      setData(res.data);
    } catch (err) {
      console.log('Error fetching dashboard', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Here's your financial summary</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {data && (
        <>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>${data.totalBalance?.toFixed(2) || '0.00'}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statIncome}>${data.monthlyIncome?.toFixed(2) || '0.00'}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statExpense}>${data.monthlyExpenses?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {data.recentTransactions?.length === 0 && (
              <Text style={styles.emptyText}>No recent transactions</Text>
            )}
            {data.recentTransactions?.map((tx, idx) => (
              <View key={idx} style={styles.txCard}>
                <View style={styles.txInfo}>
                  <Text style={styles.txCategory}>{tx.category_name}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#10B981' : '#111827' }]}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  logoutText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  balanceCard: {
    margin: 20,
    backgroundColor: '#4F46E5',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#E0E7FF',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderLeftWidth: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statIncome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statExpense: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  txInfo: {
    flex: 1,
  },
  txCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  txDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
