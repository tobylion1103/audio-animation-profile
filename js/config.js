/**
 * Profile config — edit this to match the client later.
 * Discord presence: set discordId to a real Discord snowflake (enable Lanyard by joining discord.gg/lanyard
 * or having the bot; public API: https://api.lanyard.rest/v1/users/{id})
 */
window.PROFILE = {
  username: "todou",
  alias: "d4hj",
  bio: "fr",
  uid: 1042,
  enterText: "click to enter...",
  avatar: "assets/profile.png",
  cursor: "assets/custom_cursor.png",
  background: "assets/3.mp4",
  accent: "#c78cff",
  effectsColor: "#7a3cff",
  backgroundEffect: "snowflakes",
  discordId: "", // e.g. "182658928323198976" — leave empty for demo mock
  badges: [
    { label: "Premium", icon: "◆" },
    { label: "Verified", icon: "✓" },
    { label: "OG", icon: "★" },
    { label: "D4HJ", icon: "D4" },
  ],
  socials: [
    { name: "Discord", href: "https://discord.com", copy: "todou" },
    { name: "GitHub", href: "https://github.com" },
    { name: "X", href: "https://x.com" },
    { name: "Spotify", href: "https://spotify.com" },
  ],
  tracks: [
    {
      title: "Midnight Demo",
      src: "assets/background_music.mp3",
      cover: "assets/cover1.webp",
    },
    {
      title: "Here With Me",
      src: "assets/background_music.mp3",
      cover: "assets/cover2.webp",
    },
    {
      title: "Kawaii Demo",
      src: "assets/background_music.mp3",
      cover: "assets/cover3.webp",
    },
    {
      title: "Smile",
      src: "assets/background_music.mp3",
      cover: "assets/cover4.webp",
    },
  ],
};
