/** Client-visible default ElevenLabs voice id for image slideshow render. Set `NEXT_PUBLIC_SLIDESHOW_VOICE_ID` in `.env.local`. */
export const SLIDESHOW_DEFAULT_VOICE_ID =
  typeof process.env.NEXT_PUBLIC_SLIDESHOW_VOICE_ID === "string"
    ? process.env.NEXT_PUBLIC_SLIDESHOW_VOICE_ID.trim()
    : "";
