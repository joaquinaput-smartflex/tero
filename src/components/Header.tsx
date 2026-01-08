'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign,
  ChefHat,
  BookOpen,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Users,
  User,
  ChevronDown,
  CalendarDays,
  PartyPopper,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Costos', href: '/costos', icon: DollarSign },
  { name: 'Recetas', href: '/recetas', icon: ChefHat },
  { name: 'Carta', href: '/carta', icon: BookOpen },
];

const eventosNavigation = [
  { name: 'Eventos', href: '/eventos', icon: PartyPopper },
  { name: 'Calendario', href: '/eventos/calendario', icon: CalendarDays },
  { name: 'Cobranzas', href: '/eventos/cobranzas', icon: Wallet },
  { name: 'Analytics', href: '/eventos/analytics', icon: BarChart3 },
];

const adminNavigation = [
  { name: 'Usuarios', href: '/usuarios', icon: Users },
];

export default function Header() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [eventosMenuOpen, setEventosMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const eventosMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (eventosMenuRef.current && !eventosMenuRef.current.contains(event.target as Node)) {
        setEventosMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isEventosActive = pathname.startsWith('/eventos');

  if (!user) return null;

  const allNav = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    chef: 'bg-orange-100 text-orange-700',
    viewer: 'bg-gray-100 text-gray-700',
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Tero</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            {allNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}

            {/* Eventos Dropdown */}
            <div className="relative" ref={eventosMenuRef}>
              <button
                onClick={() => setEventosMenuOpen(!eventosMenuOpen)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isEventosActive
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <PartyPopper className="w-4 h-4" />
                Eventos
                <ChevronDown className={`w-3 h-3 transition-transform ${eventosMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {eventosMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {eventosNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setEventosMenuOpen(false)}
                        className={`
                          flex items-center gap-2 px-4 py-2 text-sm
                          ${isActive
                            ? 'bg-amber-50 text-amber-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop User Menu */}
            <div className="hidden sm:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user.nombre || user.username}
                  </div>
                  <div className={`text-xs px-1.5 py-0.5 rounded ${roleColors[user.role]}`}>
                    {user.role}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 mb-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{user.nombre || user.username}</div>
                <div className={`text-xs px-1.5 py-0.5 rounded inline-block ${roleColors[user.role]}`}>
                  {user.role}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {allNav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Eventos section */}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">Eventos</div>
                {eventosNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                        ${isActive
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-2 border-t border-gray-200 pt-4"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
