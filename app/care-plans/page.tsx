'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function CarePlansPage() {
  const [carePlans, setCarePlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCarePlans()
  }, [])

  async function fetchCarePlans() {
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .select(`
          *,
          client:clients(first_name, last_name),
          creator:profiles!care_plans_created_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCarePlans(data || [])
    } catch (error) {
      console.error('Error fetching care plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600">Loading...</div></div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Care Plans</h1>
        <p className="mt-2 text-gray-600">Manage client care plans</p>
      </div>

      <div className="mb-6 flex justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search care plans..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <button className="ml-4 flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus className="h-5 w-5 mr-2" />
          New Care Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {carePlans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <FileText className="h-6 w-6 text-teal-600 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Client: {plan.client?.first_name} {plan.client?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(plan.status)}`}>
                {plan.status}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 text-sm text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100">View Details</button>
              <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Edit</button>
            </div>
          </div>
        ))}
        {carePlans.length === 0 && <div className="text-center py-12"><p className="text-gray-500">No care plans found</p></div>}
      </div>
    </div>
  )
}
