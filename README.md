# Spring Boot + Next.js Full-Stack Application

A modern, production-ready full-stack application with Spring Boot backend and Next.js frontend.

## 🚀 Features

### Security
- ✅ **HTTP-only Cookies**: JWT tokens stored securely, never exposed to client-side JavaScript
- ✅ **Server-side API Calls**: All authenticated requests go through Next.js API routes
- ✅ **XSS Protection**: Tokens are inaccessible to malicious scripts
- ✅ **CSRF Protection**: SameSite cookie attribute prevents cross-site attacks
- ✅ **Production-grade Authentication**: Secure user registration and login

### UI/UX
- 🎨 **Beautiful Modern Design**: Tailwind CSS with gradient backgrounds
- 🌓 **Dark Mode Support**: Automatic dark mode based on system preferences
- 📱 **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- ⚡ **Fast & Optimized**: Next.js 16 with React 19
- 🎯 **User-friendly Forms**: Clear validation and error messages

### Backend Integration
All Spring Boot API endpoints are integrated:
- `POST /landingPage/register` - User registration
- `POST /landingPage/login` - User authentication
- `GET /landingPage/guest` - Public guest access
- `GET /hello` - Protected authenticated endpoint
- `GET /` - Root endpoint
- OAuth2 Google authentication support
- OAuth2 GitHub authentication support

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.4** (App Router)
- **React 19.2.3**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Server Components & Client Components**

### Backend
- **Spring Boot** (your existing backend)
- **Spring Security** with JWT
- **OAuth2** for Google authentication

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Spring Boot backend running on `http://localhost:8080`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
