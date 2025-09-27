import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CheckCircle, XCircle, Database, RefreshCw, User } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function DatabaseTestPage() {
  const [tableStatus, setTableStatus] = useState({
    speakers: { exists: false, canRead: false, canWrite: false },
    sessions: { exists: false, canRead: false, canWrite: false },
    agenda_items: { exists: false, canRead: false, canWrite: false }
  })
  const [authStatus, setAuthStatus] = useState({
    userAuthenticated: false,
    userInDatabase: false
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const testDatabaseAccess = async () => {
    setLoading(true)
    const newStatus = { ...tableStatus }
    const newAuthStatus = { userAuthenticated: false, userInDatabase: false }

    // Test authentication status
    if (user) {
      newAuthStatus.userAuthenticated = true
      
      // Check if user profile exists in speakers table
      try {
        const { data, error } = await supabase
          .from('speakers')
          .select('id')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          newAuthStatus.userInDatabase = true
        }
      } catch (error) {
        console.log('User not in speakers table yet:', error.message)
      }
    }

    // Test each table
    for (const [tableKey, tableName] of Object.entries(TABLES)) {
      try {
        // Test if table exists and can be read
        const { data, error: readError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (!readError) {
          newStatus[tableName] = {
            exists: true,
            canRead: true,
            canWrite: false // Will test write separately
          }

          // Test write access with appropriate test data
          if (user) {
            let testData = null
            let testQuery = null

            if (tableName === 'sessions') {
              testData = {
                speaker_id: user.id,
                title: 'Test Session - Database Check',
                abstract: 'This is a test session to verify database write access',
                category: 'Talk',
                track: 'Technology',
                status: 'submitted'
              }
              testQuery = { title: 'Test Session - Database Check', speaker_id: user.id }
            } else if (tableName === 'speakers') {
              // Don't test write for speakers if user already exists
              if (!newAuthStatus.userInDatabase) {
                testData = {
                  id: user.id,
                  full_name: 'Test User',
                  email: user.email || 'test@example.com',
                  mobile_number: '1234567890',
                  tshirt_size: 'M',
                  food_choice: 'veg'
                }
                testQuery = { id: user.id }
              } else {
                // User already exists, assume write works
                newStatus[tableName].canWrite = true
              }
            } else if (tableName === 'agenda_items') {
              testData = {
                title: 'Test Agenda Item',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 30 * 60000).toISOString(), // +30 minutes
                session_type: 'Talk',
                track: 'Technology'
              }
              testQuery = { title: 'Test Agenda Item' }
            }

            if (testData && testQuery) {
              try {
                const { error: writeError } = await supabase
                  .from(tableName)
                  .insert([testData])
                  .select()

                if (!writeError) {
                  newStatus[tableName].canWrite = true
                  
                  // Clean up test data
                  await supabase
                    .from(tableName)
                    .delete()
                    .match(testQuery)
                }
              } catch (writeErr) {
                console.log(`Write test failed for ${tableName}:`, writeErr.message)
              }
            }
          }
        } else {
          newStatus[tableName] = {
            exists: false,
            canRead: false,
            canWrite: false
          }
        }
      } catch (error) {
        console.error(`Error testing ${tableName}:`, error)
        newStatus[tableName] = {
          exists: false,
          canRead: false,
          canWrite: false
        }
      }
    }

    setTableStatus(newStatus)
    setAuthStatus(newAuthStatus)
    setLoading(false)
  }

  useEffect(() => {
    if (user) {
      testDatabaseAccess()
    }
  }, [user])

  const StatusIcon = ({ status }) => {
    if (status) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getOverallStatus = () => {
    // Check if all essential tables exist and are functional
    const speakers = tableStatus.speakers
    const sessions = tableStatus.sessions
    const agendaItems = tableStatus.agenda_items
    
    const essentialTablesWork = (
      speakers.exists && speakers.canRead &&
      sessions.exists && sessions.canRead && sessions.canWrite &&
      agendaItems.exists && agendaItems.canRead
    )
    
    return authStatus.userAuthenticated && essentialTablesWork
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Database className="h-12 w-12 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-800 mb-2">
              Authentication Required
            </h3>
            <p className="text-primary-600 text-sm">
              Please log in to test database connectivity
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">
            Database Status Check
          </h1>
          <p className="text-primary-600">
            Verify that all required database tables exist and are accessible
          </p>
        </div>

        {/* Overall Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <StatusIcon status={getOverallStatus()} />
              <span className={`ml-2 font-medium ${
                getOverallStatus() ? 'text-green-800' : 'text-red-800'
              }`}>
                {getOverallStatus() 
                  ? 'Database is ready for session submissions!' 
                  : 'Database setup required'}
              </span>
            </div>
            
            <Button 
              onClick={testDatabaseAccess} 
              disabled={loading}
              variant="secondary"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retest Connection
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-600">User logged in:</span>
              <StatusIcon status={authStatus.userAuthenticated} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-600">Profile created:</span>
              <StatusIcon status={authStatus.userInDatabase} />
            </div>

            {authStatus.userAuthenticated && (
              <div className="pt-2 border-t border-primary-100">
                <p className="text-xs text-primary-500">
                  Logged in as: {user?.email || 'Unknown user'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Tables Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(tableStatus).map(([tableName, status]) => (
            <Card key={tableName}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{tableName.replace('_', ' ')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-600">Table exists:</span>
                  <StatusIcon status={status.exists} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-600">Can read:</span>
                  <StatusIcon status={status.canRead} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary-600">Can write:</span>
                  <StatusIcon status={status.canWrite} />
                </div>

                {tableName === 'sessions' && (
                  <div className="pt-2 border-t border-primary-100">
                    <p className="text-xs text-primary-500">
                      This table is required for session submissions
                    </p>
                  </div>
                )}

                {tableName === 'speakers' && (
                  <div className="pt-2 border-t border-primary-100">
                    <p className="text-xs text-primary-500">
                      Stores speaker profiles and contact information
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Setup Instructions */}
        {!getOverallStatus() && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Setup Required</CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              <p className="mb-4">
                {!authStatus.userAuthenticated 
                  ? "You need to be logged in to test the database."
                  : "The database tables are not properly set up. Follow these steps:"
                }
              </p>
              {authStatus.userAuthenticated && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to your Supabase dashboard</li>
                  <li>Open the SQL Editor</li>
                  <li>Copy and paste the contents of <code>database-setup.sql</code></li>
                  <li>Run the SQL script</li>
                  <li>Come back and click "Retest Connection"</li>
                </ol>
              )}
            </CardContent>
          </Card>
        )}

        {/* Success Instructions */}
        {getOverallStatus() && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Ready to Go! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="text-green-700">
              <p className="mb-4">
                Your database is properly configured. You can now:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Submit new sessions</li>
                <li>Edit existing sessions</li>
                <li>View session status on dashboard</li>
                <li>All session data will be securely stored</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
