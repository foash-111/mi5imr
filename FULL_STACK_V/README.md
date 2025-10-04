# مخيمر (Mokhaimer) - Arabic Storytelling Platform

![Project Logo](https://img.shields.io/badge/Platform-Arabic%20Storytelling-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

## 📖 Overview

**مخيمر** is a comprehensive Arabic storytelling platform that serves as a literary and cultural hub for creative content in Arabic. The platform provides a space for writers and readers to connect, share stories, articles, poetry, and reflections while fostering creativity and expression.

### 🌟 Key Features

- **Multi-format Content Support**: Stories, articles, poetry, and philosophical reflections
- **User Authentication**: Google OAuth integration with NextAuth.js
- **Rich Text Editor**: TipTap-powered editor with Arabic language support
- **Content Management**: Admin dashboard for content moderation and analytics
- **Recommendation System**: Intelligent content suggestions based on user preferences
- **Responsive Design**: Optimized for desktop and mobile devices
- **Performance Optimized**: Advanced caching, image optimization, and code splitting

## 🚀 Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component library
- **TipTap** - Rich text editor
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Server-side API
- **MongoDB** - Primary database
- **NextAuth.js** - Authentication
- **Redis** - Caching layer
- **Nodemailer** - Email functionality

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Webpack** - Module bundling
- **Performance monitoring** - Lighthouse integration

## 📁 Project Structure

```
arabic-storytelling_Full_stack_version/
|
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── auth/              # Authentication pages
│   │   ├── books/             # Books section
│   │   ├── content/           # Content pages
│   │   ├── feed/              # Main content feed
│   │   └── ...
│   ├── backend/               # Backend utilities
│   │   ├── lib/               # Database and utility functions
│   │   └── models/            # TypeScript type definitions
│   ├── components/            # Reusable React components
│   ├── docs/                  # Documentation
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── public/                # Static assets
│   └── styles/                # Global styles
├── README.md                  # This file
└── ...
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB database

### Environment Variables
Create a `.env.local` file in the `arabic-storytelling_Full_stack_version` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/arabic-storytelling

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (optional)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# cloud for images hosting Integration (optional)
FAL_KEY=your-fal-ai-key
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arabic-storytelling_Full_stack_version
   ```

2. **Navigate to stable version**
   ```bash
   cd stable_version
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Troubleshooting

### OAuth Authentication Issues

If you encounter OAuth errors like `SIGNIN_OAUTH_ERROR` with `AggregateError`, this typically indicates network connectivity issues:

**Common Solutions:**

1. **Check Internet Connection**
   ```bash
   # Test connectivity to Google OAuth
   curl -I https://accounts.google.com
   ```

2. **Verify Environment Variables**
   ```bash
   # Ensure these are properly set in .env.local
   GOOGLE_CLIENT_ID=your-actual-client-id
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   ```

3. **Google Cloud Console Setup**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

4. **Firewall/Proxy Issues**
   ```bash
   # Check if you're behind a corporate firewall
   # Try running with different network
   ```

5. **DNS Resolution**
   ```bash
   # Test DNS resolution
   nslookup accounts.google.com
   ```

### Database Connection Issues

If MongoDB connection fails:

```bash
# Check if MongoDB is running
sudo systemctl status mongod
# or
brew services list | grep mongodb

# Test connection
mongosh mongodb://localhost:27017
```

## 📱 Available Pages & Features

### Public Pages
- **Home** (`/`) - Landing page with featured content
- **Content Feed** (`/feed`) - Main content browsing with filtering
- **Individual Content** (`/content/[slug]`) - Detailed content view
- **Books** (`/books`) - Book collection and library
- **About** (`/about`) - Author information
- **FAQ** (`/faq`) - Frequently asked questions
- **Contact** (`/contact`) - Contact form

### User Features
- **Authentication** - Google OAuth login
- **Content Interaction** - Like, comment, bookmark
- **Profile Management** - User profiles and preferences
- **Newsletter Subscription** - Email updates
- **Feedback System** - User feedback and reviews

### Admin Features
- **Dashboard** (`/admin/dashboard`) - Analytics and overview
- **Content Management** - Create, edit, delete content
- **User Management** - User administration
- **Analytics** - Performance metrics and insights

## 🎨 Design System

The platform uses a vintage-inspired design system optimized for Arabic content:

- **Typography**: Cairo font for Arabic text
- **Color Scheme**: Vintage paper and ink aesthetic
- **Layout**: RTL (Right-to-Left) optimized for Arabic
- **Responsive**: Mobile-first design approach

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size

# Performance
npm run performance  # Run Lighthouse audit
```

## 📊 Performance Features

- **Image Optimization**: WebP/AVIF formats with lazy loading
- **Code Splitting**: Route-based and component-based splitting
- **Caching**: MongoDB aggregation pipelines with Redis caching
- **Bundle Optimization**: Tree shaking and vendor chunking
- **Core Web Vitals**: Optimized for LCP, FID, and CLS metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Content Guidelines

The platform supports various content types:

- **Stories** - Fiction and creative writing
- **Articles** - Informational and educational content
- **Poetry** - Verse and literary works
- **Reflections** - Personal thoughts and philosophical content

All content should be in Arabic and follow community guidelines for respectful, creative expression.

## 🔒 Security

- **Authentication**: Secure OAuth implementation
- **Data Protection**: MongoDB with encryption
- **Input Validation**: Zod schema validation
- **CSP Headers**: Content Security Policy implementation
- **Rate Limiting**: API request throttling

## 📈 Analytics & Monitoring

- **User Analytics**: Content engagement metrics
- **Performance Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Application error monitoring
- **SEO Optimization**: Meta tags and structured data

## 🌐 Deployment

The platform is optimized for deployment on:

- **Vercel** (recommended for Next.js)

### Production Deployment Checklist

- [ ] Set up MongoDB Atlas or production MongoDB instance
- [ ] Configure environment variables
- [ ] Set up domain and SSL certificates
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

## 📞 Support

For support, feature requests, or bug reports:

- Create an issue in the repository
- Contact through the platform's contact form
- Email: [mr2221@fayoum.edu.eg]

## 🙏 Acknowledgments

- **Arabic Typography**: Cairo font by Google Fonts
- **UI Components**: Radix UI for accessible components
- **Rich Text Editing**: TipTap editor for content creation
- **Icons**: Lucide React for consistent iconography

---

**مخيمر** - Where stories come to life in Arabic ✨

*"منصة للقصص والحكايات والتأملات، حيث تجتمع الكلمات لتنسج عالماً من الخيال والمعرفة"*

*"A platform for stories, tales, and reflections, where words come together to weave a world of imagination and knowledge"*

