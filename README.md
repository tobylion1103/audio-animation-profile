# guns.lol /c style clone (demo)

Single-profile biolink page modeled on [guns.lol/c](https://guns.lol/c).

## Features
- Click to enter + video background (`assets/3.mp4`)
- Purple snowflake particles
- Multi-track music player with swapping cover art
- Live Discord presence via [Lanyard](https://api.lanyard.rest) (optional)
- Custom cursor + ghost trail + card parallax
- Badges, socials, UID / views

## Run
```bash
python -m http.server 5173
```
Open http://127.0.0.1:5173/

## Customize
Edit `js/config.js`:
- `username`, `bio`, `avatar`, `background`
- `tracks[]` — title / mp3 / cover image
- `discordId` — Discord snowflake for live presence (join [Lanyard](https://discord.gg/lanyard) so the API can see you)

Older JAQLIV multi-theme build kept in `_jaqliv/`.
