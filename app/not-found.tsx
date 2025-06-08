import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  MapPin,
  Sparkles,
  Calendar,
  Users
} from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found | Kaiboard',
  description: 'The page you are looking for could not be found. Return to the Kaiboard dashboard to continue managing your projects.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: `linear-gradient(135deg, 
        hsl(var(--background)) 0%, 
        hsl(var(--accent) / 0.05) 25%, 
        hsl(var(--background)) 50%, 
        hsl(var(--accent) / 0.03) 75%, 
        hsl(var(--background)) 100%)`
    }}>
      <div className="w-full max-w-2xl">
        <Card className="bg-card/70 backdrop-blur-md border border-border/50 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Logo and Brand */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image 
                  src="/kaiboard-logo/Logo Kaiboard Transparent.svg" 
                  alt="Kaiboard Logo" 
                  width={64} 
                  height={64}
                  className="w-16 h-16 drop-shadow-sm"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-full blur-md -z-10"></div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent mb-2">
                404
              </h1>
              <Badge variant="secondary" className="mb-4">
                <MapPin className="w-3 h-3 mr-1" />
                Page Not Found
              </Badge>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Oops! This page went on vacation
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved to a different location.
              </p>
            </div>

            {/* Animated 404 Illustration */}
            <div className="mb-8 relative">
              <div className="w-48 h-32 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-chart-3/10 rounded-2xl border border-border/30"></div>
                <div className="absolute inset-4 flex items-center justify-center">
                  <div className="relative">
                    <Search className="w-12 h-12 text-muted-foreground animate-pulse" />
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-4 h-4 text-primary animate-bounce" />
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-2 -left-2 w-3 h-3 bg-chart-2 rounded-full animate-bounce delay-100"></div>
                <div className="absolute -bottom-1 -right-3 w-2 h-2 bg-chart-4 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-2 -right-2 w-2 h-2 bg-chart-1 rounded-full animate-bounce delay-500"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Back to Dashboard
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="hover:bg-accent/50 transition-all duration-300"
              >
                <Link href="/meetings">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Meetings
                </Link>
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="border-t border-border/50 pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Popular pages you might be looking for:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/calendar">
                    <Calendar className="w-3 h-3 mr-1" />
                    Calendar
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/team">
                    <Users className="w-3 h-3 mr-1" />
                    Team
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/settings">
                    <Search className="w-3 h-3 mr-1" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Need help? Contact our support team or return to the 
                <Link href="/" className="text-primary hover:underline ml-1">
                  main dashboard
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 