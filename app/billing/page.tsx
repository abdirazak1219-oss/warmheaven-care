'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Clock, FileText, Search, Plus, Loader2, CheckCircle, XCircle, X, User, Calendar, Tag, Briefcase, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import BillingDashboard from '@/components/billing/BillingDashboard'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'timesheets' | 'invoices' | 'rates'>('timesheets')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Data for modals
  const [clients, setClients] = useState<any[]>([])
  const [caregivers, setCaregivers] = useState<any[]>([])
  const [billingRates, setBillingRates] = useState<any[]>([])

  // Form states
  const [newTimesheet, setNewTimesheet] = useState({
    caregiver_id: '',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    total_hours: 0
  })

  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    total: 0
  })

  useEffect(() => {
    fetchData()
    if (isModalOpen) {
      fetchFormOptions()
    }
  }, [activeTab, isModalOpen])

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

  async function fetchFormOptions() {
    try {
      const [{ data: cData }, { data: pData }, { data: rData }] = await Promise.all([
        supabase.from('clients').select('id, first_name, last_name').eq('status', 'active'),
        supabase.from('profiles').select('id, first_name, last_name').eq('role', 'caregiver'),
        supabase.from('billing_rates').select('*').eq('is_active', true)
      ])
      setClients(cData || [])
      setCaregivers(pData || [])
      setBillingRates(rData || [])
    } catch (error) {
      console.error('Error fetching form options:', error)
    }
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      let result;
      const creatorId = '00000000-0000-0000-0000-000000000000'; // System user

      if (activeTab === 'timesheets') {
        result = await supabase.from('timesheets').insert([{ ...newTimesheet }]).select('*, caregiver:profiles(first_name, last_name)')
      } else if (activeTab === 'invoices') {
        result = await supabase.from('invoices').insert([{ ...newInvoice, created_by: creatorId }]).select('*, client:clients(first_name, last_name)')
      }

      if (result?.error) throw result.error
      
      setData([result?.data[0], ...data])
      setIsModalOpen(false)
      // Reset forms
      setNewTimesheet({
        caregiver_id: '',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        total_hours: 0
      })
      setNewInvoice({
        client_id: '',
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        total: 0
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Action failed. Please check your inputs.')
    } finally {
      setSubmitting(false)
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
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Financial Hub</h1>
          <p className="mt-2 text-gray-500 font-medium">Enterprise-grade billing, timesheets, and Maine DHHS compliance</p>
        </div>
        {activeTab !== 'rates' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
          >
            <Plus className="h-5 w-5 mr-2" />
            {activeTab === 'timesheets' ? 'Generate Pay Period' : 'Create Invoice'}
          </button>
        )}
      </div>

      <BillingDashboard />

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex mb-8">
        {[
          { id: 'timesheets', icon: Clock, label: 'Timesheets' },
          { id: 'invoices', icon: FileText, label: 'Invoices' },
          { id: 'rates', icon: DollarSign, label: 'DHHS Rates' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-teal-600 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Content */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Filter ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-medium text-gray-900"
            />
          </div>
          <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {filteredData.length} total records
          </div>
        </div>

        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-6" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Enterprise Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100">
                  {activeTab === 'timesheets' && (
                    <>
                      <th className="px-8 py-5">Caregiver Profile</th>
                      <th className="px-8 py-5">Reporting Period</th>
                      <th className="px-8 py-5 text-center">Logged Hours</th>
                      <th className="px-8 py-5">Verification</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === 'invoices' && (
                    <>
                      <th className="px-8 py-5">Invoice Reference</th>
                      <th className="px-8 py-5">Client Account</th>
                      <th className="px-8 py-5">Filing Date</th>
                      <th className="px-8 py-5">Gross Amount</th>
                      <th className="px-8 py-5">Status</th>
                    </>
                  )}
                  {activeTab === 'rates' && (
                    <>
                      <th className="px-8 py-5">Proc. Code</th>
                      <th className="px-8 py-5">Service Nomenclature</th>
                      <th className="px-8 py-5">Unit Type</th>
                      <th className="px-8 py-5">Rate (USD)</th>
                      <th className="px-8 py-5">DHHS Sect.</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredData.map((item) => (
                  <tr key={item.id} className="group hover:bg-teal-50/20 transition-all">
                    {activeTab === 'timesheets' && (
                      <>
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-100 mr-4">
                              {item.caregiver?.first_name?.[0]}{item.caregiver?.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{item.caregiver?.first_name} {item.caregiver?.last_name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Staff ID: {item.caregiver_id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-gray-600 font-bold">
                            <Calendar className="h-4 w-4 mr-2 text-teal-500" />
                            {item.period_start} — {item.period_end}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg font-black text-gray-900">{item.total_hours}h</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            item.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                            item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full mr-2 ${
                              item.status === 'approved' ? 'bg-green-500' : 
                              item.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            {item.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-teal-600 font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all shadow-sm">Audit</button>
                        </td>
                      </>
                    )}
                    {activeTab === 'invoices' && (
                      <>
                        <td className="px-8 py-6 font-mono font-black text-gray-900 tracking-tighter">{item.invoice_number}</td>
                        <td className="px-8 py-6">
                          <p className="font-bold text-gray-900">{item.client?.first_name} {item.client?.last_name}</p>
                        </td>
                        <td className="px-8 py-6 text-gray-500 font-bold">{item.issue_date}</td>
                        <td className="px-8 py-6">
                          <p className="font-black text-gray-900 text-lg">${Number(item.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${
                            item.status === 'paid' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 
                            item.status === 'pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-400 text-white'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === 'rates' && (
                      <>
                        <td className="px-8 py-6">
                          <span className="font-mono font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">{item.procedure_code}</span>
                        </td>
                        <td className="px-8 py-6 max-w-md">
                          <p className="font-bold text-gray-900 leading-tight">{item.code_description}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">{item.unit_of_service}</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-gray-900 text-base">
                            {item.unit_price ? `$${item.unit_price}` : <span className="text-gray-300 italic font-normal">Custom</span>}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black tracking-widest">S.{item.section}</span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="p-32 text-center">
                <div className="bg-gray-50 h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <AlertCircle className="h-10 w-10 text-gray-200" />
                </div>
                <p className="text-gray-900 font-black text-xl mb-2">No Records Detected</p>
                <p className="text-gray-400 font-medium max-w-xs mx-auto">The system database is currently empty for this category. Initialize new data to proceed.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-8 bg-gradient-to-r from-teal-600 to-teal-500 text-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {activeTab === 'timesheets' ? 'Pay Period Generation' : 'Financial Document Creation'}
                </h2>
                <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mt-1">Authorized Billing Access</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition-all">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-10 space-y-8">
              {activeTab === 'timesheets' ? (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <User className="h-3 w-3 mr-2 text-teal-500" /> Primary Caregiver
                    </label>
                    <select
                      required
                      value={newTimesheet.caregiver_id}
                      onChange={(e) => setNewTimesheet({...newTimesheet, caregiver_id: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-900"
                    >
                      <option value="">Select caregiver...</option>
                      {caregivers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <Calendar className="h-3 w-3 mr-2 text-teal-500" /> Start Date
                      </label>
                      <input
                        required
                        type="date"
                        value={newTimesheet.period_start}
                        onChange={(e) => setNewTimesheet({...newTimesheet, period_start: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <Calendar className="h-3 w-3 mr-2 text-teal-500" /> End Date
                      </label>
                      <input
                        required
                        type="date"
                        value={newTimesheet.period_end}
                        onChange={(e) => setNewTimesheet({...newTimesheet, period_end: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <Clock className="h-3 w-3 mr-2 text-teal-500" /> Cumulative Hours
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={newTimesheet.total_hours}
                        onChange={(e) => setNewTimesheet({...newTimesheet, total_hours: parseFloat(e.target.value)})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-black text-gray-900 text-xl"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300 uppercase tracking-widest text-xs">HRS</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <Tag className="h-3 w-3 mr-2 text-teal-500" /> Document Ref
                      </label>
                      <input
                        required
                        type="text"
                        value={newInvoice.invoice_number}
                        onChange={(e) => setNewInvoice({...newInvoice, invoice_number: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-mono font-black text-gray-900 uppercase"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <User className="h-3 w-3 mr-2 text-teal-500" /> Client Account
                      </label>
                      <select
                        required
                        value={newInvoice.client_id}
                        onChange={(e) => setNewInvoice({...newInvoice, client_id: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-900"
                      >
                        <option value="">Select client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <Calendar className="h-3 w-3 mr-2 text-teal-500" /> Filing Date
                      </label>
                      <input
                        required
                        type="date"
                        value={newInvoice.issue_date}
                        onChange={(e) => setNewInvoice({...newInvoice, issue_date: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <Calendar className="h-3 w-3 mr-2 text-teal-500" /> Maturity Date
                      </label>
                      <input
                        required
                        type="date"
                        value={newInvoice.due_date}
                        onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                      <DollarSign className="h-3 w-3 mr-2 text-teal-500" /> Total Valuation
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xl">$</span>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={newInvoice.total}
                        onChange={(e) => setNewInvoice({...newInvoice, total: parseFloat(e.target.value)})}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-black text-gray-900 text-2xl"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 border border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-8 py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black disabled:opacity-50 flex items-center justify-center shadow-2xl shadow-gray-200 transition-all uppercase tracking-widest text-[10px]"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Authorize Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
