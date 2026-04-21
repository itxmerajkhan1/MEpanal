import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Link as LinkIcon, Hash, DollarSign } from 'lucide-react';
import { Service } from '../types';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

interface OrderModalProps {
  service: Service;
  onClose: () => void;
}

export default function OrderModal({ service, onClose }: OrderModalProps) {
  const { user, userData } = useUser();
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [loading, setLoading] = useState(false);

  const totalPrice = ((quantity / 1000) * service.pricePer1000).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) {
      toast.error('ACCESS DENIED: Please initialize session first.');
      return;
    }

    if (quantity < 100) {
       toast.error('VALIDATION ERROR: Minimum quantitiy is 100 units.');
       return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        serviceId: service.id,
        serviceName: service.name,
        platform: service.platform,
        link,
        quantity,
        pricePer1000: service.pricePer1000,
        totalPrice: Number(totalPrice),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      toast.success('MISSION DEPLOYED: Order logs successfully initialized.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'MISSION FAILED: Command execution error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-lg bg-[#0f0f12] rounded-[2.5rem] border border-white/10 p-10 shadow-[0_0_50px_rgba(37,99,235,0.2)] overflow-hidden"
        >
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${service.color} shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-3xl bg-gradient-to-br ${service.color} text-white shadow-2xl relative`}>
                <ShoppingCart className="w-7 h-7" />
                <div className="absolute inset-0 bg-white/20 rounded-3xl animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{service.name}</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">MISSION PROTOCOL: INITIALIZE</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <LinkIcon className="w-3 h-3 text-blue-400" />
                Target Link / Terminal ID
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="DEPLOYMENT TARGET (e.g. Profile URL)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-black italic tracking-wider group-hover:border-white/10"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 border border-blue-400/50 rounded-full animate-ping pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Hash className="w-3 h-3 text-emerald-400" />
                Unit Payload (Quantity)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-black italic tracking-wider"
                required
              />
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-600">Min Deployment: 100 Units</span>
                <span className="text-emerald-500 italic">Rate: Rs {service.pricePer1000}/1k</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Price Protocol</span>
                <span className="font-black text-white italic">Rs {service.pricePer1000}</span>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-lg font-black text-white uppercase italic tracking-tighter">Total Credits</span>
                <div className="flex items-baseline gap-1 animate-pulse">
                  <span className="text-sm font-black text-blue-400 uppercase italic mr-1">Rs</span>
                  <span className="text-4xl font-black text-blue-400 italic tracking-tighter">{totalPrice}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full bg-white text-black font-black py-5 rounded-2xl shadow-[0_15px_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm group`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Execute Deployment</span>
                  <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
