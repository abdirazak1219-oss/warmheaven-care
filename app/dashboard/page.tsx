'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, DollarSign, UserCheck, Loader2, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: 'Active Clients', value: '0', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: 'Visits Today', value: '0', icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Pending Invoices', value: '$0', icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: 'Active Caregivers', value: '0', icon: UserCheck, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  ])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0]

      const [
        { count: activeClients },
        { count: activeCaregivers },
        { count: visitsToday },
        { data: invoices },
        { data: logs }
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'caregiver').eq('status', 'active'),
        supabase.from('schedule_shifts').select('*', { count: 'exact', head: true }).eq('shift_date', today),
        supabase.from('invoices').select('total').eq('status', 'pending'),
        supabase.from('audit_logs').select(`*, user:profiles(first_name, last_name)`).order('created_at', { ascending: false }).limit(5)
      ])

      const totalInvoiced = invoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0

      setStats([
        { name: 'Active Clients', value: (activeClients || 0).toString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        { name: 'Visits Today', value: (visitsToday || 0).toString(), icon: Calendar, color: 'text-green-600', bgColor: 'bg-green-100' },
        { name: 'Pending Invoices', value: `$${totalInvoiced.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        { name: 'Active Caregivers', value: (activeCaregivers || 0).toString(), icon: UserCheck, color: 'text-teal-600', bgColor: 'bg-teal-100' },
      ])

      setRecentActivity(logs || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here&apos;s a real-time overview of your agency.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-teal-600" />
              Recent Activity
            </h2>
            <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">View All</button>
          </div>
          
          <div className="space-y-6">
            {recentActivity.map((activity, idx) => (
              <div key={activity.id || idx} className="flex gap-4">
                <div className="mt-1 h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">
                      {activity.user?.first_name} {activity.user?.last_name || 'System'}
                    </span>
                    {' '}{activity.action} in <span className="font-medium">{activity.table_name}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activity found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions or Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Tasks</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <input type="checkbox" className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
              <label className="ml-3 text-sm text-gray-700">Review pending timesheets for Section 21</label>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <input type="checkbox" className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
              <label className="ml-3 text-sm text-gray-700">Update care plan for Jane Cooper</label>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
              <input type="checkbox" className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
              <label className="ml-3 text-sm text-gray-700">Check Maine DHHS rate updates for 2026</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
