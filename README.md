# Knowledge-Retrieval Chatbot

A chatbot application that can answer questions by retrieving knowledge from a custom data source. Built with Next.js, this project lets you plug in your own documents or data, and use an LLM (Large Language Model) to respond intelligently based on that knowledge.

---

## 🚀 Features

* Retrieve and answer questions using documents you provide
* Easy-to-configure environment variables
* Web UI built with Next.js
* Modular architecture so you can extend data sources or LLM backend
* Ready for local development and production

---

## 📦 Tech Stack

* **Frontend / Web UI**: Next.js
* **Backend logic**: LLM provider API - Anthropic 
* **Environment configuration**: `.env.local` for secrets
* **Package management**: npm / yarn / pnpm

---

## 🔧 Getting Started

### Prerequisites

* Node.js (version X.Y.Z or higher)
* npm / yarn / pnpm
* An API key for your LLM provider (e.g., OpenAI)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/chippedbrain/knowledge-retrieval-chatbot.git
   cd knowledge-retrieval-chatbot
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up your environment variables**

   * There's a file named `.env.example` in the repo.
   * Copy it to `.env.local`:

     ```bash
     cp .env.example .env.local
     ```
   * Open `.env.local` in your editor and add your API key:

     ```
     API_KEY=your_api_key_here
     ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Then open your browser to [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🧪 Usage

1. Add or configure your document / knowledge source.
2. Use the chat interface to ask questions.
3. The bot will retrieve relevant knowledge and rely on the LLM to generate an answer.

---

## ⚙️ Configuration

| Variable | Description               |
| -------- | ------------------------- |
| API_KEY  | Your LLM provider API key |

---

## 🔐 Security / Secrets

* **Do not commit your actual `.env.local`** — it is intentionally ignored.
* Commit only **`.env.example`** with placeholder values.

---

## ❓ FAQ / Troubleshooting

* **Bot not responding or giving weak answers?** Ensure your knowledge source is formatted correctly and your API key is valid.
* **Changes in `.env.local` not applying?** Restart your dev server.