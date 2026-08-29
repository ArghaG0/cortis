# PingUp

PingUp is a full-stack social media web application designed to connect users through real-time messaging, content sharing, and interactive stories. The platform features robust user authentication, a feed for multimedia posts, an ephemeral stories system, and a comprehensive connection (follow/friend) mechanism with background email notifications.

---

## 🛠 Tech Stack

### Frontend
- **Framework/Library:** React (v19)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router DOM
- **Authentication:** Clerk (`@clerk/clerk-react`)
- **API Client:** Axios
- **Utilities:** Moment.js (date/time formatting), Lucide React (icons), React Hot Toast (notifications)

### Backend
- **Runtime:** Node.js
- **Framework:** Express (v5)
- **Authentication:** Clerk Express SDK (`@clerk/express`)
- **Database Object Modeling:** Mongoose
- **File Uploads & Storage:** Multer (middleware), ImageKit (`imagekit` SDK)
- **Background Jobs/Functions:** Inngest (used for email event handling)
- **Emails:** Nodemailer (with Brevo SMTP)

### Database
- **Primary Database:** MongoDB

### Dev Tools / Build
- **Frontend Server/Bundler:** Vite
- **Backend Server:** Nodemon (for development auto-restarts)
- **Linting:** ESLint
- **Deployment Platform:** Vercel

---

## ✨ Features

Based on the implemented frontend components and backend routes, the application includes the following features:

- **User Authentication:** Secure login and registration powered by Clerk.
- **User Profiles:** Customizable profiles including full name, username, bio, location, profile picture, and cover photo.
- **Post Feed (Feed):** Ability to create and view posts. Posts can be `text`, `image`, or `text_with_image`. Users can also like posts.
- **Stories:** Ephemeral content sharing supporting `text`, `image`, and `video` formats. Stories track view counts and can have customizable background colors.
- **Connections & Following:**
  - Follow / Unfollow other users.
  - Send, accept, and manage connection requests (pending and accepted states).
  - Discover new users to connect with.
- **Real-time Messaging:** Direct user-to-user chat supporting both text and image messages, updated in real-time via Server-Sent Events (SSE). Includes a "Recent Messages" view.
- **Email Notifications:** Background processing (via Inngest) sends out email notifications when users receive connection requests.

---

## 📁 Folder/Project Structure

```text
PingUp/
├── client/                     # Frontend React (Vite) Application
│   ├── .env                    # Client environment variables
│   ├── package.json            # Client dependencies and scripts
│   ├── vercel.json             # Vercel deployment config for SPA routing
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── api/                # Axios configuration and API endpoints
│       ├── app/                # Redux store configuration
│       ├── assets/             # Static assets
│       ├── components/         # Reusable UI elements (PostCard, StoryModal, Sidebar, Notification, etc.)
│       ├── features/           # Redux slices
│       ├── pages/              # Main view components (Feed, Profile, ChatBox, Connections, Discover, CreatePost, Login, Messages)
│       └── main.jsx & App.jsx  # React application entry points
│
└── server/                     # Backend Express Application
    ├── .env                    # Server environment variables
    ├── package.json            # Server dependencies and scripts
    ├── server.js               # Express app entry point and route mounting
    ├── vercel.json             # Vercel serverless deployment config
    ├── configs/                # DB, ImageKit, Multer, and Nodemailer configurations
    ├── controllers/            # Request handling logic (message, post, story, user)
    ├── inngest/                # Background job functions (email notifications)
    ├── middleware/             # Authentication middleware (`protect`)
    ├── models/                 # Mongoose schemas (Connection, Message, Story, User, Post)
    └── routes/                 # Express route definitions
```

---

## 🔐 Environment Variables

The application relies on the following environment variables (values omitted for security):

| File | Variable Name | Purpose / Where it is used |
|------|---------------|----------------------------|
| `client/.env` | `VITE_CLERK_PUBLISHABLE_KEY` | Public key for Clerk authentication (`src/main.jsx`) |
| `client/.env` | `VITE_BASEURL` | Backend API URL for Axios and SSE connections (`src/api/axios.js`, `src/App.jsx`) |
| `server/.env` | `FRONTEND_URL` | Used to generate clickable links in Inngest email templates |
| `server/.env` | `MONGODB_URL` | Connection string for MongoDB (`server/configs/db.js`) |
| `server/.env` | `INNGEST_EVENT_KEY` | Key for triggering Inngest background events |
| `server/.env` | `INNGEST_SIGNING_KEY` | Key for verifying Inngest webhook requests |
| `server/.env` | `CLERK_PUBLISHABLE_KEY` | Public key for Clerk (Backend) |
| `server/.env` | `CLERK_SECRET_KEY` | Secret key for Clerk authentication middleware |
| `server/.env` | `IMAGEKIT_PUBLIC_KEY` | ImageKit public key (`server/configs/imagekit.js`) |
| `server/.env` | `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (`server/configs/imagekit.js`) |
| `server/.env` | `IMAGEKIT_URL_ENDPOINT` | ImageKit base URL (`server/configs/imagekit.js`) |
| `server/.env` | `SENDER_EMAIL` | "From" address for Nodemailer (`server/configs/nodemailer.js`) |
| `server/.env` | `SMTP_PASS` | SMTP password for email delivery |
| `server/.env` | `SMTP_USER` | SMTP username for email delivery |
| `server/.env` | `PORT` | (Optional) Backend server port (defaults to 4000 in `server.js`) |

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api`.

### User Routes (`/api/user`)
| Method | Path | Purpose | Authentication |
|--------|------|---------|----------------|
| `GET`  | `/data` | Fetch data for the currently authenticated user | Protected |
| `POST` | `/update` | Update user profile (bio, location) & upload profile/cover images | Protected |
| `POST` | `/discover` | Fetch a list of users to discover/follow | Protected |
| `POST` | `/follow` | Follow a specific user | Protected |
| `POST` | `/unfollow`| Unfollow a specific user | Protected |
| `POST` | `/connect` | Send a connection request to a user | Protected |
| `POST` | `/accept` | Accept a pending connection request | Protected |
| `GET`  | `/connections`| Get the current user's connections | Protected |
| `POST` | `/profile` | Fetch public profiles of specific users | Public (No middleware) |
| `GET`  | `/recent-messages` | Get a list of recent messaging threads for the user | Protected |

### Post Routes (`/api/post`)
| Method | Path | Purpose | Authentication |
|--------|------|---------|----------------|
| `POST` | `/add` | Create a new post (supports up to 4 image uploads) | Protected |
| `GET`  | `/feed` | Fetch the post feed for the user | Protected |
| `POST` | `/like` | Toggle like status on a specific post | Protected |

### Story Routes (`/api/story`)
| Method | Path | Purpose | Authentication |
|--------|------|---------|----------------|
| `POST` | `/create` | Upload and create a new story (text, image, or video) | Protected |
| `GET`  | `/get` | Retrieve active stories | Protected |

### Message Routes (`/api/message`)
| Method | Path | Purpose | Authentication |
|--------|------|---------|----------------|
| `GET`  | `/:userId` | Server-Sent Events (SSE) stream for real-time chat updates | Public (Stream) |
| `POST` | `/send` | Send a new message (text or image) to a user | Protected |
| `POST` | `/get` | Retrieve chat history with a specific user | Protected |

---

## 🗄 Database Schema

The application uses Mongoose to interact with MongoDB. Below are the implemented schemas:

### User
- `_id`: String, required (matches Clerk ID)
- `email`: String, required
- `full_name`: String, required
- `username`: String, unique
- `bio`: String, default: 'Hey there ! I am using PingUp.'
- `profile_picture`: String, default empty
- `cover_photo`: String, default empty
- `location`: String, default empty
- `followers`: Array of Strings (References to `User`)
- `following`: Array of Strings (References to `User`)
- `connections`: Array of Strings (References to `User`)
- *Timestamps enabled.*

### Post
- `user`: String, required (Reference to `User`)
- `content`: String
- `image_urls`: Array of Strings
- `post_type`: String, enum: `['text', 'image', 'text_with_image']`, required
- `likes_count`: Array of Strings (References to `User`)
- *Timestamps enabled.*

### Story
- `user`: String, required (Reference to `User`)
- `content`: String
- `media_url`: String
- `media_type`: String, enum: `['text', 'image', 'video']`
- `view_count`: Array of Strings (References to `User`)
- `background_color`: String
- *Timestamps enabled.*

### Message
- `from_user_id`: String, required (Reference to `User`)
- `to_user_id`: String, required (Reference to `User`)
- `text`: String, trimmed
- `message_type`: String, enum: `['text', 'image']`
- `media_url`: String
- `seen`: Boolean, default: false
- *Timestamps enabled.*

### Connection
- `from_user_id`: String, required (Reference to `User`)
- `to_user_id`: String, required (Reference to `User`)
- `status`: String, enum: `['pending', 'accepted']`, default: `'pending'`
- *Timestamps enabled.*

---

## 🚀 Setup & Installation

Follow these steps to set up the project locally:

1. **Clone the repository** (if applicable).
2. **Setup Server:**
   ```bash
   cd server
   npm install
   ```
   - Create a `.env` file in the `server` directory matching the variables listed above.
   - Start the backend server:
   ```bash
   npm run server
   ```

3. **Setup Client:**
   Open a new terminal window:
   ```bash
   cd client
   npm install
   ```
   - Create a `.env` file in the `client` directory matching the variables listed above.
   - Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

### Client (`client/package.json`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the React application for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Locally previews the production build.

### Server (`server/package.json`)
- `npm run server`: Runs the backend server using Nodemon (auto-restarts on file changes).
- `npm start`: Runs the backend server using standard Node.js (intended for production).

---

## 🌍 Deployment

The application is configured for deployment on **Vercel**.

- **Frontend Configuration (`client/vercel.json`):** Contains rewrite rules mapping `/(.*)` to `/` to support React Router's client-side routing.
- **Backend Configuration (`server/vercel.json`):** Uses the `@vercel/node` builder. All API routes `/(.*)` are directed to `server.js` acting as a serverless function.

---

## ⚠️ Known Limitations / Notes

- **Public Endpoints:** The `GET /api/message/:userId` endpoint (used for SSE real-time updates) and `POST /api/user/profile` do not utilize the `protect` authentication middleware. This is common for SSE streams where passing auth headers can be challenging, but it may expose streaming data if not handled carefully within the controller logic.
- **Inngest Sync:** Background email notifications rely on Inngest. A local Inngest dev server may need to be running, or the app must be synced with an Inngest cloud account to successfully process email jobs.
