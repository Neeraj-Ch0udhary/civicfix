# 📍 SmartShehar — Citizen Civic App

> Spot It. Report It. Fix It.

SmartShehar is a React Native (Expo) mobile app that empowers citizens to report civic issues, track their resolution, and visualize AI-adaptive traffic signal management — all in one place.

---

## 🚀 Features

### 🚨 1. Citizen Issue Reporting
- Take a photo or pick from gallery
- Auto-detect GPS location with reverse geocoding (shows full address)
- Select issue category (Pothole, Garbage, Street Light, Water Leak, etc.)
- Submit report → city officials review on admin dashboard
- Track status: Pending → In Progress → Resolved

### 📋 2. Community Feed
- See all reported issues in real time
- Filter by status (Pending / In Progress / Resolved / Rejected)
- Search by category, description, or address
- Tap any issue to see full details, photo, and status timeline
- Pull to refresh

### 🚦 3. Smart Adaptive Traffic Signals *(AI Feature)*
- Live intersection view showing which road is currently GREEN
- Green time allocated proportionally based on vehicle count per road
- Admin controls congestion level from dashboard → app updates in 5 seconds
- Countdown timer, traffic bars, and "How it works" explanation
- Simulates real-world AI/IoT adaptive signal systems

### 👤 4. Profile
- Set name and profile picture (saved locally)
- View your submitted issues with status badges
- Stats: Total / Pending / In Progress / Resolved reports
- Logout with persistent photo across sessions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (SDK 51) |
| Navigation | Expo Router (file-based) |
| Backend | Supabase (PostgreSQL + Storage) |
| Local Storage | AsyncStorage |
| Location | expo-location (GPS + reverse geocode) |
| Camera | expo-image-picker |
| Styling | React Native StyleSheet |

---

## 📁 Project Structure

```
app/
├── _layout.tsx          # Auth gate (profile creation)
└── (tabs)/
    ├── _layout.tsx      # Tab bar config
    ├── index.tsx        # Feed screen
    ├── report.tsx       # Report issue screen
    ├── signals.tsx      # Smart signals screen
    └── profile.tsx      # User profile screen

constants/
└── api.ts               # Supabase client + all API calls
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- Expo Go app on your phone

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/smartshehar.git
cd smartshehar
npm install
npx expo start --clear
```

Scan the QR code with Expo Go on your Android/iOS device.

### Environment
Supabase credentials are in `constants/api.ts`. For production, move them to environment variables.

---

## 🗄 Supabase Schema

### `issues` table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Issue title |
| category | text | Issue category |
| description | text | Detailed description |
| latitude | float | GPS latitude |
| longitude | float | GPS longitude |
| address | text | Reverse geocoded address |
| photo_url | text | Supabase storage URL |
| status | text | pending / in-progress / resolved / rejected |
| created_at | timestamp | Submission time |

### `signals` table
| Column | Type | Description |
|--------|------|-------------|
| id | text | Road ID (north/south/east/west) |
| road | text | Road name |
| vehicle_count | int | Current vehicle count (set by admin) |
| updated_at | timestamp | Last update time |

---

## 🔗 Related

- **Admin Dashboard** → [smartshehar-admin](https://github.com/Neeraj-Ch0udhary/smartshehar-admin)
- **Live Dashboard** → Deployed on Vercel

---

## 👨‍💻 Built for

Smart India Hackathon / Internship Project — demonstrating AI-driven civic tech for Indian cities.