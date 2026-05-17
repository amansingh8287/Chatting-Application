# 💬 Real-Time Chat Application (MERN + Socket.IO)

A full-stack **real-time chat application** built using the **MERN stack** with **Socket.IO**, featuring instant messaging, video calling, voice typing, and a modern responsive UI.

---

## 🚀 Features

### 🔐 Authentication

* Signup / Login (JWT आधारित)
* Secure user sessions

### 💬 Chat System

* Real-time messaging (Socket.IO)
* Instant message delivery ⚡
* Typing indicator (WhatsApp-style)
* Message seen & delivered status ✔✔

### 📞 Calling Features

* One-to-one **Video Calling**
* Audio support 🎤
* Camera switch (front ↔ back) 🔄
* Call accept / reject / end

### 🎙️ Voice Typing

* Speech-to-text input 🎤
* Auto stop on silence
* Smart timing control

### 🟢 Presence System

* Online / Offline status
* Live typing status in header

### 📱 UI/UX

* Fully responsive (Mobile + Desktop)
* WhatsApp-like mobile navigation
* Sidebar toggle (mobile optimized)
* Smooth animations & transitions

### 👤 User Features

* Profile avatar
* User list with online status
* Clean chat UI

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Socket.IO Client

### 🔹 Backend

* Node.js
* Express.js
* Socket.IO

### 🔹 Database

* MongoDB Atlas

---

## 📂 Project Structure

```
chat-app/
├── frontend/
├── backend/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/amansingh8287/Real-Time-Chatting-Application.git
cd Real-Time-Chatting-Application
```

---

### 2️⃣ Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file inside **backend**:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET_KEY=your_secret_key
```

---

### 4️⃣ Run the Application

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm start
```

---

## 🌐 Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## 📱 Live Demo

👉 https://chatting-application-eight.vercel.app

---

## 👨‍💻 Author

**Aman Singh**

---

## ⭐ Support

If you like this project, don’t forget to ⭐ the repository!

---

## 🚀 Future Improvements

* Group chat 👥
* File sharing 📎
* Screen sharing 🖥️
* Background blur in video call 🎥
* Push notifications 🔔

---

## 💡 About

A modern **real-time communication platform** inspired by WhatsApp & Zoom, built to demonstrate scalable WebSocket-based architecture.

---

