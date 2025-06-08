<div align="center">
  <img src="./public/kaiboard-logo/Logo Kaiboard Transparent.svg" alt="Kaiboard Logo" width="200" height="200" />
  
  # Kaiboard v2 🚀
  
  **The Ultimate Team Collaboration & Meeting Management Platform**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.9.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
  [![Auth](https://img.shields.io/badge/NextAuth.js-5.0-purple?style=for-the-badge&logo=auth0)](https://next-auth.js.org/)

</div>

---

## ✨ **What is Kaiboard?**

Kaiboard is a modern, feature-rich team collaboration platform designed to streamline meetings, enhance productivity, and foster seamless communication across global teams. Built with cutting-edge web technologies, it offers an intuitive interface for managing meetings, tracking team activities, and collaborating in real-time.

---

## 🎯 **Key Features**

### 🏠 **Smart Dashboard**
- **Real-time Analytics**: Monitor team productivity and engagement metrics
- **Intuitive Overview**: Quick glance at upcoming meetings, team status, and key metrics
- **Beautiful Gradients**: Modern UI with smooth animations and responsive design
- **Activity Tracking**: See who's online and track last activity timestamps

### 📅 **Meeting Management**
- **Create & Schedule**: Easy meeting creation with rich text notes using TipTap editor
- **Calendar Integration**: Full calendar view with meeting scheduling
- **Meeting Notes**: Rich text editor with formatting, tables, images, and more
- **Time Zone Support**: Global team coordination with automatic timezone handling

### 👥 **Team Collaboration**
- **Multi-Team Support**: Organize users across different teams with role-based access
- **Role Management**: Admin, Member, and custom role assignments
- **Team Analytics**: Track team performance and collaboration metrics
- **Member Profiles**: Rich user profiles with avatars and activity status

### 🛡️ **Advanced Security & Admin**
- **Role-Based Access Control**: Granular permissions for different user roles  
- **Admin Dashboard**: Comprehensive admin panel for user and system management
- **Activity Logging**: Detailed audit trails and user activity monitoring
- **Secure Authentication**: NextAuth.js with multiple provider support

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark/Light Themes**: Built-in theme switching with system preference detection
- **Shadcn/UI Components**: Beautiful, accessible components with Radix UI primitives
- **Smooth Animations**: Framer Motion-powered transitions and micro-interactions

---

## 🛠️ **Tech Stack**

### **Frontend**
- **Framework**: Next.js 15.2.2 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: Shadcn/UI + Radix UI
- **Rich Text**: TipTap Editor
- **State Management**: React Hooks + Context

### **Backend & Database**
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js 5.0 (Beta)
- **API**: Next.js API Routes
- **File Upload**: Built-in file handling system
- **Middleware**: Custom request logging and auth middleware

### **Deployment & Tools**
- **Package Manager**: pnpm
- **Database Client**: Prisma Client with Accelerate
- **Linting**: ESLint + Prettier
- **Environment**: Node.js with TypeScript

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- PostgreSQL database

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Kaiboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your database URL, NextAuth secret, and other environment variables
   ```

4. **Database Setup**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   # Optional: Add sample data
   pnpm prisma db seed
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📱 **Screenshots**

<div align="center">
  <img src="./docs/screenshots/dashboard.png" alt="Dashboard" width="600" />
  <p><em>Modern dashboard with real-time analytics and team overview</em></p>
  
  <br />
  
  <img src="./docs/screenshots/meetings.png" alt="Meetings" width="600" />
  <p><em>Comprehensive meeting management with rich text notes</em></p>
</div>

---

## 🏗️ **Project Structure**

```
Kaiboard/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── calendar/          # Calendar views
│   ├── meetings/          # Meeting management
│   ├── settings/          # User settings
│   └── teams/             # Team management
├── components/            # Reusable UI components
│   ├── admin/             # Admin-specific components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── meetings/          # Meeting components
│   ├── settings/          # Settings components
│   ├── teams/             # Team components
│   └── ui/                # Base UI components (Shadcn)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details on how to get started.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 **Support**

- 📧 **Email**: support@kaiboard.com
- 💬 **Discord**: [Join our community](https://discord.gg/kaiboard)
- 📖 **Documentation**: [docs.kaiboard.com](https://docs.kaiboard.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/kaiboard/kaiboard/issues)

---

## 🙏 **Acknowledgments**

- [Next.js](https://nextjs.org/) - The React framework for production
- [Shadcn/UI](https://ui.shadcn.com/) - Beautiful and accessible component library
- [Prisma](https://prisma.io/) - Next-generation ORM for Node.js and TypeScript
- [TipTap](https://tiptap.dev/) - The headless editor framework
- [Radix UI](https://radix-ui.com/) - Low-level UI primitives

---

<div align="center">
  <p>Built with ❤️ by the Kaiboard Team</p>
  <p>⭐ Star us on GitHub if you like this project!</p>
</div>
