# 📍 SmartShehar — Admin Dashboard

> City official control panel for SmartShehar civic app

A React web dashboard for city administrators to manage citizen-reported issues and control adaptive traffic signal simulation in real time.

---

## 🚀 Features

### 📋 Issue Management
- View all citizen-reported issues in a sortable table
- Filter by category (Pothole, Garbage, Street Light, etc.)
- Filter by status (Pending / In Progress / Resolved / Rejected)
- Search by title, description, or address
- Click any issue to see full details including photo
- Update issue status with one click — syncs to mobile app instantly

### 🚦 Traffic Signal Control *(AI Feature)*
- Set vehicle congestion level per road (North / South / East / West)
- Sliders from 0–100 vehicles per road
- Dashboard computes and previews green time allocation automatically
- Save changes → mobile app reflects new signal timings within 5 seconds
- Summary panel showing computed green time for all 4 roads

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Backend | Supabase (PostgreSQL) |
| Deployment | Vercel |
| Styling | Inline CSS (no dependencies) |

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/smartshehar-admin.git
cd smartshehar-admin
npm install
npm start
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## 🧠 Signal Green Time Formula

Green time is allocated proportionally based on vehicle count:

```
ratio = road_vehicles / total_vehicles
green_time = 5 + ratio × 25   (min 5s, max 30s)
```

Example: If North has 60 vehicles out of 100 total → 5 + 0.6×25 = **20 seconds green**

---

## 🔗 Related

- **Mobile App** → [smartshehar](https://github.com/YOUR_USERNAME/smartshehar)

---

## 👨‍💻 Built for

Smart India Hackathon / Internship Project — demonstrating AI-driven civic tech for Indian cities.