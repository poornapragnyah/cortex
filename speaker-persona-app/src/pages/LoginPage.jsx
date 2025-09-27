import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await signIn(email, password)
      if (error) {
        // Check if it's an email not verified error
        if (error.message.includes('email not confirmed') || error.message.includes('Email not confirmed')) {
          navigate('/verify-email', { state: { email } })
          return
        }
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Area */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">
            Speaker Portal
          </h1>
          <p className="text-primary-500 text-sm">
            Manage your conference sessions
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Login'}
              </Button>
            </form>

            {/* Registration Link */}
            <div className="mt-8 pt-6 border-t border-primary-100 text-center">
              <p className="text-sm text-primary-500 mb-3">
                Don't have an account?
              </p>
              <Link 
                to="/register" 
                className="text-accent-700 hover:text-accent-800 font-medium text-sm transition-colors"
              >
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-primary-400">
          Secure login powered by Supabase
        </div>
      </div>
    </div>
  )
}
