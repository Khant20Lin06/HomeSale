'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Search, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function SalesPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find((item) => item.product._id === product._id);
        if (existingItem) {
            if (existingItem.quantity >= product.stock) return alert('Not enough stock');
            setCart(cart.map((item) =>
                item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            if (product.stock <= 0) return alert('Out of stock');
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter((item) => item.product._id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map((item) => {
            if (item.product._id === productId) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) return item;
                if (newQuantity > item.product.stock) {
                    alert('Not enough stock');
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!confirm(`Confirm checkout for ${totalAmount} MMK?`)) return;

        try {
            const saleData = {
                items: cart.map((item) => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                totalAmount,
                cashierId: user.id
            };

            await api.post('/sales', saleData);
            alert('Sale completed successfully!');
            setCart([]);
            fetchProducts(); // Refresh stock
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout failed');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] gap-6">
            {/* Product List */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow bg-gray-50 flex flex-col justify-between"
                                onClick={() => addToCart(product)}
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                    <p className="text-sm text-gray-800">{product.category?.name}</p>
                                </div>
                                <div className="mt-2 flex justify-between items-end">
                                    <span className="font-bold text-blue-600">{product.price} Ks</span>
                                    <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        Stock: {product.stock}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart */}
            <div className="w-96 bg-white rounded-lg shadow-md flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2" /> Current Order
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-800 mt-10">Cart is empty</div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product._id} className="flex justify-between items-center border-b pb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium">{item.product.name}</h4>
                                    <p className="text-sm text-gray-800">{item.product.price} x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 hover:bg-gray-200 rounded">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-6 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 hover:bg-gray-200 rounded">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeFromCart(item.product._id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center mb-4 text-xl font-bold">
                        <span>Total:</span>
                        <span>{totalAmount} Ks</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className={`w-full py-3 rounded-lg font-bold text-white ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
