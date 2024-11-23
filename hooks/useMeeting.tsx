import { supabase } from "@/lib/supabase"; // Remplacez par votre instance Supabase
import { useState } from "react";

type MeetingData = {
  title: string;
  description: string;
  date_time: string; // Format ISO8601
  timezone: string;
  participants?: object; // JSON object for participants
};

// Crée une réunion
export function useCreateMeeting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMeeting = async (userId: string, data: MeetingData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: meeting, error } = await supabase
        .from("meetings")
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description,
          date_time: data.date_time,
          participants: data.participants || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return meeting;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createMeeting, loading, error };
}

// Récupère les réunions d'un utilisateur
export function useUserMeetings(userId: string) {
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }

      setMeetings(data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, meetings, error, fetchMeetings };
}

// Mettre à jour une réunion
export function useUpdateMeeting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMeeting = async (meetingId: string, data: MeetingData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: meeting, error } = await supabase
        .from("meetings")
        .update({
          title: data.title,
          description: data.description,
          date_time: data.date_time,
          participants: data.participants || null,
        })
        .eq("id", meetingId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return meeting;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateMeeting, loading, error };
}

// Supprimer une réunion
export function useDeleteMeeting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMeeting = async (meetingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", meetingId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return { deleteMeeting, loading, error };
}
