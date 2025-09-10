'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ChatMessage {
  id: string
  userId: string
  content: string
  imageUrl?: string
  createdAt: string
  user: {
    teamName: string
    ownerName: string
    sleeperUsername?: string
  }
}

interface ForumThread {
  id: string
  title: string
  description?: string
  category: string
  postCount: number
  isPinned: boolean
  createdAt: string
  matchup?: {
    teamAName: string
    teamBName: string
  }
}

interface User {
  id: string
  teamName: string
  ownerName: string
  sleeperUsername?: string
  isOnline: boolean
}

interface ChatPageProps {
  searchParams: { subdomain: string }
}

export default function ChatPage({ searchParams }: ChatPageProps) {
  const { subdomain } = searchParams
  
  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [sleeperUsername, setSleeperUsername] = useState('')
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  
  // Forum state
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Server-Sent Events connection
  const eventSourceRef = useRef<EventSource | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Initialize Server-Sent Events connection
  useEffect(() => {
    if (!isSignedIn || !currentUser) return
    
    const eventSource = new EventSource(`/api/chat-stream?subdomain=${subdomain}&userId=${currentUser.id}`)
    eventSourceRef.current = eventSource
    
    eventSource.onopen = () => {
      console.log('Connected to chat')
    }
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message])
      } else if (data.type === 'users') {
        setOnlineUsers(data.users)
      }
    }
    
    eventSource.onerror = () => {
      console.log('Chat connection error')
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [isSignedIn, currentUser, subdomain])
  
  // Load initial data
  useEffect(() => {
    if (!subdomain) return
    
    // Load recent messages and forum threads
    Promise.all([
      fetch(`/api/chat/${subdomain}/messages`).then(r => r.json()),
      fetch(`/api/forum/${subdomain}/threads`).then(r => r.json())
    ]).then(([messagesData, threadsData]) => {
      if (messagesData.messages) setMessages(messagesData.messages)
      if (threadsData.threads) setForumThreads(threadsData.threads)
    }).catch(console.error)
  }, [subdomain])
  
  const handleSignIn = async () => {
    if (!sleeperUsername.trim()) return
    
    try {
      const response = await fetch(`/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          sleeperUsername: sleeperUsername.trim()
        })
      })
      
      const data = await response.json()
      if (data.user) {
        setCurrentUser(data.user)
        setIsSignedIn(true)
        localStorage.setItem(`chat-user-${subdomain}`, JSON.stringify(data.user))
      }
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return
    
    try {
      await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          userId: currentUser.id,
          content: newMessage.trim()
        })
      })
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem(`chat-user-${subdomain}`)
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsSignedIn(true)
      } catch (error) {
        localStorage.removeItem(`chat-user-${subdomain}`)
      }
    }
  }, [subdomain])
  
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-md mx-auto px-4 py-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Join League Chat</CardTitle>
              <p className="text-slate-400">Enter your Sleeper username to continue</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Your Sleeper username"
                value={sleeperUsername}
                onChange={(e) => setSleeperUsername(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
              />
              <Button 
                onClick={handleSignIn} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!sleeperUsername.trim()}
              >
                Join Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">League Chat</h1>
            <p className="text-sm text-slate-400">Signed in as {currentUser?.sleeperUsername || currentUser?.ownerName}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setIsSignedIn(false)
              setCurrentUser(null)
              localStorage.removeItem(`chat-user-${subdomain}`)
            }}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600">Live Chat</TabsTrigger>
            <TabsTrigger value="forums" className="data-[state=active]:bg-blue-600">Forums</TabsTrigger>
          </TabsList>
          
          {/* Live Chat Tab */}
          <TabsContent value="chat" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-240px)]">
              {/* Chat Messages */}
              <div className="lg:col-span-3">
                <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">League Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {(message.user.sleeperUsername || message.user.ownerName)?.[0]?.toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-white font-medium text-sm">
                                  {message.user.sleeperUsername || message.user.ownerName}
                                </span>
                                <span className="text-slate-400 text-xs">
                                  {new Date(message.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <div className="text-slate-300 text-sm">
                                {message.content}
                              </div>
                              {message.imageUrl && (
                                <img 
                                  src={message.imageUrl} 
                                  alt="Shared image" 
                                  className="max-w-xs rounded-lg mt-2"
                                />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-700 border-slate-600 text-white"
                        maxLength={500}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Online Users Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-sm">Online ({onlineUsers.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {onlineUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-slate-300 text-sm">
                            {user.sleeperUsername || user.ownerName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Forums Tab */}
          <TabsContent value="forums" className="mt-4">
            <div className="space-y-4">
              {/* Forum Categories */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Forum Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'matchup', 'general', 'trade-talk', 'trash-talk'].map((category) => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        className={`cursor-pointer ${
                          selectedCategory === category 
                            ? 'bg-blue-600 text-white' 
                            : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Forum Threads */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Discussion Threads</CardTitle>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    New Thread
                  </Button>
                </CardHeader>
                <CardContent>
                  {forumThreads.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      No forum threads yet. Create the first one!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {forumThreads.map((thread) => (
                        <div key={thread.id} className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-white font-medium">{thread.title}</h3>
                                {thread.isPinned && (
                                  <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                                    Pinned
                                  </Badge>
                                )}
                                <Badge variant="outline" className="border-slate-500 text-slate-300 text-xs">
                                  {thread.category.toLowerCase().replace('_', ' ')}
                                </Badge>
                              </div>
                              {thread.description && (
                                <p className="text-slate-400 text-sm mb-2">{thread.description}</p>
                              )}
                              {thread.matchup && (
                                <p className="text-blue-400 text-sm">
                                  {thread.matchup.teamAName} vs {thread.matchup.teamBName}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm text-slate-400">
                              <div>{thread.postCount} posts</div>
                              <div>{new Date(thread.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
