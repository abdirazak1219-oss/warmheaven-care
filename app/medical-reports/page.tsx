'use client'

import { useState } from 'react'
import { Activity, Pill } from 'lucide-react'

export default function MedicalReportsPage() {
  const [activeTab, setActiveTab] = useState<'vitals' | 'medications'>('vitals')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medical Reports</h1>
        <p className="mt-2 text-gray-600">Track vitals and medication administration</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`pb-4 border-b-2 font-medium ${activeTab === 'vitals' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
          >
            <Activity className="h-5 w-5 inline mr-2" />Vitals
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`pb-4 border-b-2 font-medium ${activeTab === 'medications' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}
          >
            <Pill className="h-5 w-5 inline mr-2" />Medications (MAR)
          </button>
        </nav>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'vitals' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Vital Signs Records</h2>
            <p className="text-gray-500">Vitals tracking interface coming soon...</p>
          </div>
        )}
        {activeTab === 'medications' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Medication Administration Record</h2>
            <p className="text-gray-500">MAR interface coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
