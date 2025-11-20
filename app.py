from flask import Flask, request, send_from_directory, render_template
import os

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    files = os.listdir(UPLOAD_FOLDER)
    return render_template("index.html", files=files)

@app.route("/upload", methods=["POST"])
def upload():
    f = request.files.get("file")
    if not f or f.filename == "":
        return "No file selected", 400

    save_path = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(save_path)
    return "Uploaded successfully. Go back and tap the filename on your phone."

@app.route("/files/<path:filename>")
def files(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

if __name__ == "__main__":
    # host=0.0.0.0 so other devices on your Wi-Fi (your iPhone) can reach it
    app.run(host="0.0.0.0", port=5000)
