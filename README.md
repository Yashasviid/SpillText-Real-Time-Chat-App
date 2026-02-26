# SpillText — Real-Time Messaging App

Where Conversation flows , SpillText is a live chat web-application built with **Next.js**, **TypeScript**, **Clerk**, and **Convex**.

![SpillText](https://spill-text-real-time-chat-gofdwos4w-yashasviids-projects.vercel.app)

## ✨ Features

- 🔐 **Auth** — Sign up/in with Clerk (email, Google, GitHub)
- 💬 **Direct Messages** — 1-on-1 real-time conversations
- 👥 **Group Chats** — Create groups with multiple members
- 🟢 **Online Presence** — See who's online in real-time
- 🗑️ **Delete Messages** — Remove your own messages
- ✅ **Read Receipts** — Know when messages are read
- ⚡ **Real-time** — Powered by Convex subscriptions
- 🎨 **Dark Theme** — Sleek dark UI with teal accents

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account
- A [Convex](https://convex.dev) account

---

### 1. Clone & Install

```bash
git clone <your-repo>
cd SpillText
npm install
```

---

### 2. Set Up Convex

```bash
npx convex dev
```

This will:
- Create a new Convex project (or connect to existing)
- Generate the `convex/_generated/` folder
- Give you your `NEXT_PUBLIC_CONVEX_URL`

---

### 3. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create an application
2. Get your **Publishable Key** and **Secret Key**
3. In Clerk Dashboard → **Webhooks** → Add endpoint:
   - URL: `https://YOUR_CONVEX_URL/clerk-webhook`
   - Events: `user.created`, `user.updated`
4. Copy the **Signing Secret** for `CLERK_WEBHOOK_SECRET`

---

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Convex environment variable (set via dashboard or CLI)
CLERK_WEBHOOK_SECRET=whsec_...
```

Set the webhook secret in Convex:
```bash
npx convex env set CLERK_WEBHOOK_SECRET whsec_YOUR_SECRET
```

---

### 5. Run Development Server

```bash
# Terminal 1 — Convex
npx convex dev

# Terminal 2 — Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
SpillText/
├── app/
│   ├── layout.tsx              # Root layout with Clerk + Convex providers
│   ├── page.tsx                # Home (redirects to /chat after auth)
│   ├── globals.css             # Global styles + animations
│   ├── sign-in/page.tsx        # Clerk sign-in page
│   ├── sign-up/page.tsx        # Clerk sign-up page
│   └── chat/
│       ├── page.tsx            # Chat landing (empty state)
│       └── [conversationId]/   # Dynamic chat room
│           └── page.tsx
├── components/
│   ├── ConvexClientProvider.tsx
│   └── chat/
│       ├── Sidebar.tsx         # Conversation list + new chat modal
│       ├── ChatWindow.tsx      # Main chat area
│       ├── ChatHeader.tsx      # Chat room header with user info
│       ├── MessageBubble.tsx   # Individual message component
│       ├── ChatInput.tsx       # Message input with emoji picker
│       └── EmptyChat.tsx       # Empty state
├── convex/
│   ├── schema.ts               # Database schema
│   ├── users.ts                # User CRUD & sync
│   ├── conversations.ts        # Conversation management
│   ├── messages.ts             # Message CRUD
│   └── http.ts                 # Clerk webhook handler
└── middleware.ts               # Clerk auth middleware
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Clerk** | Authentication & user management |
| **Convex** | Real-time backend (DB + API) |
| **Tailwind CSS** | Styling |
| **date-fns** | Date formatting |
| **lucide-react** | Icons |

---

## 🔒 Architecture

```
User → Clerk Auth → Next.js App
                         ↓
                   Convex Backend
                    ┌──────────┐
                    │ users    │  ← synced via Clerk webhooks
                    │ convos   │  ← real-time subscriptions
                    │ messages │  ← instant delivery
                    └──────────┘
```

- **Authentication**: Clerk handles all auth. User data is synced to Convex via webhooks.
- **Real-time**: Convex `useQuery` hooks auto-subscribe to database changes.
- **Security**: All mutations verify the user's `clerkId` before modifying data.

---

## 📦 Deployment

### Deploy to Vercel

```bash
vercel deploy
```

Add all environment variables in Vercel dashboard.

### Deploy Convex

```bash
npx convex deploy
```

---

## 🎨 Customization

The app uses CSS variables for easy theming:

```css
:root {
  --accent: #22d3a0;        /* Primary teal color */
  --bg-dark: #0d1424;       /* Main background */
  --bg-sidebar: #111827;    /* Sidebar background */
  --sent-bubble: #1a6b54;   /* Sent message color */
  --received-bubble: #1e293b; /* Received message color */
}
```


