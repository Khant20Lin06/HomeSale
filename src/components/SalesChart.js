'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-400">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend (Last 7 Days)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#4F46E5" name="Sales (MMK)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
