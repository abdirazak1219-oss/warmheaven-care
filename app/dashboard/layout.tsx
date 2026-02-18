import Sidebar from '@/components/shared/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mock user data - in a real app, this would come from Supabase auth
  const user = {
    name: 'Admin User',
    role: 'admin' as const,
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar userRole={user.role} userName={user.name} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
