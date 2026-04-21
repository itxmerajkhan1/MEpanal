import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { SERVICES } from '../constants';
import { Service, Order } from '../types';
import { useUser } from '../context/UserContext';
import { Users, Eye, UserPlus, Heart, ArrowRight, TrendingUp, CheckCircle, Clock, Shield } from 'lucide-react';
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
    document.title = 'SMM Panel - Dashboard';
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch recent orders
    const path = 'orders';
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
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
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#0a0a0c] transition-colors relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">SMM Panel Operational</span>
              </div>
              <h1 className="text-6xl font-black text-white italic tracking-tighter mb-2 uppercase leading-[0.9]">
                Welcome, <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600 bg-clip-text text-transparent">{userData?.firstName || 'Operator'}</span>
              </h1>
              <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-2xl">
                The SMM Panel terminal is active. Manage your assets and deploy marketing protocols across global networks.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { label: 'ACTIVE DEPLOYMENTS', value: recentOrders.filter(o => o.status !== 'completed').length, icon: TrendingUp, color: 'text-blue-500' },
            { label: 'SUCCESSFUL NODES', value: recentOrders.filter(o => o.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-500' },
            { label: 'PENDING TASKS', value: recentOrders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] -z-10" />
              <div className="bg-gray-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between hover:border-blue-500/30 transition-all h-full">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                  <p className="text-4xl font-black text-white italic">{stat.value}</p>
                </div>
                <div className={cn("p-5 rounded-3xl bg-black/40 shadow-inner", stat.color)}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Services Section */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-10">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
              <div className="w-12 h-1.5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
              Service Protocols
            </h2>
            
            <div className="flex items-center gap-2 p-1.5 bg-gray-900/40 rounded-2xl border border-white/5 shadow-inner">
              {['All', 'TikTok', 'Instagram', 'Facebook'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-8 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
                    activeTab === tab 
                      ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {filteredServices.map((service, i) => {
              const Icon = iconMap[service.icon];
              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedService(service)}
                  className="group relative cursor-pointer"
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-20 blur-3xl transition-opacity rounded-[2.5rem] -z-10 bg-gradient-to-br font-center",
                    service.color
                  )} />
                  <div className="relative bg-gray-900/40 backdrop-blur-3xl border border-white/5 p-9 rounded-[2.5rem] shadow-2xl hover:border-blue-500/30 transition-all overflow-hidden h-full flex flex-col">
                    <div className={cn(
                      "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 bg-gradient-to-br text-white shadow-xl relative z-10 mx-auto",
                      service.color
                    )}>
                      <Icon className="w-8 h-8 font-center" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase relative z-10">{service.name}</h3>
                    <p className="text-gray-500 text-sm mb-10 font-bold leading-relaxed flex-grow relative z-10">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                      <div className="space-y-1 text-left">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Rate Protocol</p>
                        <p className="text-blue-400 font-black text-2xl italic">Rs {service.pricePer1000} <span className="text-xs text-gray-600 not-italic font-bold">/1k</span></p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-600 transition-all shadow-lg group-hover:shadow-blue-500/50">
                        <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-white" />
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
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 mb-10">
             <div className="w-12 h-1.5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]" />
             Mission Logs
          </h2>
          <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Service Protocol</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Platform</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Units</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Credits</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-6 text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-10 py-20 text-center text-gray-500 font-black uppercase tracking-widest">
                        Zero logs detected. Deploy your first mission.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="font-black text-white uppercase italic tracking-wider">{order.serviceName}</div>
                          <div className="text-[10px] text-gray-600 truncate max-w-[200px] font-bold mt-1 uppercase leading-none">{order.link}</div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-[10px] font-black text-white bg-white/5 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-white/5">
                            {order.platform}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-gray-400 font-black italic">{order.quantity.toLocaleString()}</td>
                        <td className="px-10 py-8 font-black text-blue-400 italic">Rs {order.totalPrice}</td>
                        <td className="px-10 py-8">
                          <span className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg",
                            order.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/20" :
                            order.status === 'processing' ? "bg-blue-500/10 text-blue-400 shadow-blue-500/20" :
                            "bg-orange-500/10 text-orange-400 shadow-orange-500/20"
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
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
