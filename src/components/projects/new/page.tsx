'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile, UserRole } from '@/types/database'

export default function NewProject() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState<Array<{ email: string; role: UserRole }>>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Redirect if not a consultant
      if (profileData?.role !== 'consultant') {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [supabase, router])

  const addMember = () => {
    if (!email) return
    
    setMembers([...members, { email, role }])
    setEmail('')
    setRole('client')
  }

  const removeMember = (index: number) => {
    const newMembers = [...members]
    newMembers.splice(index, 1)
    setMembers(newMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            name,
            description,
            created_by: user.id,
            status: 'active',
          },
        ])
        .select()
        .single()

      if (projectError) throw projectError

      // Add current user as consultant
      await supabase
        .from('project_members')
        .insert([
          {
            project_id: project.id,
            user_id: user.id,
            role: 'consultant',
          },
        ])

      // Add members
      for (const member of members) {
        // Check if user exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', member.email)
          .single()

        if (existingUser) {
          // Add existing user
          await supabase.from('project_members').insert([
            {
              project_id: project.id,
              user_id: existingUser.id,
              role: member.role,
            },
          ])
        } else {
          // TODO: Send invitation email
          // For now, just ignore non-existent users
        }
      }

      router.push(`/projects/${project.id}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An error occurred')
      }
    }
    } finally {
      setLoading(false)
    }
  }

  if (!profile || profile.role !== 'consultant') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Team Members
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-40 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="client">Client</option>
                <option value="target">Target</option>
                <option value="consultant">Consultant</option>
              </select>
              <button
                type="button"
                onClick={addMember}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {members.length > 0 && (
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium mb-2">Team members:</h4>
                <ul className="space-y-2">
                  {members.map((member, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        {member.email} ({member.role})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  )
}