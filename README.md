# RailFinder 🚂
**Indian Railways Wayfinder** — Find restaurants, hotels, hospitals, and more near any Indian railway station.

🌐 **Live at:** [rail-finder.vercel.app](https://rail-finder.vercel.app)

---

## Project Structure
```
railfinder/
├── backend/          ← FastAPI — deployed on Render
└── frontend/         ← React + Vite — deployed on Vercel
```

---

## Local Development

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API will be live at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### 2. Frontend
```bash
cd frontend
npm install
# Create .env.local and set:
# VITE_API_URL=http://localhost:8000
npm run dev
```
App will be live at `http://localhost:5173`

---

## Deployment

### Backend → Render
1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Start Command** to:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Copy the Render public URL (e.g. `https://railfinder-ipz7.onrender.com`)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` = your Render URL from above
4. Deploy — Vercel handles the rest

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/stations/search?q=NDLS` | Search stations by name or code |
| GET | `/stations/{code}` | Get station by exact code |
| GET | `/nearby?lat=&lon=&radius=3000&category=` | Get nearby places |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Data | `stations.json` (GeoJSON), Overpass API (OSM) |
| Hosting | Vercel (frontend), Render (backend) |

---

## Design System

Follows **"The Modern Wayfinder"** design system:
- Font: **Plus Jakarta Sans**
- Primary: `#002653` (deep navy)
- Accent: `#feae2c` (warm orange)
- All surfaces use tonal layering — no hard borders
