import Link from 'next/link';
import { DollarSign, ChefHat, BookOpen, LayoutDashboard, ArrowRight } from 'lucide-react';

const features = [
  {
    name: 'Costos de Insumos',
    description: 'Seguimiento de precios de ingredientes con IVA, mermas y variaciones históricas.',
    href: '/costos',
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    name: 'Recetas',
    description: 'Creación de recetas con cálculo automático de costos y subrecetas.',
    href: '/recetas',
    icon: ChefHat,
    color: 'bg-orange-500',
  },
  {
    name: 'Carta',
    description: 'Gestión de menú con objetivos de margen y alertas de rentabilidad.',
    href: '/carta',
    icon: BookOpen,
    color: 'bg-blue-500',
  },
  {
    name: 'Dashboard',
    description: 'Métricas de negocio, alertas y variaciones de precios en tiempo real.',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'bg-purple-500',
  },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Tero
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Sistema de gestión de costos gastronómicos.
          Controlá tus ingredientes, recetas y márgenes en un solo lugar.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.name}
              href={feature.href}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-gray-300"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Ir al módulo
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick stats placeholder */}
      <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumen del Sistema</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">156</div>
            <div className="text-sm text-gray-500">Insumos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">47</div>
            <div className="text-sm text-gray-500">Recetas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">49</div>
            <div className="text-sm text-gray-500">Platos en Carta</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">5</div>
            <div className="text-sm text-gray-500">Alertas de Margen</div>
          </div>
        </div>
      </div>
    </div>
  );
}
