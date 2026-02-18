'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Users, UserCheck, Calendar, DollarSign, 
  FileText, Stethoscope, BarChart3, Shield, LogOut,
  ClipboardList, Briefcase 
} from 'lucide-react'
import { UserRole } from '@/lib/auth/roles'

interface SidebarProps {
  userRole: UserRole
  userName: string
}

const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    roles: ['admin', 'house_manager', 'supervisor', 'nurse', 'caregiver', 'billing'] 
  },
  { 
    name: 'Clients', 
    href: '/clients', 
    icon: Users, 
    roles: ['admin', 'house_manager', 'supervisor', 'nurse'] 
  },
  { 
    name: 'Caregivers', 
    href: '/caregivers', 
    icon: UserCheck, 
    roles: ['admin', 'house_manager', 'supervisor'] 
  },
  { 
    name: 'Care Plans', 
    href: '/care-plans', 
    icon: ClipboardList, 
    roles: ['admin', 'nurse', 'supervisor'] 
  },
  { 
    name: 'Schedule', 
    href: '/schedule', 
    icon: Calendar, 
    roles: ['admin', 'house_manager', 'supervisor', 'caregiver'] 
  },
  { 
    name: 'Daily Reports', 
    href: '/daily-reports', 
    icon: FileText, 
    roles: ['admin', 'house_manager', 'supervisor', 'nurse', 'caregiver'] 
  },
  { 
    name: 'Medical Reports', 
    href: '/medical-reports', 
    icon: Stethoscope, 
    roles: ['admin', 'nurse'] 
  },
  { 
    name: 'Billing', 
    href: '/billing', 
    icon: DollarSign, 
    roles: ['admin', 'billing', 'house_manager', 'supervisor', 'caregiver'] 
  },
  { 
    name: 'Reports & Analytics', 
    href: '/reports', 
    icon: BarChart3, 
    roles: ['admin', 'house_manager', 'supervisor'] 
  },
  { 
    name: 'Audit Logs', 
    href: '/audit-logs', 
    icon: Shield, 
    roles: ['admin'] 
  },
]

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  
  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Briefcase className="h-8 w-8 text-teal-600" />
        <span className="ml-3 text-xl font-bold text-gray-900">
          Warm Heaven
        </span>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}
