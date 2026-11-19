# Groq Playground Clone (Full-Stack)

A pixel-accurate clone of the **Groq Playground (Chat tab)** built with **React**, **Vite**, **Tailwind CSS**, and a **Node.js / Express** proxy backend. It streams token-by-token completions live from the Groq API on LPUs while keeping your `GROQ_API_KEY` secure on the server.

![Groq Playground Clone Theme](https://img.shields.io/badge/Theme-Dark%20%23131519-orange?style=flat-square)
![Groq Accent](https://img.shields.io/badge/Accent-%23f55036-red?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Tailwind%20%7C%20Express-blue?style=flat-square)

---

## Features

- **Groq Playground UI**: Dark theme (`#131519` background, `#1c1e23` panels, `#f55036` orange-red accents, rounded borders, monospace & sans-serif fonts).
- **Live SSE Token Streaming**: Ultra-fast responses streamed chunk-by-chunk with a blinking cursor and real-time generation speed.
- **Markdown & Code Syntax Highlighting**: Full Markdown parsing (GFM, tables, lists) and syntax-highlighted code blocks with individual copy buttons.
- **Conversation Context Memory**: Sends the full conversation history (System message + all User/Assistant turns) with each request so the model preserves dialogue context.
- **Model Selector**:
  - `openai/gpt-oss-120b` (Default)
  - `llama-3.3-70b-versatile`
  - `llama-3.1-8b-instant`
  - `deepseek-r1-distill-llama-70b`
  - `mixtral-8x7b-32768`
  - `gemma2-9b-it`
- **View Code Modal**: Generates ready-to-run code snippets in **cURL**, **Python (Groq SDK)**, and **JavaScript (Fetch)** matching your current parameters and messages.
- **Collapsible Parameters Sidebar**:
  - **Temperature**: Synchronized 0–2 slider and numeric input (default `1`)
  - **Max Completion Tokens**: Synchronized 1–8192 slider and numeric input (default `2048`)
  - **Reasoning Effort**: Dropdown (`low`, `medium`, `high`)
  - **Stream**: Toggle (default `on`)
  - **JSON Mode**: Toggle (default `off`)
  - **Built-in tools**: Browser Search & Code Interpreter toggles (UI preview)
  - **Custom function tools**: "+ Add Function" modal to define custom JSON schema tools
  - **MCP Servers**: Interface preview for Model Context Protocol servers
- **Metrics Display**: Shows token count, response duration, and inference speed (e.g. `450 tokens · 1.25s · 360.0 T/s`) below every assistant turn.
- **Keyboard Shortcuts**: `Cmd + Enter` / `Ctrl + Enter` to submit.
- **Stop Generation**: Immediate abort button connected to backend `AbortController` to cancel in-flight streams.
- **Turn Management**: Add extra message turns (`+ Add Turn`), edit past user messages, delete turns, or clear conversation (`Clear`).
- **Persistent State**: Chat messages, system prompt, and parameters are automatically saved in `localStorage`.
- **Responsive Design**: Parameters panel turns into a sliding drawer on mobile and tablet screens.

---

## Project Structure

```
web_pro/
├── package.json              # Monorepo root scripts (dev, build, install:all)
├── .env.example              # Environment variables template
├── .env                      # Your local environment variables
├── README.md                 # Documentation and setup instructions
├── server/
│   ├── package.json          # Server dependencies (Express, CORS, dotenv)
│   └── server.js             # Express proxy, SSE streaming, and error handling
└── client/
    ├── package.json          # Client dependencies (React, Vite, Tailwind, Lucide, etc.)
    ├── vite.config.js        # Vite config with backend proxy (/api -> :5001)
    ├── tailwind.config.js    # Custom Groq color palette and styling
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx          # React DOM entry point
        ├── App.jsx           # Main orchestrator & state manager
        ├── index.css         # Theme styles, scrollbars, code highlighting
        ├── components/
        │   ├── Navbar.jsx            # Top navbar with brand, links & avatar
        │   ├── PageHeader.jsx        # Playground title, Chat/Studio, model picker
        │   ├── ChatArea.jsx          # Stacked conversation turns & sticky action bar
        │   ├── MessageCard.jsx       # User/Assistant card with Markdown & code copy
        │   ├── SystemPromptCard.jsx  # Collapsible system message card
        │   ├── ParametersSidebar.jsx # Parameters panel & tools drawer
        │   ├── ViewCodeModal.jsx     # cURL, Python, JS code generator modal
        │   ├── FunctionModal.jsx     # Add custom function tool modal
        │   ├── ApiKeyModal.jsx       # Optional browser API key manager
        │   └── Toast.jsx             # Error, success, and info alerts
        └── utils/
            ├── constants.js          # Models, parameter defaults, storage keys
            └── codeGenerators.js     # Snippet generators for View Code
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Groq API Key**: Obtain a free API key at [console.groq.com/keys](https://console.groq.com/keys)

---

### Step 1: Install Dependencies

From the project root:

```bash
npm run install:all
```

*(Alternatively, run `npm install` inside both `server/` and `client/`)*

---

### Step 2: Configure Your Groq API Key

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and add your Groq API key:

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
PORT=5001
```

> **Note**: You can also enter or update your Groq API Key directly in the UI by clicking the **API Keys** button in the top navigation bar.

---

### Step 3: Start Development Mode

Run both the Express backend and the Vite frontend simultaneously:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

Open [http://localhost:5173](http://localhost:5173) in your browser to start chatting!

---

### Step 4: Production Build (Optional)

To build the frontend and serve it directly through Express on port 5001:

```bash
npm run build
npm start
```

Visit [http://localhost:5001](http://localhost:5001).

---

## API Endpoints

- `GET /api/health`: Returns server status and whether `GROQ_API_KEY` is configured.
- `GET /api/models`: Returns list of available Groq chat models.
- `POST /api/chat`: Accepts `{ model, messages, temperature, max_completion_tokens, reasoning_effort, stream, json_mode }` and proxies to Groq with Server-Sent Events (SSE) streaming.
