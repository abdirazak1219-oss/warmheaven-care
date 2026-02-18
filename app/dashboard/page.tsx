'use client'

import { Users, Calendar, DollarSign, UserCheck } from 'lucide-react'

export default function DashboardPage() {
  // Mock stats - replace with real data from Supabase
  const stats = [
    {
      name: 'Active Clients',
      value: '247',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Scheduled Visits Today',
      value: '89',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Outstanding Invoices',
      value: '$24,580',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Active Caregivers',
      value: '156',
      icon: UserCheck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <p className="text-gray-500">Activity feed coming soon...</p>
      </div>
    </div>
  )
}
