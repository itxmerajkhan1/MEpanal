import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { SERVICES } from '../constants';
import { Service, Order } from '../types';
import { useUser } from '../context/UserContext';
import { Users, Eye, UserPlus, Heart, ArrowRight, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import OrderModal from '../components/OrderModal';

const iconMap: Record<string, any> = {
  Users,
  Eye,
  UserPlus,
  Heart,
};

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Dashboard() {
  const { user, userData } = useUser();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'TikTok' | 'Instagram' | 'Facebook'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'ME Panel - Dashboard';
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch recent orders
    const path = 'orders';
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubOrders = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRecentOrders(orders);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => {
      unsubOrders();
    };
  }, [user]);

  const filteredServices = SERVICES.filter(s => activeTab === 'All' || s.platform === activeTab);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/50">
              <span className="text-white font-black text-xs leading-none">ME</span>
            </div>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">ME Panel Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{userData?.firstName || 'User'}</span>!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your social media growth and track your orders.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Active Orders', value: recentOrders.filter(o => o.status !== 'completed').length, icon: TrendingUp, color: 'text-blue-500' },
            { label: 'Completed', value: recentOrders.filter(o => o.status === 'completed').length, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Pending', value: recentOrders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={cn("p-4 rounded-2xl bg-gray-50 dark:bg-white/5", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Premium Services</h2>
            
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-x-auto no-scrollbar">
              {['All', 'TikTok', 'Instagram', 'Facebook'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === tab 
                      ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg" 
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((service, i) => {
              const Icon = iconMap[service.icon];
              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -10, rotateX: 2, rotateY: 2 }}
                  onClick={() => setSelectedService(service)}
                  className="group relative cursor-pointer"
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 blur-2xl transition-opacity rounded-3xl",
                    service.color
                  )} />
                  <div className="relative bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden h-full flex flex-col">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br text-white shadow-lg",
                      service.color
                    )}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{service.platform}</span>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Per 1000</p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-black text-lg">Rs {service.pricePer1000}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Recent Orders</h2>
          <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Service</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Platform</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Quantity</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Price</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No orders found. Start growing today!
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{order.serviceName}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">{order.link}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{order.platform}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">{order.quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">Rs {order.totalPrice}</td>
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
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedService && (
        <OrderModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
