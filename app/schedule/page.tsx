'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, Search, X, Loader2, User, UserCheck, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function SchedulePage() {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [caregivers, setCaregivers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newShift, setNewShift] = useState({
    client_id: '',
    caregiver_id: '',
    shift_date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '16:00',
    status: 'scheduled',
    notes: ''
  })

  useEffect(() => {
    fetchShifts()
    fetchFormData()
  }, [])

  async function fetchShifts() {
    try {
      const { data, error } = await supabase
        .from('schedule_shifts')
        .select(`
          *,
          client:clients(first_name, last_name),
          caregiver:profiles(first_name, last_name)
        `)
        .order('shift_date', { ascending: true })

      if (error) throw error
      setShifts(data || [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFormData() {
    try {
      const [{ data: clientsData }, { data: caregiversData }] = await Promise.all([
        supabase.from('clients').select('id, first_name, last_name').eq('status', 'active'),
        supabase.from('profiles').select('id, first_name, last_name').eq('role', 'caregiver').eq('status', 'active')
      ])
      setClients(clientsData || [])
      setCaregivers(caregiversData || [])
    } catch (error) {
      console.error('Error fetching form data:', error)
    }
  }

  async function handleAddShift(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('schedule_shifts')
        .insert([{
          ...newShift,
          created_by: 'ahibrukllowwxerodlkg' // Fallback or real user ID if available
        }])
        .select(`*, client:clients(first_name, last_name), caregiver:profiles(first_name, last_name)`)

      if (error) throw error
      
      setShifts([...shifts, data[0]].sort((a, b) => a.shift_date.localeCompare(b.shift_date)))
      setIsModalOpen(false)
      setNewShift({
        client_id: '',
        caregiver_id: '',
        shift_date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '16:00',
        status: 'scheduled',
        notes: ''
      })
    } catch (error) {
      console.error('Error adding shift:', error)
      alert('Failed to add shift. Please check the form.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredShifts = shifts.filter(shift =>
    `${shift.client?.first_name} ${shift.client?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${shift.caregiver?.first_name} ${shift.caregiver?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      conflict: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }
    return colors[status as keyof typeof colors] || colors.scheduled
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
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-gray-600">Manage caregiver shifts and assignments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Shift
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Shift List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client or caregiver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShifts.map((shift) => (
              <div key={shift.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-bold text-gray-900">{new Date(shift.shift_date).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase border ${getStatusColor(shift.status)}`}>
                    {shift.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-700 font-medium">{shift.start_time} - {shift.end_time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Client: </span>
                    <span className="ml-1 font-bold text-gray-900">{shift.client?.first_name} {shift.client?.last_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">Caregiver: </span>
                    <span className="ml-1 font-bold text-gray-900">{shift.caregiver?.first_name} {shift.caregiver?.last_name}</span>
                  </div>
                </div>

                {shift.notes && (
                  <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500 italic">
                    {shift.notes}
                  </div>
                )}
              </div>
            ))}
            {filteredShifts.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>No shifts found for the current filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions/Stats */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Scheduling Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Today&apos;s Shifts</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-lg font-bold text-xs">
                  {shifts.filter(s => s.shift_date === new Date().toISOString().split('T')[0]).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Pending Approvals</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg font-bold text-xs">
                  {shifts.filter(s => s.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Conflicts</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-lg font-bold text-xs">
                  {shifts.filter(s => s.status === 'conflict').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Create New Shift</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddShift} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Client</label>
                  <select
                    required
                    value={newShift.client_id}
                    onChange={(e) => setNewShift({...newShift, client_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="">Select a client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Caregiver</label>
                  <select
                    required
                    value={newShift.caregiver_id}
                    onChange={(e) => setNewShift({...newShift, caregiver_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="">Select a caregiver</option>
                    {caregivers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Date</label>
                  <input
                    required
                    type="date"
                    value={newShift.shift_date}
                    onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Start Time</label>
                  <input
                    required
                    type="time"
                    value={newShift.start_time}
                    onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">End Time</label>
                  <input
                    required
                    type="time"
                    value={newShift.end_time}
                    onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Shift Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions for the caregiver..."
                  value={newShift.notes}
                  onChange={(e) => setNewShift({...newShift, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-4 pt-6">
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
                  className="flex-1 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center shadow-lg shadow-teal-100 transition-all"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
