// Utility functions for timezone handling in Kaiboard

export interface TimezoneInfo {
  timezone: string;
  displayName: string;
  offset: string;
}

// Map UTC offset formats to IANA timezone identifiers
const UTC_OFFSET_TO_TIMEZONE: { [key: string]: string } = {
  'UTC+0': 'UTC',
  'UTC+1': 'Europe/Paris',
  'UTC+2': 'Europe/Berlin', 
  'UTC+3': 'Europe/Moscow',
  'UTC+4': 'Asia/Dubai',
  'UTC+5': 'Asia/Karachi',
  'UTC+5:30': 'Asia/Kolkata',
  'UTC+6': 'Asia/Dhaka',
  'UTC+7': 'Asia/Bangkok',
  'UTC+8': 'Asia/Shanghai',
  'UTC+9': 'Asia/Tokyo',
  'UTC+10': 'Australia/Sydney',
  'UTC+11': 'Pacific/Noumea',
  'UTC+12': 'Pacific/Auckland',
  'UTC-1': 'Atlantic/Azores',
  'UTC-2': 'Atlantic/South_Georgia',
  'UTC-3': 'America/Sao_Paulo',
  'UTC-4': 'America/New_York', // Actually EST, but close
  'UTC-5': 'America/New_York',
  'UTC-6': 'America/Chicago',
  'UTC-7': 'America/Denver',
  'UTC-8': 'America/Los_Angeles',
  'UTC-9': 'Pacific/Gambier',
  'UTC-10': 'Pacific/Honolulu',
  'UTC-11': 'Pacific/Midway',
  'UTC-12': 'Etc/GMT+12'
};

// Convert UTC offset format to IANA timezone identifier
export function normalizeTimezone(timezone: string): string {
  // If it's already a valid IANA timezone, return as-is
  if (timezone.includes('/') || timezone === 'UTC') {
    return timezone;
  }
  
  // Handle UTC+X or UTC-X formats
  const utcMatch = timezone.match(/^UTC([+-]\d{1,2}(?::\d{2})?)$/);
  if (utcMatch) {
    const offset = utcMatch[1];
    const normalizedOffset = `UTC${offset}`;
    return UTC_OFFSET_TO_TIMEZONE[normalizedOffset] || timezone;
  }
  
  // Return original if no conversion found
  return timezone;
}

// Common timezones for international teams
export const COMMON_TIMEZONES: TimezoneInfo[] = [
  { timezone: 'UTC', displayName: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  { timezone: 'America/New_York', displayName: 'Eastern Time (US & Canada)', offset: '' },
  { timezone: 'America/Chicago', displayName: 'Central Time (US & Canada)', offset: '' },
  { timezone: 'America/Denver', displayName: 'Mountain Time (US & Canada)', offset: '' },
  { timezone: 'America/Los_Angeles', displayName: 'Pacific Time (US & Canada)', offset: '' },
  { timezone: 'Europe/London', displayName: 'London (GMT/BST)', offset: '' },
  { timezone: 'Europe/Paris', displayName: 'Central European Time', offset: '' },
  { timezone: 'Europe/Berlin', displayName: 'Berlin (CET/CEST)', offset: '' },
  { timezone: 'Asia/Tokyo', displayName: 'Japan Standard Time', offset: '' },
  { timezone: 'Asia/Shanghai', displayName: 'China Standard Time', offset: '' },
  { timezone: 'Asia/Kolkata', displayName: 'India Standard Time', offset: '' },
  { timezone: 'Australia/Sydney', displayName: 'Australian Eastern Time', offset: '' },
];

// Convert UTC datetime to a specific timezone
export function convertToTimezone(utcDate: Date, timezone: string): Date {
  try {
    const normalizedTimezone = normalizeTimezone(timezone);
    return new Date(utcDate.toLocaleString("en-US", { timeZone: normalizedTimezone }));
  } catch (error) {
    console.error(`Error converting to timezone ${timezone} (normalized: ${normalizeTimezone(timezone)}):`, error);
    return utcDate;
  }
}

// Format date with timezone information
export function formatMeetingTime(utcDate: Date, timezone: string): string {
  try {
    const normalizedTimezone = normalizeTimezone(timezone);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: normalizedTimezone,
      timeZoneName: 'short'
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(utcDate);
  } catch (error) {
    console.error(`Error formatting date for timezone ${timezone} (normalized: ${normalizeTimezone(timezone)}):`, error);
    return utcDate.toISOString();
  }
}

// Get timezone display info
export function getTimezoneInfo(timezone: string): TimezoneInfo {
  const found = COMMON_TIMEZONES.find(tz => tz.timezone === timezone);
  if (found) return found;
  
  // Fallback for custom timezones
  return {
    timezone,
    displayName: timezone.replace('_', ' '),
    offset: ''
  };
}

// Generate meeting time previews for all team members
export interface MeetingTimePreview {
  userId: string;
  userName: string;
  timezone: string;
  localTime: string;
  isNextDay: boolean;
  isPreviousDay: boolean;
}

export function generateMeetingPreviews(
  meetingDateTime: Date,
  teamMembers: { id: string; name: string; timezone: string }[],
  meetingTimezone?: string
): MeetingTimePreview[] {
  return teamMembers.map(member => {
    try {
      // If meeting timezone is provided, we need to convert from meeting timezone to member timezone
      let memberLocalTime: string;
      let memberLocalDate: Date;
      
      if (meetingTimezone) {
        // Convert the meeting time to the member's timezone using a more direct approach
        const year = meetingDateTime.getFullYear();
        const month = meetingDateTime.getMonth();
        const date = meetingDateTime.getDate();
        const hours = meetingDateTime.getHours();
        const minutes = meetingDateTime.getMinutes();
        
        // Get the UTC offset for both timezones
        const meetingOffset = getUTCOffsetHours(meetingTimezone);
        const memberOffset = getUTCOffsetHours(member.timezone);
        
        // Calculate time difference
        const timeDiff = memberOffset - meetingOffset;
        
        // Adjust the time
        const adjustedTime = new Date(meetingDateTime);
        adjustedTime.setHours(hours + timeDiff);
        
        memberLocalDate = adjustedTime;
        
        // Format the time for the member's timezone
        memberLocalTime = adjustedTime.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        // Add the timezone abbreviation
        const memberTimezoneAbbr = getTimezoneAbbreviation(member.timezone);
        memberLocalTime += ` ${memberTimezoneAbbr}`;
        
      } else {
        memberLocalDate = meetingDateTime;
        memberLocalTime = formatMeetingTime(meetingDateTime, member.timezone);
      }
      
      // Compare dates properly by using the actual date values
      const meetingDate = new Date(meetingDateTime.getFullYear(), meetingDateTime.getMonth(), meetingDateTime.getDate());
      const memberDate = new Date(memberLocalDate.getFullYear(), memberLocalDate.getMonth(), memberLocalDate.getDate());
      
      // Calculate the difference in days
      const timeDiff = memberDate.getTime() - meetingDate.getTime();
      const dayDifference = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      
      return {
        userId: member.id,
        userName: member.name,
        timezone: member.timezone,
        localTime: memberLocalTime,
        isNextDay: dayDifference > 0,
        isPreviousDay: dayDifference < 0,
      };
    } catch (error) {
      console.error('Error generating timezone preview for', member.name, error);
      return {
        userId: member.id,
        userName: member.name,
        timezone: member.timezone,
        localTime: 'Error calculating time',
        isNextDay: false,
        isPreviousDay: false,
      };
    }
  });
}

// Helper function to get UTC offset in hours for UTC format timezones
function getUTCOffsetHours(timezone: string): number {
  // For UTC format like "UTC+8" or "UTC-5"
  if (timezone.startsWith('UTC')) {
    if (timezone === 'UTC') return 0;
    
    const match = timezone.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const hours = parseInt(match[2]);
      const minutes = match[3] ? parseInt(match[3]) : 0;
      return sign * (hours + minutes / 60);
    }
  }
  
  return 0;
}

// Helper function to get timezone abbreviation for display
function getTimezoneAbbreviation(timezone: string): string {
  // For UTC format timezones, return the original format for clarity
  if (timezone.startsWith('UTC')) {
    return timezone;
  }
  
  // For IANA timezones, try to get abbreviation
  try {
    const normalizedTimezone = normalizeTimezone(timezone);
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: normalizedTimezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName');
    return timeZoneName?.value || timezone;
  } catch (error) {
    return timezone;
  }
}



// Check if two timezones have conflicting business hours
export function checkBusinessHoursConflict(
  meetingTime: Date,
  timezones: string[]
): { timezone: string; isBusinessHours: boolean; localHour: number }[] {
  return timezones.map(timezone => {
    const normalizedTimezone = normalizeTimezone(timezone);
    const localDate = new Date(meetingTime.toLocaleString("en-US", { timeZone: normalizedTimezone }));
    const localHour = localDate.getHours();
    const isBusinessHours = localHour >= 9 && localHour <= 17; // 9 AM to 5 PM
    
    return {
      timezone,
      isBusinessHours,
      localHour
    };
  });
} 