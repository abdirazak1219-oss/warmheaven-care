'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Search, X, Loader2, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function CarePlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newPlan, setNewPlan] = useState({
    client_id: '',
    status: 'draft',
    version: 1,
    diagnosis: '',
    goals: '',
    interventions: '',
    dietary_needs: '',
    mobility_needs: '',
    emergency_instructions: ''
  })

  useEffect(() => {
    fetchPlans()
    fetchFormData()
  }, [])

  async function fetchPlans() {
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .select(`*, client:clients(first_name, last_name)`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFormData() {
    try {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .eq('status', 'active')
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching form data:', error)
    }
  }

  async function handleAddPlan(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .insert([newPlan])
        .select(`*, client:clients(first_name, last_name)`)

      if (error) throw error
      
      setPlans([data[0], ...plans])
      setIsModalOpen(false)
      setNewPlan({
        client_id: '',
        status: 'draft',
        version: 1,
        diagnosis: '',
        goals: '',
        interventions: '',
        dietary_needs: '',
        mobility_needs: '',
        emergency_instructions: ''
      })
    } catch (error) {
      console.error('Error adding plan:', error)
      alert('Failed to add care plan. Please check the form.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredPlans = plans.filter(plan =>
    `${plan.client?.first_name} ${plan.client?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[status as keyof typeof colors] || colors.draft
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Care Plans</h1>
          <p className="mt-2 text-gray-600">Comprehensive care strategies for clients</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Plan
        </button>
      </div>

      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-teal-50 p-2 rounded-lg">
                <ClipboardList className="h-6 w-6 text-teal-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase border ${getStatusColor(plan.status)}`}>
                {plan.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {plan.client?.first_name} {plan.client?.last_name}
            </h3>
            <p className="text-sm text-gray-500 mb-4 flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              Version {plan.version} • Created {new Date(plan.created_at).toLocaleDateString()}
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-bold text-gray-700 block">Diagnosis:</span>
                <p className="text-gray-600 line-clamp-2">{plan.diagnosis || 'No diagnosis recorded'}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Goals:</span>
                <p className="text-gray-600 line-clamp-2">{plan.goals || 'No goals specified'}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm font-bold text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                View Plan
              </button>
              <button className="px-3 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
        {filteredPlans.length === 0 && (
          <div className="col-span-full py-24 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-bold">No care plans found</p>
            <p className="text-sm">Create a care plan to start managing client needs.</p>
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Create Care Plan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddPlan} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Client Selection</label>
                  <select
                    required
                    value={newPlan.client_id}
                    onChange={(e) => setNewPlan({...newPlan, client_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="">Select a client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Initial Status</label>
                  <select
                    value={newPlan.status}
                    onChange={(e) => setNewPlan({...newPlan, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Diagnosis & Medical History</label>
                <textarea
                  rows={2}
                  placeholder="Enter medical conditions..."
                  value={newPlan.diagnosis}
                  onChange={(e) => setNewPlan({...newPlan, diagnosis: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Care Goals</label>
                  <textarea
                    rows={4}
                    placeholder="Achievable goals..."
                    value={newPlan.goals}
                    onChange={(e) => setNewPlan({...newPlan, goals: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Interventions</label>
                  <textarea
                    rows={4}
                    placeholder="Specific care actions..."
                    value={newPlan.interventions}
                    onChange={(e) => setNewPlan({...newPlan, interventions: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center transition-all"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
