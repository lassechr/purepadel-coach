#!/bin/bash
# Lokal udviklingsserver til PurePadel Coach
# Brug: ./serve.sh [port]
# Kræver Python 3 (følger med macOS og de fleste Linux-distros)

PORT=${1:-8080}
DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  PurePadel Coach — Lokal server"
echo "  ────────────────────────────────"
echo "  URL:  http://localhost:$PORT"
echo "  Mappe: $DIR"
echo ""
echo "  Stop serveren med Ctrl+C"
echo ""

# Foretrækker Python 3, falder tilbage til Python 2
if command -v python3 &>/dev/null; then
    python3 -m http.server "$PORT" --directory "$DIR"
elif command -v python &>/dev/null; then
    cd "$DIR" && python -m SimpleHTTPServer "$PORT"
else
    echo "  FEJL: Python ikke fundet."
    echo "  Installer Python 3 eller kør f.eks.:"
    echo "    npx serve . -p $PORT"
    exit 1
fi
