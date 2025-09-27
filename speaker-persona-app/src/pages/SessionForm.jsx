import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../hooks/useAuth'
import { supabase, TABLES, TRACKS, SESSION_CATEGORIES, SESSION_STATUS } from '../lib/supabase'

export default function SessionForm() {
  const { sessionId } = useParams()
  const isEditing = !!sessionId
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    category: '',
    track: '',
    duration: '30', // minutes
    level: 'intermediate',
    coSpeakerName: '',
    coSpeakerEmail: '',
    coSpeakerBio: '',
    requirements: '',
    targetAudience: '',
    learningOutcomes: '',
    previousExperience: '',
    additionalNotes: ''
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isEditing) {
      fetchSession()
    }
  }, [sessionId, isEditing])

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SESSIONS)
        .select('*')
        .eq('id', sessionId)
        .eq('speaker_id', user.id)
        .single()

      if (error) {
        setError('Session not found or access denied')
        navigate('/dashboard')
        return
      }

      // Map database fields to form fields
      setFormData({
        title: data.title || '',
        abstract: data.abstract || '',
        category: data.category || '',
        track: data.track || '',
        duration: data.duration?.toString() || '30',
        level: data.level || 'intermediate',
        coSpeakerName: data.co_speaker_name || '',
        coSpeakerEmail: data.co_speaker_email || '',
        coSpeakerBio: data.co_speaker_bio || '',
        requirements: data.requirements || '',
        targetAudience: data.target_audience || '',
        learningOutcomes: data.learning_outcomes || '',
        previousExperience: data.previous_experience || '',
        additionalNotes: data.additional_notes || ''
      })
    } catch (err) {
      setError('Error loading session')
    } finally {
      setFetching(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Map form fields to database fields
      const sessionData = {
        title: formData.title,
        abstract: formData.abstract,
        category: formData.category,
        track: formData.track,
        duration: parseInt(formData.duration),
        level: formData.level,
        co_speaker_name: formData.coSpeakerName || null,
        co_speaker_email: formData.coSpeakerEmail || null,
        co_speaker_bio: formData.coSpeakerBio || null,
        requirements: formData.requirements || null,
        target_audience: formData.targetAudience || null,
        learning_outcomes: formData.learningOutcomes || null,
        previous_experience: formData.previousExperience || null,
        additional_notes: formData.additionalNotes || null,
        speaker_id: user.id,
        status: SESSION_STATUS.SUBMITTED,
        updated_at: new Date().toISOString()
      }

      let result
      if (isEditing) {
        result = await supabase
          .from(TABLES.SESSIONS)
          .update(sessionData)
          .eq('id', sessionId)
          .eq('speaker_id', user.id)
      } else {
        sessionData.created_at = new Date().toISOString()
        result = await supabase
          .from(TABLES.SESSIONS)
          .insert([sessionData])
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess(isEditing ? 'Session updated successfully!' : 'Session submitted successfully!')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const sessionLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ]

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
    { value: '120', label: '2 hours' }
  ]

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-primary-600">Loading session...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-accent-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-primary-800 mb-2">
            {isEditing ? 'Edit Session' : 'Submit New Session'}
          </h1>
          <p className="text-primary-500">
            {isEditing ? 'Update your session details' : 'Share your knowledge with our conference attendees'}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Basic Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a compelling session title"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract *</Label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of your session (300-500 words recommended)"
                    rows="6"
                    className="input-field resize-none"
                    required
                    disabled={loading}
                  />
                  <div className="text-xs text-primary-400 text-right">
                    {formData.abstract.length} characters
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
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

                  <div className="space-y-2">
                    <Label htmlFor="track">Track *</Label>
                    <select
                      id="track"
                      name="track"
                      value={formData.track}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      disabled={loading}
                    >
                      <option value="">Select track</option>
                      {Object.values(TRACKS).map((track) => (
                        <option key={track} value={track}>
                          {track}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      disabled={loading}
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Audience Level *</Label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    {sessionLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Co-Speaker Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Co-Speaker Information (Optional)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coSpeakerName">Co-Speaker Name</Label>
                    <Input
                      id="coSpeakerName"
                      name="coSpeakerName"
                      value={formData.coSpeakerName}
                      onChange={handleInputChange}
                      placeholder="Enter co-speaker's name"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coSpeakerEmail">Co-Speaker Email</Label>
                    <Input
                      id="coSpeakerEmail"
                      name="coSpeakerEmail"
                      type="email"
                      value={formData.coSpeakerEmail}
                      onChange={handleInputChange}
                      placeholder="Enter co-speaker's email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coSpeakerBio">Co-Speaker Bio</Label>
                  <textarea
                    id="coSpeakerBio"
                    name="coSpeakerBio"
                    value={formData.coSpeakerBio}
                    onChange={handleInputChange}
                    placeholder="Brief bio of your co-speaker"
                    rows="3"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary-800 border-b border-primary-100 pb-2">
                  Additional Details
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Who should attend this session? (e.g., developers, designers, product managers)"
                    rows="2"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
                  <textarea
                    id="learningOutcomes"
                    name="learningOutcomes"
                    value={formData.learningOutcomes}
                    onChange={handleInputChange}
                    placeholder="What will attendees learn from this session?"
                    rows="3"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Technical Requirements</Label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Any special A/V requirements, equipment needs, or setup preferences"
                    rows="2"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousExperience">Previous Speaking Experience</Label>
                  <textarea
                    id="previousExperience"
                    name="previousExperience"
                    value={formData.previousExperience}
                    onChange={handleInputChange}
                    placeholder="Brief overview of your speaking experience (optional)"
                    rows="3"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    placeholder="Any other information you'd like to share"
                    rows="2"
                    className="input-field resize-none"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-primary-100">
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 md:flex-none"
                  >
                    {loading ? (
                      'Saving...'
                    ) : (
                      <>
                        {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        {isEditing ? 'Update Session' : 'Submit Session'}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
