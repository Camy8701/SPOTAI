
# UTOP-AI Blog — Full Rebuild in Lovable

## Overview
Rebuild the UTOP-AI Blog as a React + Vite application using Lovable Cloud (Supabase) for the backend. The app is an AI-focused blog/content platform with stories, news, quizzes, and a full admin dashboard.

---

## Phase 1: Foundation & Database Setup

### Database Schema
Set up the Supabase database with all core tables:
- **profiles** — user profiles linked to auth, with roles (admin, user)
- **blog_posts** — articles/stories with title, content, category, slug, featured image, status (draft/published), author
- **comments** — threaded comments on posts
- **likes** — user likes on posts and comments
- **saved_posts** — bookmarked/saved posts per user
- **activities** — user activity tracking
- **quiz_questions** & **quiz_results** — interactive quiz data
- **media** — media library entries for uploaded assets

### Authentication
- Email/password signup & login
- Google OAuth sign-in
- Role-based access (admin vs. regular user)
- User profile creation on signup via database trigger

### Storage
- Media bucket for blog images, user avatars, and uploaded content

---

## Phase 2: Public-Facing Pages

### Homepage
- Hero section with featured AI content
- Featured stories/collections grid (up to 6 cards)
- AI Tools showcase section
- Latest news preview
- Newsletter signup section
- Dark mode support

### AI Stories Section
- Story listing page with categories and filtering
- Individual story detail page with rich content display
- Reading progress tracking
- Like, comment, and save functionality

### News Section
- News article listing with categories
- Search and filtering
- Individual article pages

### Quiz Section
- Interactive AI quizzes and assessments
- Score tracking and results display
- Activity/progress tracking per user

### Collections
- Curated content collections page
- Browse stories grouped by themes/topics

### User Features
- User profile page with reading history
- Saved posts / bookmarks
- Comment system on posts
- Like/unlike functionality

---

## Phase 3: Admin Dashboard

### Dashboard Overview
- Analytics summary (post count, user count, engagement metrics)
- Recent activity feed

### Content Management
- Create, edit, and delete blog posts with a rich editor
- Draft/publish workflow
- Category and tag management
- Featured post selection

### Media Library
- Upload and manage images/media files
- Browse and select media for posts

### User Management
- View and manage registered users
- Assign admin roles

### Quiz Management
- Create and edit quiz questions
- View quiz results and statistics

---

## Phase 4: Layout & Design

### Navigation
- Responsive header with navigation links (Home, Stories, News, Quizzes, Collections)
- Mobile hamburger menu
- User avatar/auth menu in header
- Dark mode toggle

### Design Style
- Modern, clean design using shadcn/ui components
- Dark mode support throughout
- Responsive layout for mobile and desktop
- Consistent card-based content display

---

## Technical Approach
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase) for database, auth, storage, and edge functions
- **Routing**: React Router for all pages
- **State**: TanStack React Query for data fetching and caching
