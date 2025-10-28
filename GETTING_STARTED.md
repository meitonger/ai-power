# 🎯 Getting Started - AI Power Mobile Tire Service

Welcome! This guide will help you get your mobile tire service application up and running.

---

## What is This Application?

**AI Power** is a complete mobile tire service management platform that includes:

- 🗓️ **Appointment Scheduling** - Customers can book appointments online
- 👤 **User Management** - Customer accounts and profiles
- 🚗 **Vehicle Tracking** - Store customer vehicle information
- 👨‍🔧 **Technician Management** - Assign jobs to your team
- 📱 **Admin Dashboard** - Manage everything from one place
- 📊 **GraphQL API** - Flexible API for future integrations
- 📧 **Email Notifications** - Automated appointment confirmations

---

## Quick Start (5 Minutes)

### 1. Prerequisites

Make sure you have installed:
- **Node.js** version 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

### 2. Install

```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

This will:
- Install all dependencies
- Create configuration files
- Set up the database
- Seed initial data

### 3. Configure

Edit the configuration files created for you:

**API Configuration** (`apps/api/.env`):
```env
# Most important settings:
DATABASE_URL="file:./prisma/dev.db"  # Keep this for development
PORT=3001
ALLOWED_ORIGINS="http://localhost:3000"

# Email settings (optional for now):
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Web Configuration** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="AI Power Mobile Tire Service"
```

### 4. Start

```bash
# Start both API and Web servers
chmod +x start-dev.sh
./start-dev.sh
```

Or start them manually in separate terminal windows:

**Terminal 1 - API Server:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Web Server:**
```bash
cd apps/web
npm run dev
```

### 5. Access

Open your browser and go to:
- **Application**: http://localhost:3000
- **API**: http://localhost:3001/api
- **GraphQL Playground**: http://localhost:3001/api/graphql

---

## First Time Setup

### Create Your First Admin User

You have a few options:

**Option 1: Use the seeded data**
If you ran `./setup.sh`, you should have test users created. Check the seed file:
```bash
cat apps/api/prisma/seed.ts
```

**Option 2: Create via API**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@aipower.com",
    "password": "SecurePassword123!",
    "role": "ADMIN",
    "phone": "555-123-4567"
  }'
```

**Option 3: Register through the web interface**
- Go to http://localhost:3000
- Click "Sign Up"
- Fill in your information
- Note: You may need to update the user role to ADMIN in the database

### Explore the Admin Dashboard

1. Login with your admin credentials
2. Navigate to the admin dashboard
3. Add technicians to your team
4. Configure service offerings
5. Test booking an appointment

---

## Understanding the Project Structure

```
/workspace
├── apps/
│   ├── api/              # NestJS Backend API
│   │   ├── src/
│   │   │   ├── main.ts   # API entry point
│   │   │   └── app.module.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Database schema
│   │   │   └── seed.ts          # Initial data
│   │   ├── appointments/        # Appointment management
│   │   ├── users/              # User management
│   │   └── vehicles/           # Vehicle management
│   │
│   └── web/              # Next.js Frontend
│       ├── pages/        # Route pages
│       │   ├── index.tsx        # Home page
│       │   ├── login.tsx        # Login page
│       │   ├── appointments/    # Booking pages
│       │   └── admin/           # Admin pages
│       ├── components/   # React components
│       └── lib/         # Utility functions
│
├── setup.sh             # Setup script
├── start-dev.sh         # Development start script
└── docker-compose.yml   # Docker configuration
```

---

## Common Tasks

### View Logs

```bash
# API logs
tail -f logs/api.log

# Web logs
tail -f logs/web.log
```

### Reset Database (Development Only)

```bash
cd apps/api
rm prisma/dev.db
npx prisma migrate reset
npm run db:seed
```

### Add a New Migration

```bash
cd apps/api

# Edit prisma/schema.prisma with your changes
# Then create migration:
npx prisma migrate dev --name your_migration_name
```

### Update Dependencies

```bash
# Update API dependencies
cd apps/api
npm update

# Update Web dependencies
cd apps/web
npm update
```

---

## Development Workflow

### Making Changes to the API

1. Edit files in `apps/api/src/`
2. The server will auto-reload (hot reload enabled)
3. Test your changes at http://localhost:3001/api

### Making Changes to the Web App

1. Edit files in `apps/web/`
2. The page will auto-refresh (Fast Refresh enabled)
3. View changes at http://localhost:3000

### Database Schema Changes

1. Edit `apps/api/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name change_name`
3. Prisma Client auto-regenerates

---

## Testing the Application

### Test User Flow

1. **Register**: Create a new user account
2. **Login**: Sign in with credentials
3. **Add Vehicle**: Add a vehicle to your profile
4. **Book Appointment**: Schedule a tire service
5. **Admin View**: Login as admin and view the appointment

### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Get all appointments (as admin)
curl http://localhost:3001/api/appointments

# GraphQL query
curl http://localhost:3001/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Database Locked Error

```bash
# SQLite database is locked - restart the API
cd apps/api
pkill -f "ts-node"
npm run dev
```

### Module Not Found Errors

```bash
# Reinstall dependencies
cd apps/api && rm -rf node_modules && npm install
cd apps/web && rm -rf node_modules && npm install
```

### Prisma Client Errors

```bash
cd apps/api
npx prisma generate
```

---

## Next Steps

### For Development

1. ✅ Customize the UI/UX in `apps/web/components/`
2. ✅ Add new features to the API in `apps/api/src/`
3. ✅ Modify the database schema in `apps/api/prisma/schema.prisma`
4. ✅ Add tests for your features

### For Production

1. 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options
2. ✅ Complete the [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
3. 🚀 Deploy to your chosen platform
4. 📊 Set up monitoring and alerts

---

## Learning Resources

### Technologies Used

- **Backend**: [NestJS](https://nestjs.com/) - Node.js framework
- **Frontend**: [Next.js](https://nextjs.org/) - React framework
- **Database**: [Prisma](https://www.prisma.io/) - Database ORM
- **GraphQL**: [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)

### Useful Commands

```bash
# API commands
cd apps/api
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database

# Web commands
cd apps/web
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter
```

---

## Getting Help

### Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-launch checklist

### Common Issues

Check the logs first:
```bash
tail -f logs/api.log
tail -f logs/web.log
```

### Support

- Review the codebase and comments
- Check NestJS and Next.js documentation
- Ensure all environment variables are set correctly

---

## Success! 🎉

You should now have a fully functional mobile tire service application running locally. 

Start customizing it to match your business needs and when ready, deploy it to production!

**Happy coding! 🚀**
