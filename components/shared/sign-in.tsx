"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github, Loader2 } from "lucide-react";

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { 
        callbackUrl: "/" // Redirect to dashboard after sign in
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button 
        onClick={handleSignIn}
        disabled={isLoading}
        size="lg"
        className="w-full h-12 lg:h-14 text-base lg:text-lg font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden disabled:transform-none disabled:hover:shadow-lg"
      >
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
        
        {/* Content */}
        <div className="relative flex items-center justify-center gap-3">
          {isLoading ? (
            <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
          ) : (
            <Github className="w-5 h-5 lg:w-6 lg:h-6 group-hover:rotate-12 transition-transform duration-300" />
          )}
          <span className="tracking-wide">
            {isLoading ? "Signing in..." : "Continue with GitHub"}
          </span>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
      </Button>
      
      {/* Secondary info */}
      <div className="mt-4 text-center">
        <p className="text-xs lg:text-sm text-muted-foreground">
          Free access during beta • No credit card required
        </p>
      </div>
    </div>
  );
}
