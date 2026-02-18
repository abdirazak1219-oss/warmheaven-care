'use client'

import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface Caregiver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: string
  role: string
  hourly_rate: number
  skills: string[]
  certifications: string[]
}

export default function CaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCaregivers()
  }, [])

  async function fetchCaregivers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'caregiver')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCaregivers((data as unknown as Caregiver[]) || [])
    } catch (error) {
      console.error('Error fetching caregivers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCaregivers = caregivers.filter(caregiver =>
    `${caregiver.first_name} ${caregiver.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caregiver.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading caregivers...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Caregivers</h1>
        <p className="mt-2 text-gray-600">Manage your caregiver team</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search caregivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button className="ml-4 flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus className="h-5 w-5 mr-2" />
          Add Caregiver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Caregivers</p>
          <p className="text-2xl font-bold text-gray-900">{caregivers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {caregivers.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {caregivers.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Avg. Hourly Rate</p>
          <p className="text-2xl font-bold text-teal-600">
            ${caregivers.length > 0 ? (caregivers.reduce((sum, c) => sum + (c.hourly_rate || 0), 0) / caregivers.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Caregiver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCaregivers.map((caregiver) => (
          <div
            key={caregiver.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {caregiver.first_name} {caregiver.last_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{caregiver.email}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(caregiver.status)}`}>
                    {caregiver.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {caregiver.phone && (
                <p className="flex items-center">
                  <span className="font-medium mr-2">Phone:</span>
                  {caregiver.phone}
                </p>
              )}
              {caregiver.hourly_rate && (
                <p className="flex items-center">
                  <span className="font-medium mr-2">Rate:</span>
                  ${caregiver.hourly_rate}/hr
                </p>
              )}
            </div>

            {caregiver.skills && caregiver.skills.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {caregiver.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                      {skill}
                    </span>
                  ))}
                  {caregiver.skills.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{caregiver.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100">
                View Profile
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCaregivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No caregivers found</p>
        </div>
      )}
    </div>
  )
}
