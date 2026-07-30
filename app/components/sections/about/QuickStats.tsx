"use client";
import { motion } from 'motion/react';
import React from 'react';

export interface StatItem {
  value: React.ReactNode;
  label: React.ReactNode;
}

interface QuickStatsProps {
  isVisible: boolean;
  stats: StatItem[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ isVisible, stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="grid grid-cols-3 gap-4 pt-6"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={isVisible ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.5, delay: 1 + index * 0.1, type: 'spring', bounce: 0.5 }}
          className="text-center"
        >
          <div className="text-3xl font-bold bg-gradient-to-r from-[#00bfe6] to-[#0096c7] bg-clip-text text-transparent">
            {stat.value}
          </div>
          <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};
