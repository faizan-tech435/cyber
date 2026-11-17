import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { DEMO_PROFILES, DEMO_ACCOUNTS } from '@/data/demoData'

interface AuthContextValue {
  user: Profile | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // Check for persisted demo session
  useEffect(() => {
    const persisted = sessionStorage.getItem('cybersafe_demo_user')
    if (persisted) {
      try {
        const profile = JSON.parse(persisted) as Profile
        setUser(profile)
        setIsDemo(true)
        setLoading(false)
        return
      } catch {
        sessionStorage.removeItem('cybersafe_demo_user')
      }
    }

    // Try real Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
        setIsDemo(false)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsDemo(false)
      } else if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
        setIsDemo(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) return null
      return data as Profile
    } catch {
      return null
    }
  }

  const signIn = useCallback(async (email: string, password: string) => {
    // Check demo accounts first — no password check needed for demo mode.
    // Real authentication requires Supabase Auth with properly created users.
    const demoAccount = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase()
    )
    if (demoAccount) {
      const profile = DEMO_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase())
      if (profile) {
        setUser(profile)
        setIsDemo(true)
        sessionStorage.setItem('cybersafe_demo_user', JSON.stringify(profile))
        return { error: null }
      }
    }

    // Try real Supabase auth
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return { error: null }
    } catch {
      return { error: 'Invalid email or password. For demo accounts, just enter the email and click Sign in.' }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string, role = 'employee') => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message }
      if (data.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: role,
          department: null,
          avatar_url: null,
        })
        if (profileError) return { error: profileError.message }
      }
      return { error: null }
    } catch {
      return { error: 'Registration failed. Please try again.' }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (isDemo) {
      sessionStorage.removeItem('cybersafe_demo_user')
      setUser(null)
      setIsDemo(false)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [isDemo])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' }
    if (isDemo) {
      const updated = { ...user, ...updates }
      setUser(updated)
      sessionStorage.setItem('cybersafe_demo_user', JSON.stringify(updated))
      return { error: null }
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any)
        .update(updates)
        .eq('id', user.id)
      if (error) return { error: error.message }
      setUser(prev => prev ? { ...prev, ...updates } : prev)
      return { error: null }
    } catch {
      return { error: 'Update failed.' }
    }
  }, [user, isDemo])

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
