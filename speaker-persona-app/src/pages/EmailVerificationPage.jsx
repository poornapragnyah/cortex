import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../hooks/useAuth'

export default function EmailVerificationPage() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  
  const { resendEmailVerification } = useAuth()

  // Pre-fill email from navigation state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  const handleResendVerification = async (e) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await resendEmailVerification(email)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Verification email sent successfully! Please check your inbox.')
        setSent(true)
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-800 mb-2">
            Verify Your Email
          </h1>
          <p className="text-primary-500 text-sm">
            We've sent a verification link to your email address
          </p>
        </div>

        {/* Verification Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Email Verification Required</CardTitle>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Check your email</p>
                      <p>
                        We've sent a verification link to your email address. 
                        Click the link to verify your account and complete registration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center text-sm text-primary-600">
                    Didn't receive the email?
                  </div>

                  <form onSubmit={handleResendVerification} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
                        {message}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Enter your email address</Label>
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

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || !email}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">
                  Email Sent Successfully!
                </h3>
                <p className="text-primary-600 text-sm mb-6">
                  We've sent a new verification email to <strong>{email}</strong>. 
                  Please check your inbox and click the verification link.
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 pt-6 border-t border-primary-100">
              <h4 className="font-semibold text-primary-800 mb-3 text-sm">
                What to do next:
              </h4>
              <ol className="text-sm text-primary-600 space-y-2 pl-4">
                <li className="flex items-start">
                  <span className="font-medium text-primary-700 mr-2">1.</span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-primary-700 mr-2">2.</span>
                  Click the verification link in the email
                </li>
                <li className="flex items-start">
                  <span className="font-medium text-primary-700 mr-2">3.</span>
                  You'll be redirected back to login automatically
                </li>
              </ol>
            </div>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-primary-100 text-center">
              <p className="text-sm text-primary-500 mb-3">
                Already verified your email?
              </p>
              <Link 
                to="/login" 
                className="text-accent-700 hover:text-accent-800 font-medium text-sm transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-primary-400">
          Having trouble? Contact our support team
        </div>
      </div>
    </div>
  )
}
