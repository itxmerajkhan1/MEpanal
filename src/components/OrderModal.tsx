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
      toast.error('Please login to place an order');
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
      toast.success('Order placed successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl overflow-hidden"
        >
          <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${service.color}`} />
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{service.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Place your order below</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Profile Link / Username
              </label>
              <input
                type="text"
                placeholder="https://tiktok.com/@username"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Quantity
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Minimum order: 100 units</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">1000 = Rs {service.pricePer1000}</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">Price per 1000</span>
                <span className="font-semibold text-gray-900 dark:text-white">Rs {service.pricePer1000}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total Price</span>
                <div className="flex items-center gap-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  <span className="text-sm font-bold mr-1">Rs</span>
                  <span>{totalPrice}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${service.color} text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Confirm Order</span>
                  <ShoppingCart className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
