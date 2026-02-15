'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, ShoppingBag, List, FileText, Users, LogOut, Moon, Sun, Globe } from 'lucide-react';

const navItems = [
    { name: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'pos', href: '/dashboard/sales', icon: ShoppingBag },
    { name: 'products', href: '/dashboard/products', icon: ShoppingBag },
    { name: 'categories', href: '/dashboard/categories', icon: List },
    { name: 'receipts', href: '/dashboard/receipts', icon: FileText },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <div className={`flex h-screen w-64 flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'} text-white transition-colors duration-300`}>
            <div className="flex h-16 items-center justify-center border-b border-gray-700">
                <h1 className="text-xl font-bold">{t('homeSales')}</h1>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-md px-2 py-2 text-base font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                                {t(item.name)}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-gray-700 p-4 space-y-2">
                {/* Toggles */}
                <div className="flex gap-2 justify-center mb-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-700"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-300" />}
                    </button>
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-full hover:bg-gray-700 flex items-center gap-1"
                        title="Switch Language"
                    >
                        <Globe className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-bold">{language.toUpperCase()}</span>
                    </button>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                        <p className="text-xs font-medium text-gray-400">{user?.role || 'Staff'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('logout')}
                </button>
            </div>
        </div>
    );
}
