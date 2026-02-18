'use client'

import { useState } from 'react'
import { DollarSign, Clock, FileText } from 'lucide-react'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'timesheets' | 'invoices' | 'rates'>('timesheets')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Invoicing</h1>
        <p className="mt-2 text-gray-600">Manage timesheets, invoices, and billing rates</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('timesheets')}
            className={`pb-4 border-b-2 font-medium ${activeTab === 'timesheets' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
          >
            <Clock className="h-5 w-5 inline mr-2" />Timesheets
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-4 border-b-2 font-medium ${activeTab === 'invoices' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
          >
            <FileText className="h-5 w-5 inline mr-2" />Invoices
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`pb-4 border-b-2 font-medium ${activeTab === 'rates' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
          >
            <DollarSign className="h-5 w-5 inline mr-2" />DHHS Rates
          </button>
        </nav>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'timesheets' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Timesheet Management</h2>
            <p className="text-gray-500">Timesheet interface with clock in/out tracking coming soon...</p>
          </div>
        )}
        {activeTab === 'invoices' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Invoice Management</h2>
            <p className="text-gray-500">Invoice generation with Maine DHHS billing rates coming soon...</p>
          </div>
        )}
        {activeTab === 'rates' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Maine DHHS Billing Rates</h2>
            <p className="text-sm text-gray-600 mb-4">104 procedure codes from Sections 20 & 21 loaded in database</p>
            <p className="text-gray-500">Rate lookup interface coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
