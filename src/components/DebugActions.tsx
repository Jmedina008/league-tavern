'use client'

interface DebugActionsProps {
  subdomain: string
}

export default function DebugActions({ subdomain }: DebugActionsProps) {
  const handleInitForums = async () => {
    try {
      const response = await fetch(`/api/forum/${subdomain}/init`, { method: 'POST' })
      if (response.ok) {
        alert('Forum threads initialized!')
      } else {
        alert('Error initializing forums')
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  return (
    <button
      onClick={handleInitForums}
      className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded text-sm font-semibold"
    >
      🚀 Initialize Forums
    </button>
  )
}
