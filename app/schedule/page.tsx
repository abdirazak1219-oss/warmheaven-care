'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Shift } from '@/lib/supabase/types'

export default function SchedulePage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShifts()
  }, [])

  async function fetchShifts() {
    try {
      const { data, error } = await supabase
        .from('schedule_shifts')
        .select(`
          *,
          client:clients(first_name, last_name),
          caregiver:profiles!schedule_shifts_caregiver_id_fkey(first_name, last_name)
        `)
        .gte('shift_date', new Date().toISOString().split('T')[0])
        .order('shift_date', { ascending: true })
        .limit(20)

      if (error) throw error
      setShifts((data as unknown as Shift[]) || [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      conflict: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status as keyof typeof colors] || colors.scheduled
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-lg text-gray-600">Loading...</div></div>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <p className="mt-2 text-gray-600">Manage caregiver shifts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Shifts</h2>
            <div className="space-y-4">
              {shifts.map((shift) => (
                <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{shift.shift_date}</span>
                        <Clock className="h-4 w-4 text-gray-500 ml-2" />
                        <span className="text-sm text-gray-600">{shift.start_time} - {shift.end_time}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>Client:</strong> {shift.client?.first_name} {shift.client?.last_name}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Caregiver:</strong> {shift.caregiver?.first_name} {shift.caregiver?.last_name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(shift.status)}`}>
                      {shift.status}
                    </span>
                  </div>
                </div>
              ))}
              {shifts.length === 0 && <p className="text-center text-gray-500 py-8">No upcoming shifts</p>}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Shifts</p>
                <p className="text-2xl font-bold text-gray-900">{shifts.filter(s => s.shift_date === new Date().toISOString().split('T')[0]).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
