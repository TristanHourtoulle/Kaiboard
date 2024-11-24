"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const login = async () => {
    if (!userData.email || !userData.password) {
      setError("Both email and password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError("Invalid email format.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        setError(error.message);
      } else if (data) {
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container mx-auto w-[400px] h-full mt-[10%] antialiased"
      style={{
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Login</CardTitle>
          {/* Add possibility to go to signup page */}
          <CardDescription>
            You don't have any account ?{" "}
            <Link className="underline underline-offset-1" href="/signup">
              Sign up
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="Email"
                value={userData.email}
                onChange={handleChange}
                name="email"
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="password"
                value={userData.password}
                onChange={handleChange}
                name="password"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {/* <div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div> */}
            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
