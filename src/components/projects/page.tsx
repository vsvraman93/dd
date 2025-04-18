'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Profile } from '@/types/database'
import Link from 'next/link'
import { FiPlusCircle, FiSearch } from 'react-icons/fi'

export default function Projects() {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
        <h1 className="text-2xl font-bold">Projects</h1>
        {profile?.role === 'consultant' && (
          <Link href="/projects/new" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <FiPlusCircle className="mr-2" />
            New Project
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Projects list */}
      <div className="bg-white rounded-lg shadow">
        {filteredProjects.length > 0 ? (
          <div className="divide-y">
            {filteredProjects.map((project) => (
              <div key={project.id} className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{project.name}</h3>
                  <p className="text-gray-500">{project.description}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'No projects match your search.' : 'No projects found.'}
            </p>
            {profile?.role === 'consultant' && !searchTerm && (
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
  )
}