'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import Link from 'next/link'

interface OnboardingStep {
  id: number
  title: string
  description: string
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Commissioner Info",
    description: "Tell us about yourself and your league"
  },
  {
    id: 2,
    title: "League Setup",
    description: "Connect your Sleeper league and customize your hub"
  },
  {
    id: 3,
    title: "Launch Ready",
    description: "Your league hub is ready to go!"
  }
]

interface FormData {
  // Step 1
  name: string
  email: string
  
  // Step 2
  leagueId: string
  leagueName: string
  subdomain: string
  customDomain?: string
}

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    leagueId: '',
    leagueName: '',
    subdomain: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [leagueData, setLeagueData] = useState<any>(null)

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.leagueId.trim() || !formData.subdomain.trim()) {
      setError('Please fill in all required fields')
      return false
    }
    if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      setError('Subdomain can only contain lowercase letters, numbers, and hyphens')
      return false
    }
    return true
  }

  const fetchLeagueData = async (leagueId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`)
      if (!response.ok) throw new Error('League not found')
      
      const data = await response.json()
      setLeagueData(data)
      setFormData(prev => ({ ...prev, leagueName: data.name }))
      setError('')
      return true
    } catch (err) {
      setError('Unable to find league. Please check your League ID.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    setError('')
    
    if (currentStep === 1) {
      if (!validateStep1()) return
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!validateStep2()) return
      
      // Verify league exists
      const isValid = await fetchLeagueData(formData.leagueId)
      if (!isValid) return
      
      // Check subdomain availability
      try {
        setLoading(true)
        const response = await fetch('/api/check-subdomain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain: formData.subdomain })
        })
        
        const result = await response.json()
        if (!result.available) {
          setError('This subdomain is already taken. Please choose another.')
          return
        }
      } catch (err) {
        setError('Unable to check subdomain availability. Please try again.')
        return
      } finally {
        setLoading(false)
      }
      
      // Create league
      await createLeague()
    }
  }

  const createLeague = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/create-league', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissioner: {
            name: formData.name,
            email: formData.email
          },
          league: {
            sleeperLeagueId: formData.leagueId,
            name: formData.leagueName,
            subdomain: formData.subdomain,
            customDomain: formData.customDomain
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create league')
      
      setCurrentStep(3)
    } catch (err) {
      setError('Unable to create league. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
          Your Name
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter your full name"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter your email"
          className="bg-slate-700 border-slate-600 text-white"
        />
        <p className="text-sm text-slate-400 mt-1">
          We'll use this to send you your league hub link and important updates
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="leagueId" className="block text-sm font-medium text-slate-300 mb-2">
          Sleeper League ID
        </label>
        <Input
          id="leagueId"
          type="text"
          value={formData.leagueId}
          onChange={(e) => setFormData(prev => ({ ...prev, leagueId: e.target.value }))}
          placeholder="e.g., 1180507846524702720"
          className="bg-slate-700 border-slate-600 text-white"
        />
        <p className="text-sm text-slate-400 mt-1">
          Find this in your Sleeper league URL or settings
        </p>
      </div>

      {leagueData && (
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
          <h4 className="font-medium text-white mb-2">League Found!</h4>
          <p className="text-slate-300">{leagueData.name}</p>
          <p className="text-sm text-slate-400">{leagueData.total_rosters} teams • {leagueData.season} season</p>
        </div>
      )}
      
      <div>
        <label htmlFor="subdomain" className="block text-sm font-medium text-slate-300 mb-2">
          Choose Your Hub URL
        </label>
        <div className="flex">
          <Input
            id="subdomain"
            type="text"
            value={formData.subdomain}
            onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
            placeholder="awesome-league"
            className="bg-slate-700 border-slate-600 text-white rounded-r-none"
          />
          <div className="bg-slate-600 px-3 py-2 text-slate-300 text-sm border border-l-0 border-slate-600 rounded-r-md">
            .fantasyhub.com
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          This will be your league's custom URL
        </p>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Your League Hub is Ready!</h3>
        <p className="text-slate-400">
          Your fantasy league hub has been created and is ready for your league members.
        </p>
      </div>
      
      <div className="bg-slate-700 p-6 rounded-lg border border-slate-600">
        <h4 className="font-medium text-white mb-4">Your League Hub URL:</h4>
        <div className="bg-slate-800 p-3 rounded border font-mono text-green-400 text-lg">
          https://{formData.subdomain}.fantasyhub.com
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Share this link with your league members to get started
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href={`https://${formData.subdomain}.fantasyhub.com`} target="_blank" rel="noopener noreferrer">
            Visit Your Hub
          </a>
        </Button>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          Copy Link to Share
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/landing" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">
            Create Your League Hub
          </h1>
          <p className="text-slate-400">
            Set up your custom fantasy football hub in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step.id}
                </div>
                {step.id < steps.length && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-slate-400">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-900 border-red-700 text-red-200">
                {error}
              </Alert>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {currentStep < 3 && (
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Processing...' : 'Continue'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
