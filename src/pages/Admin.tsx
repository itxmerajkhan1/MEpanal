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

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export default function Admin() {
  const { userData } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'SMM Panel - Admin';
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

  // Chart Data Preparation
  const chartData = orders.reduce((acc: any[], order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    const existing = acc.find(item => item.name === date);
    if (existing) {
      existing.value += order.totalPrice;
      existing.count += 1;
    } else {
      acc.push({ name: date, value: order.totalPrice, count: 1 });
    }
    return acc;
  }, []).slice(-7);

  const platformData = orders.reduce((acc: any[], order) => {
    const existing = acc.find(item => item.name === order.platform);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: order.platform, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

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
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#0a0a0c] transition-colors relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">ADMIN COMMAND CENTER</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                Insights & <span className="text-emerald-500">OPERATIONS</span>
              </h1>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Lookup orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-2xl py-3 pl-11 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-white w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Admin Insights Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-gray-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3 italic">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Revenue Protocol (Last 7 Days)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3 italic">
              <Filter className="w-5 h-5 text-purple-400" />
              Distribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '1rem', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'TOTAL MISSION LOGS', value: orders.length, icon: ShoppingBag, color: 'text-blue-500' },
            { label: 'ACTIVE DEPLOYMENTS', value: orders.filter(o => o.status !== 'completed').length, icon: TrendingUp, color: 'text-purple-500' },
            { label: 'COMPLETED LOGS', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-500' },
            { label: 'PENDING TASKS', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'text-orange-500' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2rem] shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-white italic">{stat.value}</p>
                </div>
                <div className={cn("p-4 rounded-2xl bg-black/40 shadow-inner", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Authorized User</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Network</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Service</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Quantity</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Credits</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Command</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-10 py-20 text-center text-gray-500 font-black uppercase tracking-widest italic">
                        No operational data detected.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                                <User className="w-5 h-4 text-gray-500 group-hover:text-emerald-400" />
                              </div>
                              <div>
                                <p className="font-black text-white uppercase italic text-sm">{order.firstName} {order.lastName}</p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest truncate max-w-[150px]">{order.link}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                             <span className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">{order.platform}</span>
                          </td>
                          <td className="px-10 py-8 text-gray-300 font-bold uppercase italic text-sm">{order.serviceName}</td>
                          <td className="px-10 py-8 text-gray-400 font-black italic">{order.quantity.toLocaleString()}</td>
                          <td className="px-10 py-8 text-emerald-400 font-black italic">Rs {order.totalPrice}</td>
                          <td className="px-10 py-8">
                          <span className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md",
                            order.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" :
                            order.status === 'processing' ? "bg-blue-500/10 text-blue-400" :
                            "bg-orange-500/10 text-orange-400"
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            {order.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id!, 'completed')}
                                className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-500/40"
                                title="Execute Completion"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id!, 'processing')}
                                className="p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/40"
                                title="Execute Processing"
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
