import { SignIn } from "@/components/shared/sign-in";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Clock, Zap, Star, Shield, Rocket, Heart } from "lucide-react";

export default async function Home() {
  const session = await auth();
  const users = await prisma.user.findMany();

  return (
    <>
      {session?.user ? (
        // Authenticated user view
        <DashboardClient session={session} users={users} />
      ) : (
        // Redesigned auth page with enhanced responsive design
        <div className="min-h-screen relative overflow-hidden">
          {/* Background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/10"></div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
            {/* Left Section - Hero Content */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:p-6 lg:p-12 xl:p-16">
              <div className="max-w-lg xl:max-w-xl text-center lg:text-left w-full">
                {/* Logo and Brand */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
                  <div className="relative group">
                    <Image 
                      src="/kaiboard-logo/Logo Kaiboard Transparent.svg" 
                      alt="Kaiboard Logo" 
                      width={100} 
                      height={100}
                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="text-center lg:text-left">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                      Kaiboard
                    </h1>
                    <Badge variant="secondary" className="px-2 py-1 text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                      ✨ Beta
                    </Badge>
                  </div>
                </div>
                
                {/* Hero Text */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6 mb-6 sm:mb-8 lg:mb-12">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-foreground leading-tight">
                    Project Management for
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Distributed Teams
                    </span>
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    Schedule meetings across timezones with ease. Collaborate seamlessly with your global team, 
                    manage projects efficiently, and stay productive no matter where you are.
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 lg:mb-12">
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 group">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-foreground">Global Timezones</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">Smart timezone management</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 group">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-foreground">Team Collaboration</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">Seamless workflows</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 group">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-foreground">Smart Scheduling</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">AI-powered optimization</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 group">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg group-hover:scale-110 transition-transform">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-foreground">Productivity Focus</h3>
                      <p className="text-xs lg:text-sm text-muted-foreground truncate">Streamlined workflows</p>
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 mb-6 lg:mb-0">
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="flex -space-x-1">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white"></div>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white"></div>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground">Trusted by teams globally</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs sm:text-sm text-muted-foreground ml-1">5.0 rating</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Section - Sign-in Card */}
            <div className="flex-shrink-0 lg:w-96 xl:w-[28rem] flex flex-col justify-center items-center px-4 py-6 sm:p-6 lg:p-12 xl:p-16">
              <div className="w-full max-w-sm lg:max-w-none">
                <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
                  <CardHeader className="text-center pb-4 sm:pb-6 lg:pb-8">
                    <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium text-green-600">Secure Authentication</span>
                    </div>
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      Welcome to Kaiboard
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-2">
                      Sign in to start collaborating with your distributed team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <SignIn />
                    
                    {/* Additional Info */}
                    <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        <span>No spam, ever. Just productivity.</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-bold text-foreground">24/7</div>
                          <div className="text-xs text-muted-foreground">Support</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-bold text-foreground">Free</div>
                          <div className="text-xs text-muted-foreground">Beta Access</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-bold text-foreground">∞</div>
                          <div className="text-xs text-muted-foreground">Possibilities</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Footer Info */}
                <div className="text-center mt-4 sm:mt-6 lg:mt-8 space-y-2 sm:space-y-3">
                  <p className="text-xs lg:text-sm text-muted-foreground px-2">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Rocket className="w-3 h-3" />
                      Beta
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Secure
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      Open Source
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
