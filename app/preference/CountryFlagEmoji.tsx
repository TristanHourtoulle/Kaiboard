import {
  countryNameRecord,
  CountryCode,
  getCountryFlagEmoji,
} from "@/lib/types";

interface CountryFlagEmojiProps {
  code?: CountryCode;
}

export const CountryFlagEmoji = ({ code }: CountryFlagEmojiProps) => {
  const title = code ? countryNameRecord[code] || code : undefined;
  return (
    <span role="img" aria-labelledby={title} title={title}>
      {code ? getCountryFlagEmoji(code) : "🏳"}
    </span>
  );
};
