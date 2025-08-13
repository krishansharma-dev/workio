import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <Shield className="h-20 w-20 text-primary" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">
              Next.js 14 + Supabase
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete authentication system with email/password and Google OAuth integration. 
              Built with App Router, Server Components, and modern best practices.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Email & Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Traditional email and password authentication with form validation and secure handling.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Google OAuth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                One-click sign-in with Google OAuth integration for seamless user experience.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Protected Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Middleware-based route protection with automatic redirects for unauthenticated users.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Server & Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Full session management on both server and client side with automatic refresh.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Modern UI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Beautiful, responsive interface built with shadcn/ui and Tailwind CSS.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Production Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Built with TypeScript, proper error handling, and production-ready architecture.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-xl bg-primary/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to explore?</CardTitle>
              <CardDescription className="text-base">
                Try signing up for a new account or signing in to access the protected dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8">
                  Create Account
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}