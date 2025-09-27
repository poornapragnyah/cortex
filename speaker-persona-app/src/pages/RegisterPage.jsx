import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../hooks/useAuth'
import { TRACKS, SESSION_CATEGORIES } from '../lib/supabase'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: '',
    track: '',
    sessionCategory: '',
    tshirtSize: '',
    foodChoice: 'veg',
    linkedinUrl: '',
    twitterUrl: '',
    companyName: '',
    jobTitle: '',
    bio: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    specialRequirements: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { password, ...speakerData } = formData
      const { data, error } = await signUp(formData.email, password, {
        ...speakerData,
        role: 'speaker'
      })
      
      if (error) {
        setError(error.message)
      } else {
        // Check if email confirmation is required
        if (data.user && !data.user.email_confirmed_at) {
          // Redirect to email verification page
          navigate('/verify-email', { state: { email: formData.email } })
        } else {
          // If email is already confirmed or no confirmation required, go to dashboard
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL']

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">
            Speaker Registration
          </h1>
          <p className="text-primary-500">
            Join our conference as a speaker
          </p>
        </div>

        {/* Registration Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Create your speaker account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter your company"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Enter your job title"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief professional bio..."
                    rows="3"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl">Twitter URL</Label>
                    <Input
                      id="twitterUrl"
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Session Preferences */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Session Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="track">Preferred Track *</Label>
                    <select
                      id="track"
                      name="track"
                      value={formData.track}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      disabled={loading}
                    >
                      <option value="">Select a track</option>
                      {Object.values(TRACKS).map((track) => (
                        <option key={track} value={track}>
                          {track}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionCategory">Session Category *</Label>
                    <select
                      id="sessionCategory"
                      name="sessionCategory"
                      value={formData.sessionCategory}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      disabled={loading}
                    >
                      <option value="">Select category</option>
                      {Object.values(SESSION_CATEGORIES).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Event Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tshirtSize">T-shirt Size *</Label>
                    <select
                      id="tshirtSize"
                      name="tshirtSize"
                      value={formData.tshirtSize}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      disabled={loading}
                    >
                      <option value="">Select size</option>
                      {tshirtSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Food Choice *</Label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="foodChoice"
                          value="veg"
                          checked={formData.foodChoice === 'veg'}
                          onChange={handleInputChange}
                          className="mr-2"
                          disabled={loading}
                        />
                        Vegetarian
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="foodChoice"
                          value="non-veg"
                          checked={formData.foodChoice === 'non-veg'}
                          onChange={handleInputChange}
                          className="mr-2"
                          disabled={loading}
                        />
                        Non-Vegetarian
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <textarea
                    id="specialRequirements"
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Any dietary restrictions, accessibility needs, etc."
                    rows="2"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Emergency Contact
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      placeholder="Emergency contact name"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactNumber">Contact Number</Label>
                    <Input
                      id="emergencyContactNumber"
                      name="emergencyContactNumber"
                      type="tel"
                      value={formData.emergencyContactNumber}
                      onChange={handleInputChange}
                      placeholder="Emergency contact number"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-primary-100 text-center">
              <p className="text-sm text-primary-500 mb-3">
                Already have an account?
              </p>
              <Link 
                to="/login" 
                className="text-accent-700 hover:text-accent-800 font-medium text-sm transition-colors"
              >
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
