'use client'

import { useState, useEffect } from 'react'
import { Shield, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`*, user:profiles(first_name, last_name, email)`)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Shield className="h-8 w-8 text-red-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        </div>
        <p className="text-gray-600">Security and administrative action logs</p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{log.user?.first_name} {log.user?.last_name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{log.action}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.table_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="text-center py-12 text-gray-500">No audit logs found</div>}
      </div>
    </div>
  )
}
