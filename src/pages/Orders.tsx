import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Order } from '../types';
import { useUser } from '../context/UserContext';
import { ShoppingBag, Search, Filter, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Orders() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = 'SMM Panel - My Orders';
  }, []);

  useEffect(() => {
    if (!user) return;

    const path = 'orders';
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
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
  }, [user]);

  const filteredOrders = orders.filter(order => 
    order.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.link.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#0a0a0c] transition-colors relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">MISSION HISTORY</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                Deployment <span className="text-blue-500">ARCHIVE</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Scan mission logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-900/60 backdrop-blur-md border border-white/5 rounded-2xl py-3 pl-11 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-white w-64"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredOrders.length === 0 ? (
              <div className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-20 text-center shadow-2xl">
                <div className="w-20 h-20 bg-black/40 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <ShoppingBag className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase italic tracking-tighter">Zero missions detected</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initialize your first service protocol to see logs here.</p>
              </div>
            ) : (
              filteredOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-gray-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl hover:border-blue-500/30 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-black/40 rounded-3xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                        <ShoppingBag className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{order.serviceName}</h3>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                          <span className="truncate max-w-[250px]">{order.link}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Network</p>
                        <p className="text-sm font-black text-white italic uppercase tracking-wider">{order.platform}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Units</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">{order.quantity.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Credits</p>
                        <p className="text-xl font-black text-blue-400 italic tracking-tighter">Rs {order.totalPrice}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Status</p>
                        <span className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block shadow-lg",
                          order.status === 'completed' ? "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/20" :
                          order.status === 'processing' ? "bg-blue-500/10 text-blue-400 shadow-blue-500/20" :
                          "bg-orange-500/10 text-orange-400 shadow-orange-500/20"
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <div className="hidden md:block space-y-1">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Timestamp</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
