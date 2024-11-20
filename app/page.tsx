"use client";

import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        console.log("User signed out successfully.");
        router.refresh();
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  if (loading) {
    return <p>Loading user information...</p>;
  }

  console.log(user);

  return (
    <div>
      <div>
        <h1>Welcome, {user.user_metadata?.firstname}</h1>
        <p>User ID: {user.id}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
