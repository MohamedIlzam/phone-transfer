# Phone Transfer

Concise web app for transferring files between devices over a local network.

## Elevator Pitch
Quick and simple file sharing web app — drag & drop uploads and downloads with a minimal UI. Built to be lightweight and easy to run locally for demos or interviews.

## Highlights (for recruiters)
- Purpose-built small web app demonstrating full-stack skills: backend routing, file uploads, and frontend UI.
- Clean, minimal UI with responsive static assets.
- Small, readable codebase suitable for quick code review and live demos.

## Features
- Upload files via the browser and store them on the server (`/uploads`).
- Simple frontend with JavaScript and responsive styles.
- Favicon and touch icon for a polished presentation.

## Tech Stack
- Python (Flask) — lightweight web backend
- HTML/CSS/JavaScript — frontend
- Static file serving for assets and uploads

## Run Locally (quick)
1. Create a Python virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the app:

```powershell
python app.py
```

4. Open http://localhost:5000 in your browser.

## What to look for in the code
- `app.py` — request handling and upload logic.
- `templates/index.html` — main UI layout.
- `static/app.js` and `static/styles.css` — frontend behavior and styling.

## Demo & Interview Notes
If you'd like a live walkthrough or recorded demo, I can:
- Run the app locally and share my screen.
- Walk through the upload flow and show code responsible for security/validations.

## Contact
- LinkedIn: (add your profile link)
- Email: (add your email)

---
*If you'd like, I can expand this README with architecture diagrams, tests, or deployment steps.*