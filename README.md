# CodeSync: Real-time Collaborative Code Editor 🧑‍💻

CodeSync is a real-time collaborative code editor designed for developers to work together on projects seamlessly. With a modern, intuitive interface, it offers features like live code editing, multi-file support, and integrated chat. The application is built with the **MERN** stack, leveraging **Socket.IO** for real-time communication and **Render** for hosting.

[![Live Project](https://img.shields.io/badge/Live%20Project-Live%20Link-orange)](https://codesync-5wgo.onrender.com/)

---

## ✨ Features

### Core Functionality
- **Real-time Collaboration**: Synchronized code editing for all users in a room.
- **Multi-file Support**: Create, delete, and switch between multiple code files within a single room.
- **Integrated Chat**: Real-time room chat with history persistence.
- **Online User Presence**: See who's currently in your room.
- **Code Execution**: Run your code instantly in Node.js, Python, Java, C, and C++ through the JDoodle API.
- **Secure Authentication**: Email/password authentication using JSON Web Tokens (JWT).

### Architecture & Design
- **Scalable Real-time Engine**: Designed to handle 1k+ concurrent users with a scalable Socket.IO architecture.
- **Persistence**: Code and chat history are saved in **MongoDB Atlas** for reliability.
- **Modular Backend**: Clear separation of concerns with dedicated controllers and services.
- **Cost-effective Hosting**: Deployed on **Render** to ensure a low-cost, scalable solution.

---

## 🛠 Tech Stack

### Frontend
- **React 18**: Frontend UI library.
- **Monaco Editor**: The powerful code editor component.
- **Socket.IO-Client**: For real-time WebSocket communication.
- **Axios**: HTTP client for API requests.
- **React Router v6**: For client-side routing.
- **React-Bootstrap**: Responsive UI components.

### Backend
- **Node.js & Express.js**: Backend web server.
- **Socket.IO**: Real-time engine for event-driven communication.
- **Mongoose**: MongoDB object modeling.
- **bcryptjs**: Password hashing.
- **jsonwebtoken**: For JWT authentication.
- **cors**: To manage Cross-Origin Resource Sharing.

### Database
- **MongoDB Atlas**: A cloud-hosted NoSQL database service.

### External APIs
- **JDoodle**: For multi-language code execution.

### Deployment
- **Render**: Cloud platform for hosting the backend and frontend.

---

## 📁 Project Structure

```text
codesync/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── FileTabs.jsx
│   │   │   └── OnlineUsers.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Room.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
├── server/                      # Node.js Backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── rooms.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   └── jDoodleService.js
│   ├── middleware/
│   │   └── auth.js
│   └── index.js                 # Main server entry point
├── package.json
└── README.md
```
