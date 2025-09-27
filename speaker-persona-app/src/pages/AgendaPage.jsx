import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../hooks/useAuth'
import { supabase, TABLES } from '../lib/supabase'

// Mock agenda data - in a real app, this would come from the database
const mockAgendaData = [
  {
    time: '09:00',
    duration: 30,
    type: 'general',
    title: 'Registration & Breakfast',
    description: 'Welcome reception and networking',
    location: 'Main Lobby',
    track: null
  },
  {
    time: '09:30',
    duration: 60,
    type: 'keynote',
    title: 'Opening Keynote: The Future of Technology',
    speaker: 'Dr. Sarah Johnson',
    description: 'An inspiring look at emerging technologies and their impact on society',
    location: 'Main Auditorium',
    track: null
  },
  {
    time: '10:45',
    duration: 15,
    type: 'break',
    title: 'Coffee Break',
    location: 'Exhibition Hall',
    track: null
  },
  {
    time: '11:00',
    duration: 45,
    type: 'session',
    title: 'Building Scalable React Applications',
    speaker: 'John Smith',
    description: 'Learn best practices for building large-scale React apps',
    location: 'Room A',
    track: 'Technology'
  },
  {
    time: '11:00',
    duration: 45,
    type: 'session',
    title: 'Design Systems at Scale',
    speaker: 'Emma Wilson',
    description: 'Creating and maintaining design systems for enterprise applications',
    location: 'Room B',
    track: 'Design'
  },
  {
    time: '12:00',
    duration: 60,
    type: 'general',
    title: 'Lunch & Networking',
    location: 'Restaurant Area',
    track: null
  },
  {
    time: '13:00',
    duration: 45,
    type: 'session',
    title: 'AI in Product Development',
    speaker: 'Michael Chen',
    description: 'How AI is transforming the product development lifecycle',
    location: 'Room A',
    track: 'AI/ML'
  },
  {
    time: '13:00',
    duration: 45,
    type: 'session',
    title: 'Startup Funding Strategies',
    speaker: 'Lisa Rodriguez',
    description: 'Navigating the funding landscape for early-stage startups',
    location: 'Room B',
    track: 'Startup'
  }
]

function AgendaItem({ item, isUserSession = false }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'keynote':
        return <Users className="h-5 w-5 text-accent-700" />
      case 'session':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'break':
        return <Clock className="h-5 w-5 text-green-600" />
      default:
        return <MapPin className="h-5 w-5 text-primary-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'keynote':
        return 'border-l-accent-700 bg-accent-50'
      case 'session':
        return isUserSession ? 'border-l-green-500 bg-green-50' : 'border-l-blue-500 bg-blue-50'
      case 'break':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-primary-400 bg-primary-50'
    }
  }

  return (
    <div className={`border-l-4 ${getTypeColor(item.type)} p-4 rounded-r-lg mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {getTypeIcon(item.type)}
            <span className="ml-2 text-sm font-medium text-primary-600">
              {item.time} • {item.duration} min
            </span>
            {isUserSession && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Your Session
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-primary-800 mb-1">
            {item.title}
          </h3>
          
          {item.speaker && (
            <p className="text-sm text-accent-700 font-medium mb-1">
              {item.speaker}
            </p>
          )}
          
          {item.description && (
            <p className="text-sm text-primary-600 mb-2">
              {item.description}
            </p>
          )}
          
          <div className="flex items-center text-sm text-primary-500">
            <MapPin className="h-4 w-4 mr-1" />
            {item.location}
            {item.track && (
              <>
                <span className="mx-2">•</span>
                <span className="font-medium">{item.track} Track</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const [userSessions, setUserSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchUserSessions()
  }, [user])

  const fetchUserSessions = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.SESSIONS)
        .select('*')
        .eq('speaker_id', user.id)
        .eq('status', 'approved')

      if (error) {
        console.error('Error fetching user sessions:', error)
      } else {
        setUserSessions(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const isUserSession = (agendaItem) => {
    return userSessions.some(session => 
      session.title === agendaItem.title
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-primary-600">Loading agenda...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-primary-600 hover:text-accent-700 mr-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-primary-800">
              Event Agenda
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-800 mb-2">
            Conference Agenda
          </h2>
          <p className="text-primary-500">
            Schedule and session details for the event
          </p>
        </div>

        {/* Legend */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Schedule Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-accent-700 rounded mr-2"></div>
                <span>Keynote</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span>Sessions</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>Your Sessions</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary-400 rounded mr-2"></div>
                <span>Breaks & Meals</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agenda Items */}
        <div className="space-y-6">
          {mockAgendaData.map((item, index) => (
            <AgendaItem
              key={index}
              item={item}
              isUserSession={isUserSession(item)}
            />
          ))}
        </div>

        {/* Note */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary-800 mb-1">
                  Schedule Updates
                </h4>
                <p className="text-sm text-primary-600">
                  The agenda is subject to change. Please check back regularly for updates. 
                  You will be notified of any changes to your approved sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
