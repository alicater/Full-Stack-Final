# Life Planner RPG

*A full stack gamified habit tracker that frames daily routines as quests to help users achieve their goals and track long term progress.*

---

## Overview

This application serves as a gamified life planner, turning daily tasks into "quests" that grant experience points (XP). It is designed for individuals seeking a fun, motivational way to build and maintain strong daily habits and routines. The core problem it solves is low motivation and habit discontinuity by using a narrative structure, visible progress bars, and XP rewards, to build consistent self-improvement.

---

## 🌐 Live Demo

| Type                         | Link                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| **Frontend (Deployed Site)** | [https://life-planner-rpg.netlify.app/](https://life-planner-rpg.netlify.app/) |
| **Backend (API Base URL)**   | [https://life-planner-rpg.onrender.com/](https://life-planner-rpg.onrender.com/)   |

---

## ✨ Features

List **3–6 key features**, ideally with short bullets:

* Create, read, and delete Quests (Custom, Daily, and Main types).
* Gamified XP System: Users earn 10 XP for completing any quest, tracked in their header.
* 14-Day Narrative Cycle: Premade Daily/Main Quests are generated based on the current day (1-14) to guide the user's progress.
* Persistent Data: User accounts, XP, and all quest data are stored and managed via MongoDB.
* Error handling for authentication and API calls on the client and server.

### **Advanced Feature: Secure Authentication & State Persistence**

This application uses JWT (JSON Web Token) authentication to ensure that every user's progress and private quest data are protected.

* When a user logs in, the server generates a unique, encrypted token. The token is stored securely on the client side. Then for every subsequent action (like fetching quests or completing a task), the browser sends this token back to the server.

* The server's protect middleware intercepts the token, verifies its authenticity, and ensures the request is only allowed if the user is logged in. This mechanism provides a seamless, secure, and persistent session, meaning a user's XP and quest progress are maintained even if they close and reopen the browser.

## **Advanced Feature: The Quest Reset & Persistence Logic**
To manage the 14-day game cycle, the application implements a targeted database logic.

* When the user chooses to "Reset to Day 1," the server makes a specific call (POST /api/quests/reset-day) that uses MongoDB to update only the narrative-driven tasks (questType: MAIN and questType: DAILY) back to "incomplete."

* This approach allows the core game loop to restart while permanently preserving the completion status of all user-created Custom Quests, keeping their personal achievements intact across game cycles.

---

## 📸 Screenshots
'/screenshots/dashboard_page.png'
'/screenshots/login_page.png'

---

## 🏗️ Project Architecture

Describe how the pieces fit together.

```
/backend
  /models (User, Quest)
  premadeQuests.js
  server.js
  package.json

/frontend
  /public
    /img (background imgs)
  /src
    /components
    /context (AuthContext)
    /pages (Dashboard, Login, Register)
    App.jsx
    main.jsx
    index.css
    App.css
```

The React frontend communicates with the Express backend through API routes. The backend interacts with MongoDB using Mongoose models, and environment variables are used to store secrets. User authentication is handled via JWTs (JSON Web Tokens) passed in the Authorization header.

---

## 📦 Installation & Setup

### **1. Clone the project**

```bash
git clone https://github.com/alicater/Full-Stack-Final.git
cd your-project
```

---

### **2. Environment Variables**

Include a `.env.example` file in both repos.

**Backend `.env.example`:**

```
MONGO_URI=your_mongodb_url
PORT=3001
JWT_SECRET=your_secret_if_using_auth
API_KEY=if_using_external_apis
```

**Frontend `.env.example`:**

```
VITE_API_URL=http://localhost:3001
```

---

### **3. Install Dependencies**

#### Frontend:

```bash
cd frontend
npm install
npm run dev
```

#### Backend:

```bash
cd backend
npm install
npm run dev
```

---

### **4. Running Entire App Locally**

1. Start backend on `http://localhost:3001` (use `npm start`)
2. Start frontend on `http://localhost:5173` (use `npm run dev`)
3. Confirm CORS + API requests are working

---

## API Documentation

All authenticated routes require a JWT in the Authorization: Bearer <token> header.

### POST /api/auth/register
Creates a new user and returns a JWT.

Body example:
```json
{
  "username": "new_usr",
  "password": "secure_password"
}
```
### POST /api/auth/login
Authenticates a user and returns their XP and a JWT.

### GET /api/quests?day={N}
Returns all active (uncompleted) quests for the user for the given day (N). Automatically generates premade quests for that day if they don't exist.

### POST /api/quests/custom
Creates a new custom quest for the authenticated user.

Body example:
```JSON
{
  "name": "New Quest"
}
```

### PATCH /api/quests/:id/complete
Marks the specified quest as completed and grants the user 10 XP.
---

## Deployment Notes

Document where/how you deployed:

### **Frontend**

* Netlify
* Build Command:` npm run build`
* Netlify Redirects: Requires a `_redirects` file in the public folder for routing.

### **Backend**

* Render
* Start Command: `node server.js` (Defined in package.json as "start": "node server.js")
* Environment Variables: `MONGODB_URI`, `JWT_SECRET, and `NODE_ENV=production` are set on the Render dashboard.


---

## 🎥 Video Walkthrough

**Link to Loom/YouTube:**
[https://youtu.be/nkf6M7stQjU](https://youtu.be/nkf6M7stQjU)

---

# 🧠 Reflection

### **1. What was the hardest part of this project?**

The hardest part was debugging the CORS and pathing issues during deployment to Render and Netlify. Although the configuration was technically correct, the server kept serving an old environment variable, leading to a 404 Not Found error for all API routes. The final fix required consolidating imports and ensuring the start script in package.json correctly pointed to server.js, a small but critical error that took hours to figure out.

### **2. What are you most proud of?**

I am most proud of the Quest Reset & Persistence Logic. Designing a single backend route (`/api/quests/reset-day`) that could correctly identify MAIN and DAILY quests for a full reset while intentionally leaving CUSTOM quests alone required MongoDB querying logic (`$in: ['MAIN', 'DAILY']`) and showed that I understood data state separation for between game narrative and user history.

### **3. What would you do differently next time?**

I would plan the project with a dedicated `config` or `utils` file for all fetch and API calls from the start. Hardcoding the base API URL in the AuthContext made the frontend deployment tricky and fragile. Using a centralized utility function would have made the environment variable logic cleaner and prevented the final double-slash URL errors that I faced in deployment.

### **4. How did you incorporate feedback from the 12/5 check-in gallery?**

I was able to incorporate feedback regarding the overall aesthetic and usability. I spent extra time refining the CSS for the Quest Board to use Flexbox (.quest-item), aligning the complete buttons in a clean column on the right side. I also refined the mobile media queries to stack the quests vertically, ensuring the app remains fully readable and usable on small screens. Some of my peers gave specific color pallatte suggestions that I implemented (the green really worked out well).

---

# Acknowledgments / AI Usage Disclosure

I used Google Gemini and ChatGPT to create the background images and generate the story/narrative elements of the app. I also consulted Gemini when I was facing the persisiten CORS and 404 deployment errors on Render/Netlify and work out the progress bar visibility logic (getting 0% to display as text overlay on the blank progress bar and then switching to inside the progress fill once above 0%).