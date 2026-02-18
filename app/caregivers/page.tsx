'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, X, Loader2, Mail, Phone, Briefcase } from 'lucide-react'
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
  certifications: any[]
  hire_date: string
}

export default function CaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newCaregiver, setNewCaregiver] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'caregiver',
    status: 'active',
    hourly_rate: 25.00,
    skills: '',
    hire_date: new Date().toISOString().split('T')[0]
  })

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

  async function handleAddCaregiver(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // In a real app, you would use Supabase Auth to create the user first.
      // For this demo/setup, we'll insert directly into profiles with a generated UUID if allowed,
      // but typically you'd need the auth.uid().
      // Let's assume for now we're just managing the profiles.
      
      const skillsArray = newCaregiver.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      
      // Generate a temporary ID for the profile since we don't have Auth user creation here
      const tempId = crypto.randomUUID()

      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: tempId,
          first_name: newCaregiver.first_name,
          last_name: newCaregiver.last_name,
          email: newCaregiver.email,
          phone: newCaregiver.phone,
          role: newCaregiver.role,
          status: newCaregiver.status,
          hourly_rate: newCaregiver.hourly_rate,
          skills: skillsArray,
          hire_date: newCaregiver.hire_date
        }])
        .select()

      if (error) throw error
      
      setCaregivers([data[0], ...caregivers])
      setIsModalOpen(false)
      setNewCaregiver({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'caregiver',
        status: 'active',
        hourly_rate: 25.00,
        skills: '',
        hire_date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error adding caregiver:', error)
      alert('Failed to add caregiver. Note: Profiles must be linked to a valid Auth user in production.')
    } finally {
      setSubmitting(false)
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
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="ml-4 flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Caregiver
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">Total Caregivers</p>
          <p className="text-2xl font-bold text-gray-900">{caregivers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {caregivers.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {caregivers.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 font-medium">Avg. Hourly Rate</p>
          <p className="text-2xl font-bold text-teal-600">
            ${caregivers.length > 0 ? (caregivers.reduce((sum, c) => sum + (Number(c.hourly_rate) || 0), 0) / caregivers.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Caregiver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCaregivers.map((caregiver) => (
          <div
            key={caregiver.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {caregiver.first_name} {caregiver.last_name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Mail className="h-3 w-3 mr-1" />
                  {caregiver.email}
                </div>
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
                  <Phone className="h-3 w-3 mr-2" />
                  {caregiver.phone}
                </p>
              )}
              {caregiver.hourly_rate && (
                <p className="flex items-center">
                  <Briefcase className="h-3 w-3 mr-2" />
                  ${caregiver.hourly_rate}/hr
                </p>
              )}
            </div>

            {caregiver.skills && caregiver.skills.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {caregiver.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded border border-teal-100">
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
              <button className="flex-1 px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                View Profile
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
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

      {/* Add Caregiver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Caregiver</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddCaregiver} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input
                    required
                    type="text"
                    value={newCaregiver.first_name}
                    onChange={(e) => setNewCaregiver({...newCaregiver, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    required
                    type="text"
                    value={newCaregiver.last_name}
                    onChange={(e) => setNewCaregiver({...newCaregiver, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    required
                    type="email"
                    value={newCaregiver.email}
                    onChange={(e) => setNewCaregiver({...newCaregiver, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={newCaregiver.phone}
                    onChange={(e) => setNewCaregiver({...newCaregiver, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCaregiver.hourly_rate}
                    onChange={(e) => setNewCaregiver({...newCaregiver, hourly_rate: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Hire Date</label>
                  <input
                    type="date"
                    value={newCaregiver.hire_date}
                    onChange={(e) => setNewCaregiver({...newCaregiver, hire_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="CPR, First Aid, Patient Transfer..."
                  value={newCaregiver.skills}
                  onChange={(e) => setNewCaregiver({...newCaregiver, skills: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Caregiver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
