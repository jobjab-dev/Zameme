'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useZameme } from '~/hooks/useZameme';
import { ethers } from 'ethers';

export function PriceChart({ tokenAddress }: { tokenAddress: string }) {
  const { getTokenInfo } = useZameme();
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const info = await getTokenInfo(tokenAddress);
      if (!info) return;

      const currentPrice = parseFloat(ethers.formatEther(info.currentPrice));
      const timestamp = new Date().toLocaleTimeString();

      setPriceHistory((prev) => {
        const newData = [...prev, { time: timestamp, price: currentPrice }];
        return newData.slice(-20); // Keep last 20 points
      });
    };

    load();
    const interval = setInterval(load, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [tokenAddress, getTokenInfo]);

  return (
    <div className="bg-yellow-400 text-black p-4 md:p-6 rounded-lg border-4 border-yellow-400">
      <h2 className="text-xl md:text-2xl font-black mb-4">📊 Price Chart</h2>
      
      {priceHistory.length > 1 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
            <XAxis 
              dataKey="time" 
              stroke="#000"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#000"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => value.toExponential(2)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#000', 
                border: '2px solid #FFD700',
                borderRadius: '8px',
                color: '#FFD700'
              }}
              formatter={(value: any) => [`${value.toExponential(4)} ETH`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#000" 
              strokeWidth={3}
              dot={{ fill: '#000', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-600">Collecting price data...</p>
        </div>
      )}
    </div>
  );
}

