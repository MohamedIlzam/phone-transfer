from flask import Flask, request, send_from_directory, render_template, jsonify, send_file, redirect
import os
import socket
import qrcode
from io import BytesIO
from datetime import datetime
import mimetypes

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Create a socket to determine the local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def format_file_size(size_bytes):
    """Convert bytes to human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

def get_file_metadata(filename):
    """Get metadata for a file"""
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return None
    
    stat = os.stat(filepath)
    mime_type, _ = mimetypes.guess_type(filename)
    
    return {
        'name': filename,
        'size': format_file_size(stat.st_size),
        'size_bytes': stat.st_size,
        'modified': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M'),
        'type': mime_type or 'unknown',
        'is_image': mime_type and mime_type.startswith('image/')
    }

@app.route("/")
def index():
    files = os.listdir(UPLOAD_FOLDER)
    file_metadata = [get_file_metadata(f) for f in files]
    file_metadata = [f for f in file_metadata if f is not None]
    
    local_ip = get_local_ip()
    return render_template("index.html", files=file_metadata, local_ip=local_ip)

@app.route("/qr")
def qr_code():
    """Generate QR code for the local server URL"""
    local_ip = get_local_ip()
    url = f"http://{local_ip}:5000"
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to BytesIO
    buf = BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    
    return send_file(buf, mimetype='image/png')

@app.route("/upload", methods=["POST"])
def upload():
    """Handle file upload from any device"""
    if "file" not in request.files:
        return "No file part", 400

    file = request.files["file"]
    if file.filename == "":
        return "No selected file", 400

    if file:
        filename = file.filename
        file.save(os.path.join(UPLOAD_FOLDER, filename))
        # Redirect to homepage with tab parameter to show available files
        return redirect("/?tab=available")

    return "Upload failed", 400

@app.route("/files/<path:filename>")
def files(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

@app.route("/preview/<path:filename>")
def preview(filename):
    """Serve image preview (not as attachment)"""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/delete/<path:filename>", methods=["POST"])
def delete_file(filename):
    """Delete a file from the uploads folder"""
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({"success": True, "message": f"Deleted {filename}"})
        else:
            return jsonify({"success": False, "message": "File not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/details/<path:filename>")
def file_details(filename):
    """Get detailed information about a file"""
    metadata = get_file_metadata(filename)
    if metadata:
        return jsonify(metadata)
    else:
        return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    # host=0.0.0.0 so other devices on your Wi-Fi (phone, tablet, etc.) can reach it
    app.run(host="0.0.0.0", port=5000)
