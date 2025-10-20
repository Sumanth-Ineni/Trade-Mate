
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PnLCardProps {
  pnl: number;
}

// Mock forecast data
const generateForecastData = () => {
    const data = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastValue = 15000;
    
    for (let i = currentMonth; i < 12; i++) {
        const randomness = (Math.random() - 0.4) * 2000;
        lastValue += randomness + 1000; // general upward trend
        data.push({ name: months[i], forecast: Math.round(lastValue), lower: Math.round(lastValue * 0.8), upper: Math.round(lastValue * 1.2) });
    }
    return data;
};

const forecastData = generateForecastData();

export const PnLCard: React.FC<PnLCardProps> = ({ pnl }) => {
  const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg md:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <h3 className="text-lg font-medium text-gray-300">Rolling P&L</h3>
                <p className={`text-4xl font-bold mt-2 ${pnlColor}`}>
                    {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-300">Yearly Forecast</h4>
                    <p className="text-xl font-semibold text-cyan-400 mt-1">
                        $25,000 - $35,000
                    </p>
                    <p className="text-xs text-gray-400">Based on historic performance</p>
                </div>
            </div>
            <div className="md:col-span-2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} />
                    <YAxis stroke="#a0aec0" fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
                    <Area type="monotone" dataKey="forecast" stroke="#22d3ee" fillOpacity={1} fill="url(#colorForecast)" />
                </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};
