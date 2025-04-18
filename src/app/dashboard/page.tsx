'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Profile } from '@/types/database'
import Link from 'next/link'
import { FiPlusCircle, FiFileText, FiUsers, FiCheckCircle } from 'react-icons/fi'

export default function Dashboard() {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          window.location.href = '/auth/signin'
          return
        }

        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(profileData)

        // Get projects
        const { data: projectsData } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', user.id)

        if (projectsData && projectsData.length > 0) {
          const projectIds = projectsData.map(pm => pm.project_id)
          const { data: projects } = await supabase
            .from('projects')
            .select('*')
            .in('id', projectIds)
            .order('created_at', { ascending: false })

          setProjects(projects || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Mock statistics
  const stats = [
    { name: 'Active Projects', value: projects.filter(p => p.status === 'active').length, icon: FiFileText, color: 'bg-blue-100 text-blue-800' },
    { name: 'Team Members', value: 12, icon: FiUsers, color: 'bg-green-100 text-green-800' }, // Mock value
    { name: 'Completed Tasks', value: 48, icon: FiCheckCircle, color: 'bg-purple-100 text-purple-800' }, // Mock value
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {profile?.role === 'consultant' && (
          <Link href="/projects/new" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <FiPlusCircle className="mr-2" />
            New Project
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} mr-4`}>
                <stat.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{stat.name}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
        </div>
        <div className="p-6">
          {projects.length > 0 ? (
            <div className="divide-y">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{project.name}</h3>
                    <p className="text-gray-500">{project.description}</p>
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No projects yet.</p>
              {profile?.role === 'consultant' && (
                <Link
                  href="/projects/new"
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create your first project
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}