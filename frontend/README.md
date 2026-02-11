
# School Management System — Frontend

This is a **Next.js** application built using `create-next-app`.
It powers the School Management System dashboard and connects to the backend API for authentication, student management, staff management, and more.

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

---

### 2️⃣ Configure Environment Variables

Before running the project, create a `.env` file in the root of the frontend project.

Example:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NODE_ENV=development
```

### Required Environment Variables

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | The base URL where the frontend is running       |
| `NEXT_PUBLIC_API_URL`  | The base URL of your backend API                 |
| `NODE_ENV`             | Environment mode (`development` or `production`) |

If your backend runs on another port or domain, update `NEXT_PUBLIC_API_URL` accordingly.

⚠️ Important: Restart the development server after modifying environment variables.

---

### 3️⃣ Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

The application will automatically reload as you edit files.

---

## 🛠 Project Structure

* `app/` — Application routes and layouts
* `components/` — Reusable UI components
* `public/` — Static assets
* `globals.css` — Global styles
* `.env` — Environment configuration

---

## 🌐 Production Build

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

---

## 📦 Deployment

This project can be deployed on:

* Vercel
* Netlify
* AWS
* Any Node.js hosting environment

Make sure to configure all required environment variables in your hosting provider’s dashboard before deployment.

---

## 📘 Learn More

To learn more about Next.js, visit:

* [https://nextjs.org/docs](https://nextjs.org/docs)
* [https://nextjs.org/learn](https://nextjs.org/learn)

