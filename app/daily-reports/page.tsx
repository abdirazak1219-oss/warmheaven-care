'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function DailyReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
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
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
          <p className="mt-2 text-gray-600">Track daily care activities</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          <Plus className="h-5 w-5 mr-2" />Submit Report
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        {reports.map((report) => (
          <div key={report.id} className="border-b border-gray-200 p-6 last:border-0">
            <div className="flex items-start gap-4">
              <FileText className="h-6 w-6 text-teal-600 mt-1" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.client?.first_name} {report.client?.last_name}</h3>
                    <p className="text-sm text-gray-600">by {report.caregiver?.first_name} {report.caregiver?.last_name}</p>
                  </div>
                  <span className="text-sm text-gray-500">{report.report_date}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  {report.mood && <div><span className="font-medium">Mood:</span> {report.mood}</div>}
                  {report.appetite && <div><span className="font-medium">Appetite:</span> {report.appetite}</div>}
                  {report.sleep_quality && <div><span className="font-medium">Sleep:</span> {report.sleep_quality}</div>}
                </div>
                {report.notes && <p className="mt-2 text-sm text-gray-700">{report.notes}</p>}
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && <div className="text-center py-12 text-gray-500">No reports found</div>}
      </div>
    </div>
  )
}
