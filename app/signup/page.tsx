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
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    data: {
      name: "",
      firstname: "",
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUserData((prev) => {
      if (name.startsWith("data.")) {
        const key = name.split(".")[1]; // Récupère "name" ou "firstname"
        return {
          ...prev,
          data: {
            ...prev.data,
            [key]: value,
          },
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const signup = async () => {
    if (
      !userData.email ||
      !userData.password ||
      !userData.data.name ||
      !userData.data.firstname
    ) {
      setError("Both email, password, name and firstname are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      setError("Invalid email format.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      let { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.data.name,
            firstname: userData.data.firstname,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data) {
        router.push("/");
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
          <CardTitle>Sign up</CardTitle>
          {/* Add possibility to go to signup page */}
          <CardDescription>
            You already have an account ?{" "}
            <Link className="underline underline-offset-1" href="/login">
              Sign in
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signup();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                placeholder="John"
                value={userData.data.name}
                onChange={handleChange}
                name="data.name"
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="firstname">Firstname</Label>
              <Input
                type="text"
                id="firstname"
                placeholder="Doe"
                value={userData.data.firstname}
                onChange={handleChange}
                name="data.firstname"
              />
            </div>
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
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
