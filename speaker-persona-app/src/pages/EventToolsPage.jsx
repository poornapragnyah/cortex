import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, QrCode, Download, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function EventToolsPage() {
  const handleDownloadQR = (type) => {
    // This would generate and download QR codes in a real implementation
    console.log(`Downloading ${type} QR code`)
  }

  const handleDownloadCertificate = () => {
    // This would generate and download the speaker certificate
    console.log('Downloading certificate')
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
              Event Tools
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-800 mb-2">
            Your Event Tools
          </h2>
          <p className="text-primary-500">
            Access your QR codes and certificates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Codes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2 text-accent-700" />
                Your QR Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Speaker Check-in QR */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-32 h-32 bg-white border-2 border-dashed border-primary-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-16 w-16 text-primary-300" />
                </div>
                <h3 className="font-semibold text-primary-800 mb-2">
                  Speaker Check-in
                </h3>
                <p className="text-sm text-primary-500 mb-4">
                  Use this QR code to check in at the speakers' desk
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadQR('checkin')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* T-shirt Collection QR */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-32 h-32 bg-white border-2 border-dashed border-primary-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-16 w-16 text-primary-300" />
                </div>
                <h3 className="font-semibold text-primary-800 mb-2">
                  T-shirt Collection
                </h3>
                <p className="text-sm text-primary-500 mb-4">
                  Show this QR code to collect your speaker t-shirt
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownloadQR('tshirt')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-accent-700" />
                Speaker Certificate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <div className="w-32 h-24 bg-accent-50 border-2 border-dashed border-accent-200 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-16 w-16 text-accent-300" />
                </div>
                
                <h3 className="font-semibold text-primary-800 mb-2">
                  Speaker Certificate
                </h3>
                <p className="text-sm text-primary-500 mb-6">
                  Your digital certificate will be available after your session is completed
                </p>
                
                <Button
                  disabled
                  className="opacity-50 cursor-not-allowed"
                  onClick={handleDownloadCertificate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
                
                <p className="text-xs text-primary-400 mt-4">
                  Available after session completion
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold text-accent-700">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-800 mb-1">Check-in</h4>
                  <p className="text-sm text-primary-500">
                    Use your Speaker Check-in QR code at the registration desk when you arrive at the venue.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold text-accent-700">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-800 mb-1">Collect T-shirt</h4>
                  <p className="text-sm text-primary-500">
                    Show your T-shirt Collection QR code at the merchandise counter to receive your speaker swag.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold text-accent-700">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-800 mb-1">Certificate</h4>
                  <p className="text-sm text-primary-500">
                    Your digital speaker certificate will be automatically generated after your session is completed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
