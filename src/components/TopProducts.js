'use client';

export default function TopProducts({ data }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-400">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((product) => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.totalQuantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.totalRevenue?.toLocaleString()} MMK</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
