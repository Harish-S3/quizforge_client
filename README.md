# 👑 QuizForge: The AI-Powered Real-Time Quiz Arena

**QuizForge** is a dynamic, full-stack web application that transforms any educational text into a thrilling, real-time multiplayer quiz game. Built with a modern, decoupled architecture, it leverages the power of AI to forge knowledge into competition.

---

### ✨ Live Demo

*   **Frontend Client (Vercel):** [https://quizforge-client.vercel.app/](https://quizforge-client.vercel.app/)
*   **Backend Server (Render):** [https://quizforge-server.onrender.com/](https://quizforge-server.onrender.com/)

*(**Note:** The free-tier backend server may take 30-60 seconds to "wake up" on the first visit after a period of inactivity.)*

---


---

### 🔥 Core Features

*   **Real-Time Multiplayer Lobbies:** Create private quiz rooms and invite friends with a unique, shareable room code.
*   **AI-Powered Quiz Generation:** Upload PDF, DOCX, or TXT files, or simply paste raw text. The application uses the Google Gemini API to instantly generate a structured quiz based on the content.
*   **Customizable Game Settings:** As the host, control the number of questions and the time limit for each question, tailoring the challenge for your audience.
*   **Live, Competitive Gameplay:** Questions are broadcast to all players simultaneously. A dynamic timer bar creates urgency.
*   **Time-Based Scoring Algorithm:** The faster you answer correctly, the more points you get, rewarding both knowledge and speed.
*   **Real-Time Animated Leaderboard:** Watch the scores update instantly after every question, keeping the competition fierce.
*   **Shareable Results:** At the end of the game, get a beautiful, shareable image of the final leaderboard to prove your victory.
*   **Fully Responsive UI:** A stunning, mobile-first dark theme with fluid animations ensures a premium experience on any device.

---

### 🛠️ Tech Stack & Architecture

The project is built on a decoupled, three-tiered cloud-native architecture, ensuring a clear separation of concerns and scalability.

| Tier      | Technology                                                                                                                              |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**  | `React` `Vite` `Framer Motion` `Socket.IO Client`                                                                                      |
| **Backend**   | `Node.js` `Express` `Socket.IO Server` `Mongoose`                                                                                       |
| **Database**  | `MongoDB Atlas` (NoSQL)                                                                                                                  |
| **AI**        | `Google Gemini API`                                                                                                                     |
| **Deployment**| `Vercel` (Frontend) & `Render` (Backend)                                                                                                |



---

### 🚀 Getting Started: Running Locally

To run this project on your local machine, you will need two separate terminal instances.

**Prerequisites:**
*   Node.js (v18 or later)
*   Git

**1. Clone the Kingdoms:**
```bash
# Clone the Frontend
git clone https://github.com/Harish-S3/quizforge_client.git

# Clone the Backend
git clone https://github.com/Harish-S3/quizforge_server.git
