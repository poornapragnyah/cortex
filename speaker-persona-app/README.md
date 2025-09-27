# Speaker Persona App

A modern, clean, and user-friendly web application inspired by CRED's design philosophy. This app allows speakers to submit and manage conference sessions, while enabling event managers to review submissions and build event agendas.

## 🎨 Design Philosophy

- **Minimalist & Clean**: Uncluttered design focused on typography and content
- **Generous Whitespace**: Ample padding and margins for better readability
- **CRED-inspired**: Monochromatic color scheme with purple accent color
- **Mobile-first**: Fully responsive design that works on all devices
- **Inter Font**: Clean, modern typography using Google Fonts

## 🚀 Features

### For Speakers
- ✅ **Authentication**: Secure login and registration with Supabase Auth
- ✅ **Speaker Dashboard**: Overview of submitted sessions with status tracking
- ✅ **Session Management**: Submit and edit session proposals
- ✅ **Event Tools**: QR codes for check-in and t-shirt collection
- ✅ **Agenda View**: Read-only view of the published event agenda
- 📝 **Profile Management**: Comprehensive speaker profiles with all required fields

### For Event Managers (Future Implementation)
- 🔄 **Session Review**: Review and approve/reject speaker submissions
- 🔄 **Agenda Builder**: Drag-and-drop interface for building event schedules
- 🔄 **Communication Tools**: Bulk email capabilities for speaker management

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom CRED-inspired theme
- **UI Components**: Shadcn/UI components
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router DOM
- **State Management**: React Context (useAuth hook)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd speaker-persona-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Set up the database schema (see `DATABASE_SCHEMA.md`)

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

Please refer to `DATABASE_SCHEMA.md` for detailed database setup instructions including:
- Required tables and relationships
- Row Level Security (RLS) policies
- SQL commands to run in Supabase

## 🎯 Key Components

### Authentication System
- `useAuth` hook for managing authentication state
- Protected routes with automatic redirects
- Session persistence across browser refreshes

### Speaker Dashboard
- Session status tracking with colored badges
- Quick actions for session submission
- Statistics cards showing submission counts

### Session Form
- Comprehensive form with all required fields
- Support for co-speakers and additional details
- Edit functionality for submitted sessions

### UI Components
- Custom Shadcn/UI components with CRED styling
- Reusable card, button, input, and label components
- Consistent color palette and spacing

## 🎨 Design System

### Colors
```javascript
primary: {
  50: '#f3f4f6',   // Light grays
  800: '#0f172a',  // Dark text
  // ... full palette
},
accent: {
  700: '#6B46C1',  // Purple accent
  // ... full palette
}
```

### Components
- `.btn-primary`: Primary action buttons with purple background
- `.btn-secondary`: Secondary buttons with white background and borders
- `.card`: Container components with subtle shadows
- `.status-badge`: Colored badges for session status

## 📱 Responsive Design

The app is built with a mobile-first approach:
- Mobile (320px+): Single column layouts
- Tablet (768px+): Two-column layouts where appropriate
- Desktop (1024px+): Multi-column layouts with expanded spacing

## 🔐 Security

- Row Level Security (RLS) enabled on all database tables
- Users can only access their own data
- Protected routes prevent unauthorized access
- Secure authentication with Supabase Auth

## 🚦 Session Status Workflow

1. **Submitted**: Initial status when speaker submits a session
2. **Approved**: Session accepted for the event
3. **Rejected**: Session not accepted
4. **On Hold**: Session under review or waitlisted

## 📋 Speaker Registration Fields

- **Basic Info**: Name, email, password, mobile number
- **Professional**: Company, job title, bio, social links
- **Event Details**: T-shirt size, food preferences, special requirements
- **Session Preferences**: Preferred track and session category
- **Emergency Contact**: For safety during the event

## 🎯 Session Submission Fields

- **Basic**: Title, abstract, category, track
- **Details**: Duration, audience level, learning outcomes
- **Co-speaker**: Optional co-presenter information
- **Technical**: Requirements, target audience, notes

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Project Structure
```
src/
├── components/
│   └── ui/           # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
├── pages/            # Route components
└── assets/           # Static assets
```

## 🔄 Future Enhancements

1. **Event Manager Dashboard**
   - Session review interface
   - Drag-and-drop agenda builder
   - Speaker communication tools

2. **Advanced Features**
   - Real-time notifications
   - Document upload capabilities
   - Session feedback and ratings
   - Multi-language support

3. **Analytics**
   - Speaker dashboard analytics
   - Session submission trends
   - Event attendance tracking

## 📞 Support

For questions or issues, please refer to:
- Database schema documentation in `DATABASE_SCHEMA.md`
- Component documentation in the source code
- Supabase documentation for backend setup

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using React, Tailwind CSS, and Supabase+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
