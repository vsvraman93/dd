'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiFolder, 
  FiFileText, 
  FiUsers 
} from 'react-icons/fi'

export default function Sidebar() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Projects', href: '/projects', icon: FiFolder },
    { name: 'Reports', href: '/reports', icon: FiFileText },
    { name: 'Team', href: '/team', icon: FiUsers },
  ]

  return (
    <div className="w-64 bg-white shadow-md h-screen">
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}