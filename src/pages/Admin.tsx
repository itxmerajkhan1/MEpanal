import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Order } from '../types';
import { useUser } from '../context/UserContext';
import { Shield, Search, Filter, CheckCircle, Clock, TrendingUp, User, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Admin() {
  const { userData } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'ME Panel - Admin';
  }, []);

  useEffect(() => {
    if (userData?.role !== 'admin') return;

    const path = 'orders';
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleUpdateStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'completed') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => 
    order.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userData?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-400">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-indigo-500" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Manage all user orders and update their status.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search all orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-indigo-500' },
            { label: 'Active', value: orders.filter(o => o.status !== 'completed').length, icon: TrendingUp, color: 'text-blue-500' },
            { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-orange-500' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl bg-gray-50 dark:bg-white/5", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5">
                      <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">User</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Platform</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Service</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Quantity</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Total Price</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{order.firstName} {order.lastName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{order.link}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{order.platform}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{order.serviceName}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{order.quantity.toLocaleString()}</td>
                          <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold">Rs {order.totalPrice}</td>
                          <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            order.status === 'completed' ? "bg-green-500/10 text-green-500" :
                            order.status === 'processing' ? "bg-blue-500/10 text-blue-500" :
                            "bg-orange-500/10 text-orange-500"
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id!, 'completed')}
                                className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Mark as Completed"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id!, 'processing')}
                                className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Mark as Processing"
                              >
                                <TrendingUp className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
