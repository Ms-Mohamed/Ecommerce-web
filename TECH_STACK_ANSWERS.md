# GoCart Project - Technical Stack Answers

Based on the project analysis, here are the answers to the technical questions:

## 1. Primary Web Stack

### Frontend
- **Next.js 15.3.5** - React-based full-stack framework
- **React 19.0.0** - UI library
- **React DOM 19.0.0** - DOM rendering
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS processing

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Node.js** - JavaScript runtime environment

### Authentication
- **NextAuth.js 4.24.11** - Authentication framework
- **@next-auth/prisma-adapter 1.0.7** - Prisma adapter for NextAuth
- **bcryptjs 3.0.2** - Password hashing

---

## 2. Frameworks/Libraries

### UI & Icons
- **Lucide React 0.525.0** - Icon library
- **React Hot Toast 2.5.2** - Toast notifications

### State Management
- **Redux Toolkit 2.8.2** - State management
- **React Redux 9.2.0** - React bindings for Redux

### Payment Processing
- **Stripe 19.1.0** - Payment gateway
- **@stripe/stripe-js 8.0.0** - Stripe JavaScript SDK
- **@stripe/react-stripe-js 5.2.0** - React components for Stripe

### Data Visualization
- **Recharts 3.1.2** - Charting library for analytics

### Utilities
- **date-fns 4.1.0** - Date manipulation library
- **node-fetch 3.3.2** - HTTP client
- **multer 2.0.2** - File upload middleware

---

## 3. Databases

### Primary Database
- **PostgreSQL** - Relational database (configured via Prisma)

### ORM & Database Tools
- **Prisma 6.17.0** - Next-generation ORM
- **@prisma/client 6.17.0** - Prisma Client for database access

### Database Models (from schema.prisma)
- **User** - User accounts and authentication
- **Store** - Multi-vendor store information
- **Product** - Product catalog
- **Category** - Product categorization
- **Cart** - Shopping cart items
- **Order** - Order management
- **OrderItem** - Order line items
- **Address** - User shipping addresses
- **Rating** - Product ratings and reviews
- **Coupon** - Discount coupon system
- **CouponUsage** - Coupon usage tracking
- **StockInfo** - Inventory management
- **StockMovement** - Stock movement tracking

### Database Features
- Connection pooling configured
- Strategic indexes on frequently queried columns
- Query optimization with selective field fetching
- Support for both DATABASE_URL and DIRECT_URL

---

## 4. Programming Languages

### Primary Language
- **JavaScript** - Main programming language
- **JSX** - React component syntax

### Configuration Files
- **JSON** - Package configuration, data structures
- **Markdown** - Documentation files

### Build & Config
- **ECMAScript Modules (ESM)** - Modern JavaScript modules
- **TypeScript types** - Type definitions via @types packages

---

## 5. Tools & Version Control

### Build Tools
- **Next.js Build System** - Production builds
- **Webpack** - Module bundling (configured in next.config.mjs)
- **Turbopack** - Fast bundler (used in dev mode)

### Development Tools
- **npm** - Package manager
- **Node.js** - Runtime environment

### Code Quality
- **ESLint** - Code linting (via next lint)

### Performance Tools
- **Bundle Analyzer** - Bundle size analysis (ANALYZE=true)
- **Performance Monitoring** - Custom performance utilities

### Version Control
- **Git** - Version control system (implied by GitHub references in README)

### Scripts Available
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting
- `npm run optimize-db` - Database optimization
- `npm run analyze` - Bundle analysis
- `npm run perf` - Performance testing

---

## 6. Core Focus

### Primary Application Type
**Multi-Vendor E-Commerce Platform** - GoCart is an open-source e-commerce solution that enables multiple vendors to sell products on a single platform.

### Key Features
1. **Multi-Vendor Architecture**
   - Multiple vendors can register and manage their stores
   - Each vendor has their own dashboard
   - Vendor-specific product management

2. **Customer Storefront**
   - Product browsing and search
   - Shopping cart functionality
   - Order placement and tracking
   - Product ratings and reviews

3. **Admin Panel**
   - Vendor approval and management
   - Product oversight
   - Order management
   - Analytics and reporting
   - Category management
   - Coupon management
   - User management

4. **Vendor Dashboard**
   - Product management (add, edit, manage)
   - Order management
   - Sales analytics
   - Inventory management

5. **Payment Integration**
   - Stripe payment gateway
   - Cash on Delivery (COD) option

6. **Performance Optimizations**
   - Database query optimization
   - API response caching
   - React component optimization
   - Bundle splitting and code optimization

### Business Model
- Platform for multiple independent vendors
- Vendor store management
- Commission-based or marketplace model
- Customer-facing unified storefront

### Technical Focus Areas
- **Performance**: Optimized for fast page loads and efficient database queries
- **Scalability**: Multi-vendor architecture designed for growth
- **User Experience**: Responsive design with optimistic UI updates
- **Security**: Authentication, authorization, and secure payment processing
- **Maintainability**: Well-structured codebase with clear separation of concerns

---

## Summary

GoCart is a modern, full-stack e-commerce platform built with Next.js and React, using PostgreSQL as the database and Prisma as the ORM. It's designed as a multi-vendor marketplace where multiple sellers can operate their stores while customers shop from a unified interface. The project emphasizes performance optimization, scalability, and a great user experience for both vendors and customers.


f