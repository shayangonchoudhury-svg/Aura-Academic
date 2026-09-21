# 🎓 Aura Academic — AI-Powered Academic Companion

> **Organize your academic life. Study smarter. Stay ahead.**

Aura Academic is a modern academic productivity web application built to bring essential student workflows into one focused digital experience.

Designed with a clean, responsive interface and an AI-assisted architecture, the project explores how generative AI can be integrated into everyday academic productivity tools.

🔗 **Live Demo:** https://aura-academic-r7ko.vercel.app/

---

## ✨ Overview

**Aura Academic** is an academic-focused web application designed around the everyday needs of students.

The project combines a modern React interface with AI capabilities, a lightweight Node.js/Express backend, and Progressive Web App tooling to create an experience that works naturally across desktop and mobile devices.

The application is built with a focus on:

* 📚 Academic productivity
* 🤖 AI-assisted experiences
* 📱 Responsive design
* ⚡ Fast modern web technologies
* 🎨 Interactive user experience

---

## 🚀 Core Highlights

### 🤖 AI Integration

Aura Academic integrates **Google Gemini** through the Google GenAI SDK.

The AI layer provides the foundation for intelligent academic experiences while keeping the Gemini API configuration on the server side.

### 📱 Progressive Web App

The project includes PWA tooling to support a more app-like web experience.

This includes:

* PWA plugin integration
* Installable web application support
* Web-based application architecture
* Responsive layouts for different screen sizes

### 🎨 Modern Interface

The UI is built using a modern component-driven approach with:

* React
* Tailwind CSS
* Lucide icons
* Motion animations
* Responsive layouts
* Interactive UI elements

### ⚡ Modern Development Architecture

Aura Academic uses a modern full-stack development setup:

```text
React + TypeScript
        │
        ▼
      Vite
        │
        ▼
Node.js + Express
        │
        ▼
   Google Gemini
```

This separation allows the application to combine a responsive frontend with server-side functionality.

---

## 🧩 Architecture

```text
                         ┌─────────────────┐
                         │      User       │
                         └────────┬────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │    React Frontend      │
                     │   TypeScript + Vite    │
                     └───────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌──────────────┐         ┌──────────────┐
             │ UI / Motion  │         │ PWA Layer    │
             │ Tailwind     │         │              │
             └──────────────┘         └──────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │   Node.js + Express    │
                     │       Backend          │
                     └───────────┬────────────┘
                                 │
                                 ▼
                     ┌────────────────────────┐
                     │     Google Gemini      │
                     │      AI Services       │
                     └────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Motion

### Backend

* Node.js
* Express.js
* TypeScript
* TSX

### AI

* Google Gemini
* `@google/genai`

### PWA

* `vite-plugin-pwa`

### Build & Development

* Vite
* esbuild
* npm
* TypeScript

The repository's `package.json` confirms these core dependencies and build tools.

---

## 📁 Project Structure

```text
Aura-Academic/
│
├── public/
│
├── src/
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
│
├── package.json
├── package-lock.json
│
├── server.ts
├── tsconfig.json
├── vite.config.ts
│
└── README.md
```

---

## 🔐 Environment Variables

| Variable         | Description                                        | Required |
| ---------------- | -------------------------------------------------- | -------- |
| `GEMINI_API_KEY` | Google Gemini API key used by the AI functionality | Yes      |

The repository already includes an `.env.example` file and its current setup expects the Gemini key to be configured locally.

---

## 🤖 AI Architecture

The AI integration follows a server-side approach:

```text
User Interaction
       │
       ▼
React Frontend
       │
       ▼
Express Backend
       │
       ▼
Google Gemini API
       │
       ▼
AI Response
       │
       ▼
React Interface
```

Keeping the Gemini configuration on the server helps avoid exposing the API credential directly in the client application.

---

## 📱 Progressive Web Application

Aura Academic includes `vite-plugin-pwa` in its development stack, providing the foundation for an installable and app-like web experience.

The architecture is designed to support:

* Responsive layouts
* Mobile-friendly interaction
* PWA capabilities
* Web-based installation
* Modern browser experiences

---

## 🎨 Design Philosophy

Aura Academic follows a modern academic-productivity aesthetic:

> **Focused. Intelligent. Minimal.**

The interface uses a combination of modern typography, responsive layouts, iconography, and motion to create an experience that feels more like a dedicated academic application than a traditional static website.

---

## 🔮 Future Improvements

Potential directions for the project include:

* [ ] AI-powered study planning
* [ ] Personalized study recommendations
* [ ] Assignment and deadline management
* [ ] Academic calendar
* [ ] Study session tracking
* [ ] AI-generated study material
* [ ] Notes and document organization
* [ ] Progress analytics
* [ ] Student dashboard customization
* [ ] Offline-first functionality
* [ ] Authentication and personalized profiles
* [ ] Cloud synchronization

---

## 💡 Why I Built This

Students often use multiple disconnected tools to manage their academic responsibilities.

**Aura Academic** explores the idea of bringing academic productivity and AI-assisted workflows into a single modern web experience.

The project is also an exploration of building a full-stack AI-enabled application using modern web technologies such as **React, TypeScript, Vite, Express, and Google Gemini**.

---

## 👨‍💻 Author

**Shayan Gon Choudhury**
Computer Science & Engineering Student

* 💼 **LinkedIn:** [linkedin.com/in/shayan-gon-choudhury](https://www.linkedin.com/in/shayan-gon-choudhury-37a842315)
* 🐙 **GitHub:** [@shayangonchoudhury-svg](https://github.com/shayangonchoudhury-svg)
* 📧 **Email:** [shayangonchoudhuryskms@gmail.com](mailto:shayangonchoudhuryskms@gmail.com)

---

## 📄 License

This project is intended for educational and experimental purposes.
