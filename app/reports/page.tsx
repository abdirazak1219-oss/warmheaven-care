'use client'

import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600">View operational metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { name: 'Total Clients', value: '247', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
          { name: 'Active Caregivers', value: '156', icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-100' },
          { name: 'Visits This Month', value: '2,431', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100' },
          { name: 'Revenue YTD', value: '$1.2M', icon: TrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-100' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white border border-gray-200 rounded-lg p-6">
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

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-6 w-6 text-teal-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
        </div>
        <p className="text-gray-500">Advanced analytics and charts coming soon...</p>
      </div>
    </div>
  )
}

import { UserCheck } from 'lucide-react'
