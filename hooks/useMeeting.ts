import { supabase } from "@/lib/supabase"; // Remplacez par votre instance Supabase
import { useState } from "react";

type MeetingData = {
  title: string;
  description: string;
  date_time: string; // Format ISO8601
  timezone: string;
  participants?: object; // JSON object for participants
  link?: string;
};

export function useMeeting() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingsList, setMeetingsList] = useState<any[]>([]);
  const [meeting, setMeeting] = useState<any | null>(null);

  // Créer une réunion
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
          link: data.link || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setMeeting(meeting);

      return meeting;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les réunions d'un utilisateur
  const fetchMeetingsList = async (userId: string) => {
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

      setMeetingsList(data || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer une réunion avec son id
  const fetchMeeting = async (meetingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: meeting, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setMeeting(meeting);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une réunion
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
          link: data.link || null,
        })
        .eq("id", meetingId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setMeeting(meeting);
      return meeting;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une réunion
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

  return {
    loading,
    error,
    meetingsList,
    meeting,
    createMeeting,
    fetchMeeting,
    fetchMeetingsList,
    updateMeeting,
    deleteMeeting,
  };
}
