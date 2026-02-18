'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, X, Loader2, Calendar, User, ClipboardList, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function DailyReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [caregivers, setCaregivers] = useState<any[]>([])
  
  const [newReport, setNewReport] = useState({
    client_id: '',
    caregiver_id: '',
    report_date: new Date().toISOString().split('T')[0],
    mood: 'Good',
    appetite: 'Normal',
    sleep_quality: 'Good',
    activities: '',
    notes: ''
  })

  useEffect(() => {
    fetchReports()
    fetchFormData()
  }, [])

  async function fetchReports() {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select(`*, client:clients(first_name, last_name), caregiver:profiles(first_name, last_name)`)
        .order('report_date', { ascending: false })
        .limit(50)

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
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

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .insert([newReport])
        .select(`*, client:clients(first_name, last_name), caregiver:profiles(first_name, last_name)`)

      if (error) throw error
      
      setReports([data[0], ...reports])
      setIsModalOpen(false)
      setNewReport({
        client_id: '',
        caregiver_id: '',
        report_date: new Date().toISOString().split('T')[0],
        mood: 'Good',
        appetite: 'Normal',
        sleep_quality: 'Good',
        activities: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please check the form.')
    } finally {
      setSubmitting(false)
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
          <p className="mt-2 text-gray-600">Track and monitor daily care activities</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Submit New Report
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
        {reports.map((report) => (
          <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-teal-50 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {report.client?.first_name} {report.client?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <User className="h-3 w-3 mr-1" />
                      Recorded by {report.caregiver?.first_name} {report.caregiver?.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 flex items-center justify-end">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(report.report_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Mood</span>
                    <span className="text-sm font-medium text-gray-900">{report.mood}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Appetite</span>
                    <span className="text-sm font-medium text-gray-900">{report.appetite}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Sleep</span>
                    <span className="text-sm font-medium text-gray-900">{report.sleep_quality}</span>
                  </div>
                </div>

                {report.activities && (
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Activities</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{report.activities}</p>
                  </div>
                )}

                {report.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider block mb-1">Clinical Notes</span>
                    <p className="text-sm text-yellow-800 italic leading-relaxed">{report.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-medium">No reports found</p>
            <p className="text-sm">Submit a new report to get started tracking care activities.</p>
          </div>
        )}
      </div>

      {/* Submit Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Submit Daily Care Report</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReport} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Client</label>
                  <select
                    required
                    value={newReport.client_id}
                    onChange={(e) => setNewReport({...newReport, client_id: e.target.value})}
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
                    value={newReport.caregiver_id}
                    onChange={(e) => setNewReport({...newReport, caregiver_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="">Select yourself</option>
                    {caregivers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Report Date</label>
                  <input
                    required
                    type="date"
                    value={newReport.report_date}
                    onChange={(e) => setNewReport({...newReport, report_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Mood</label>
                  <select
                    value={newReport.mood}
                    onChange={(e) => setNewReport({...newReport, mood: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option>Good</option>
                    <option>Neutral</option>
                    <option>Agitated</option>
                    <option>Depressed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Appetite</label>
                  <select
                    value={newReport.appetite}
                    onChange={(e) => setNewReport({...newReport, appetite: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option>Normal</option>
                    <option>Poor</option>
                    <option>Increased</option>
                    <option>Nauseous</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Activities Performed</label>
                <textarea
                  rows={3}
                  placeholder="Describe the activities performed during the shift..."
                  value={newReport.activities}
                  onChange={(e) => setNewReport({...newReport, activities: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Clinical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any medical concerns or observations..."
                  value={newReport.notes}
                  onChange={(e) => setNewReport({...newReport, notes: e.target.value})}
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
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
