import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit3, Calendar, Settings, LogOut, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { supabase, TABLES, SESSION_STATUS } from '../lib/supabase'

// Session Card Component
function SessionCard({ session, onEdit }) {
  const getStatusClass = (status) => {
    switch (status) {
      case SESSION_STATUS.SUBMITTED:
        return 'status-submitted'
      case SESSION_STATUS.APPROVED:
        return 'status-approved'
      case SESSION_STATUS.REJECTED:
        return 'status-rejected'
      case SESSION_STATUS.ON_HOLD:
        return 'status-hold'
      default:
        return 'status-submitted'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case SESSION_STATUS.ON_HOLD:
        return 'On Hold'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-800 mb-2">
              {session.title}
            </h3>
            <p className="text-sm text-primary-500 mb-3 line-clamp-2">
              {session.abstract}
            </p>
          </div>
          <div className="ml-4 flex flex-col items-end">
            <span className={`${getStatusClass(session.status)} mb-2`}>
              {getStatusText(session.status)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-primary-600">
            <span className="font-medium">{session.track}</span> • {session.category}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(session)}
            disabled={session.status === SESSION_STATUS.APPROVED}
            className="ml-auto"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SpeakerDashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchSessions()
  }, [user])

  const fetchSessions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from(TABLES.SESSIONS)
        .select('*')
        .eq('speaker_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching sessions:', error)
      } else {
        setSessions(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleEditSession = (session) => {
    navigate(`/session/edit/${session.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-primary-600">Loading...</div>
      </div>
    )
  }

  const speakerName = user?.user_metadata?.fullName || user?.email?.split('@')[0] || 'Speaker'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-primary-800">
                Speaker Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/agenda"
                className="text-primary-600 hover:text-accent-700 flex items-center text-sm font-medium transition-colors"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Agenda
              </Link>
              
              <Link
                to="/database-test"
                className="text-primary-600 hover:text-accent-700 flex items-center text-sm font-medium transition-colors"
              >
                <Database className="h-4 w-4 mr-1" />
                DB Test
              </Link>
              
              <Link
                to="/tools"
                className="text-primary-600 hover:text-accent-700 flex items-center text-sm font-medium transition-colors"
              >
                <Settings className="h-4 w-4 mr-1" />
                Tools
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary-800 mb-2">
            Welcome back, {speakerName}!
          </h2>
          <p className="text-primary-500">
            Manage your conference sessions and submissions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <Link to="/session/submit">
            <Button size="lg" className="text-lg px-8 py-4">
              <Plus className="h-5 w-5 mr-2" />
              Submit New Session
            </Button>
          </Link>
        </div>

        {/* Sessions Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-primary-800">
              My Sessions
            </h3>
            <div className="text-sm text-primary-500">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} submitted
            </div>
          </div>

          {sessions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <Plus className="h-12 w-12 text-primary-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-primary-800 mb-2">
                    No sessions yet
                  </h4>
                  <p className="text-primary-500 mb-6">
                    Start by submitting your first session for the conference
                  </p>
                  <Link to="/session/submit">
                    <Button>Submit Your First Session</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={handleEditSession}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent-700 mb-2">
                {sessions.filter(s => s.status === SESSION_STATUS.SUBMITTED).length}
              </div>
              <div className="text-sm text-primary-600">Submitted</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {sessions.filter(s => s.status === SESSION_STATUS.APPROVED).length}
              </div>
              <div className="text-sm text-primary-600">Approved</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {sessions.filter(s => s.status === SESSION_STATUS.ON_HOLD).length}
              </div>
              <div className="text-sm text-primary-600">On Hold</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
