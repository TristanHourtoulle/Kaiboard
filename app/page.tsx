"use client";

import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  // TODO: Create a useNavigation hook to handle useRouter and other navigation-related logic
  const router = useRouter();
  const { user, loading } = useUser();

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  if (loading) {
    return <p>Loading user information...</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-semibold">
        Welcome back, {user.user_metadata?.firstname}
      </h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      {/* <div>
          <h1>Welcome, {user.user_metadata?.firstname}</h1>
          <p>User ID: {user.id}</p>
          <button onClick={logout}>Logout</button>
        </div> */}
    </div>
  );
}
