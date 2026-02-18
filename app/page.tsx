'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard - add auth check here later
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Warm Heaven Enterprise</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
