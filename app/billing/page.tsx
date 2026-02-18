'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Clock, FileText, Search, Plus, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'timesheets' | 'invoices' | 'rates'>('timesheets')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    try {
      let result;
      if (activeTab === 'timesheets') {
        result = await supabase
          .from('timesheets')
          .select('*, caregiver:profiles(first_name, last_name)')
          .order('period_start', { ascending: false })
      } else if (activeTab === 'invoices') {
        result = await supabase
          .from('invoices')
          .select('*, client:clients(first_name, last_name)')
          .order('issue_date', { ascending: false })
      } else {
        result = await supabase
          .from('billing_rates')
          .select('*')
          .order('procedure_code', { ascending: true })
      }

      if (result.error) throw result.error
      setData(result.data || [])
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    if (activeTab === 'timesheets') {
      return `${item.caregiver?.first_name} ${item.caregiver?.last_name}`.toLowerCase().includes(searchLower)
    } else if (activeTab === 'invoices') {
      return `${item.client?.first_name} ${item.client?.last_name}`.toLowerCase().includes(searchLower) || 
             item.invoice_number.toLowerCase().includes(searchLower)
    } else {
      return item.procedure_code.toLowerCase().includes(searchLower) || 
             item.code_description.toLowerCase().includes(searchLower)
    }
  })

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Invoicing</h1>
          <p className="mt-2 text-gray-600">Manage timesheets, invoices, and Maine DHHS billing rates</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          {activeTab === 'timesheets' ? 'New Timesheet' : activeTab === 'invoices' ? 'Create Invoice' : 'Add Rate'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'timesheets', icon: Clock, label: 'Timesheets' },
            { id: 'invoices', icon: FileText, label: 'Invoices' },
            { id: 'rates', icon: DollarSign, label: 'DHHS Rates' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 border-b-2 font-medium flex items-center transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'border-teal-600 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" />
            <p className="text-gray-500">Loading {activeTab}...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase tracking-wider">
                {activeTab === 'timesheets' && (
                  <tr>
                    <th className="px-6 py-4">Caregiver</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Total Hours</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                )}
                {activeTab === 'invoices' && (
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                )}
                {activeTab === 'rates' && (
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Section</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-600">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {activeTab === 'timesheets' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.caregiver?.first_name} {item.caregiver?.last_name}
                        </td>
                        <td className="px-6 py-4">{item.period_start} to {item.period_end}</td>
                        <td className="px-6 py-4">{item.total_hours} hrs</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            item.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-teal-600 hover:text-teal-700 font-medium">Review</button>
                        </td>
                      </>
                    )}
                    {activeTab === 'invoices' && (
                      <>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.invoice_number}</td>
                        <td className="px-6 py-4">{item.client?.first_name} {item.client?.last_name}</td>
                        <td className="px-6 py-4">{item.issue_date}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">${item.total}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === 'rates' && (
                      <>
                        <td className="px-6 py-4 font-mono font-medium text-teal-700">{item.procedure_code}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={item.code_description}>{item.code_description}</td>
                        <td className="px-6 py-4">{item.unit_of_service}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {item.unit_price ? `$${item.unit_price}` : 'Per Invoice'}
                        </td>
                        <td className="px-6 py-4">{item.section}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No records found for {activeTab}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
