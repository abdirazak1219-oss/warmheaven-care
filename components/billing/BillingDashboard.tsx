'use client'

import { useState, useEffect } from 'react'
import { DollarSign, FileText, CheckCircle, AlertCircle, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function BillingDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    paid: 0,
    overdue: 0,
    total: 0,
    thisMonth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('status, total, issue_date')

      if (error) throw error

      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()

      const summary = (data || []).reduce((acc, inv) => {
        const total = Number(inv.total)
        acc.total += total
        
        if (inv.status === 'pending') acc.pending += total
        else if (inv.status === 'paid') acc.paid += total
        else if (inv.status === 'overdue') acc.overdue += total

        const invDate = new Date(inv.issue_date)
        if (invDate.getMonth() === thisMonth && invDate.getFullYear() === thisYear) {
          acc.thisMonth += total
        }

        return acc
      }, { pending: 0, paid: 0, overdue: 0, total: 0, thisMonth: 0 })

      setStats(summary)
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-32"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded">Overall</span>
        </div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Revenue</h3>
        <p className="text-2xl font-black text-gray-900">${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded">Pending</span>
        </div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Accounts Receivable</h3>
        <p className="text-2xl font-black text-gray-900">${stats.pending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-green-50 p-2 rounded-lg text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Success</span>
        </div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Paid Invoices</h3>
        <p className="text-2xl font-black text-gray-900">${stats.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Monthly</span>
        </div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">This Month</h3>
        <p className="text-2xl font-black text-gray-900">${stats.thisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  )
}
