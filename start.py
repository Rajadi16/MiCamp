#!/usr/bin/env python3
"""
MiCamp Server Starter
Starts both backend (Node.js) and frontend (Python HTTP server) in one command
"""
import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def start_backend():
    """Start the Node.js backend server"""
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    print("🚀 Starting Backend Server (Node.js)...")
    print("   Backend will run on: http://localhost:4000")
    
    # Start backend in a new window (Windows)
    if sys.platform == "win32":
        subprocess.Popen(
            ["cmd", "/c", "start", "cmd", "/k", 
             "node", "node_modules\\.bin\\ts-node-dev", "--respawn", "--pretty", "src/index.ts"],
            cwd=backend_dir
        )
    else:
        # For Linux/Mac
        subprocess.Popen(
            ["node", "node_modules/.bin/ts-node-dev", "--respawn", "--pretty", "src/index.ts"],
            cwd=backend_dir
        )
    
    time.sleep(2)  # Give backend time to start

def start_frontend():
    """Start the Python HTTP server"""
    frontend_dir = Path(__file__).parent
    os.chdir(frontend_dir)
    
    print("🌐 Starting Frontend Server (Python)...")
    print("   Frontend will run on: http://localhost:8080")
    print("\n" + "="*50)
    print("✅ Both servers are running!")
    print("="*50)
    print("\n📍 Access your website at:")
    print("   • Homepage: http://localhost:8080")
    print("   • Campus Map: http://localhost:8080/pages/campus-map.html")
    print("   • Admin: http://localhost:8080/pages/admin-locations.html")
    print("\n⚠️  Press Ctrl+C to stop the frontend server")
    print("   (Backend will keep running in its own window)")
    print("="*50 + "\n")
    
    # Open browser automatically
    time.sleep(1)
    webbrowser.open("http://localhost:8080")
    
    # Start the HTTP server (this will block)
    import http.server
    import socketserver
    
    PORT = 8080
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🎉 Frontend server running on http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Frontend server stopped.")
            print("   Backend server is still running in its window.")

if __name__ == "__main__":
    try:
        start_backend()
        start_frontend()
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down...")
        sys.exit(0)


