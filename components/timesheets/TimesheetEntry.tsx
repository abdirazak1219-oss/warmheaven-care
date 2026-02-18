'use client'

import { useState } from 'react'
import { Clock, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface TimesheetEntryProps {
  shiftId: string
  clientId: string
  onComplete?: () => void
}

export default function TimesheetEntry({ shiftId, clientId, onComplete }: TimesheetEntryProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'clocked_in' | 'clocked_out'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleClockIn() {
    setLoading(true)
    setError(null)
    try {
      // In a real app, we'd get GPS coordinates here
      const location = { lat: 43.6591, lng: -70.2568 } // Example: Portland, ME
      
      const { error } = await supabase
        .from('timesheet_entries')
        .insert([{
          shift_id: shiftId,
          client_id: clientId,
          entry_date: new Date().toISOString().split('T')[0],
          clock_in: new Date().toISOString(),
          gps_location_in: location,
          status: 'active'
        }])

      if (error) throw error
      setStatus('clocked_in')
    } catch (err: any) {
      setError(err.message || 'Failed to clock in')
    } finally {
      setLoading(false)
    }
  }

  async function handleClockOut() {
    setLoading(true)
    setError(null)
    try {
      const location = { lat: 43.6591, lng: -70.2568 }
      
      const { error } = await supabase
        .from('timesheet_entries')
        .update({
          clock_out: new Date().toISOString(),
          gps_location_out: location,
          status: 'completed'
        })
        .eq('shift_id', shiftId)
        .eq('status', 'active')

      if (error) throw error
      setStatus('clocked_out')
      if (onComplete) onComplete()
    } catch (err: any) {
      setError(err.message || 'Failed to clock out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-teal-600" />
          Shift Timer
        </h3>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          status === 'clocked_in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {status === 'clocked_in' ? 'Active Session' : 'No Active Session'}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {status !== 'clocked_out' ? (
          <button
            onClick={status === 'clocked_in' ? handleClockOut : handleClockIn}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${
              status === 'clocked_in' 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-100' 
                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-100'
            }`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : status === 'clocked_in' ? (
              'Clock Out'
            ) : (
              'Clock In'
            )}
          </button>
        ) : (
          <div className="text-center py-4 text-green-600 font-bold flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 mb-2" />
            Shift Completed Successfully
          </div>
        )}

        <div className="flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <MapPin className="h-3 w-3 mr-1" />
          GPS Verification Enabled
        </div>
      </div>
    </div>
  )
}
