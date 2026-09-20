#!/bin/bash
# Preview the Wavesbychin site locally.
#   ./serve.sh            -> http://localhost:8798
# Also printed: your LAN address, so you can open it on your phone.
cd "$(dirname "$0")"
PORT="${1:-8798}"
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
echo "Local:  http://localhost:$PORT"
[ -n "$IP" ] && echo "Phone:  http://$IP:$PORT   (same wifi)"
python3 -m http.server "$PORT"
