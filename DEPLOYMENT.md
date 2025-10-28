# 🚀 Deployment Guide - AI Power Mobile Tire Service

This guide covers different ways to deploy your application to production.

---

## Table of Contents

1. [Quick Start (Local Development)](#quick-start-local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment Options](#cloud-deployment-options)
4. [Production Checklist](#production-checklist)

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git

### Setup Steps

```bash
# 1. Clone and navigate to project
cd /workspace

# 2. Run setup script (installs dependencies, creates .env files)
chmod +x setup.sh
./setup.sh

# 3. Configure your environment variables
# Edit these files with your settings:
nano apps/api/.env
nano apps/web/.env.local

# 4. Start development servers
chmod +x start-dev.sh
./start-dev.sh

# Or start manually in separate terminals:
# Terminal 1 - API
cd apps/api && npm run dev

# Terminal 2 - Web
cd apps/web && npm run dev
```

### Access Your Application
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001/api
- **GraphQL Playground**: http://localhost:3001/api/graphql

---

## Docker Deployment

Docker provides an easy way to deploy with all dependencies included.

### Prerequisites
- Docker 20+ installed
- Docker Compose installed

### Setup

```bash
# 1. Create environment file
cp .env.docker.example .env
nano .env  # Edit with your settings

# 2. Build and start containers
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop containers
docker-compose down
```

### Docker Commands

```bash
# Rebuild after code changes
docker-compose up -d --build

# View container status
docker-compose ps

# Access API container
docker exec -it aipower-api sh

# Database backup
docker exec aipower-db pg_dump -U aipower aipower > backup.sql

# Database restore
cat backup.sql | docker exec -i aipower-db psql -U aipower aipower
```

---

## Cloud Deployment Options

### Option 1: DigitalOcean App Platform

**Best for**: Easy deployment with minimal configuration

1. **Create Account**: Sign up at [DigitalOcean](https://www.digitalocean.com)

2. **Create Database**:
   - Go to Databases → Create Database
   - Choose PostgreSQL 15
   - Copy connection string

3. **Deploy API**:
   - Go to App Platform → Create App
   - Connect your Git repository
   - Select `apps/api` folder
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Run Command: `npx prisma migrate deploy && npm start`
   - Add environment variables from `.env.example`
   - Set DATABASE_URL to your PostgreSQL connection string

4. **Deploy Web**:
   - Create another app for Web
   - Select `apps/web` folder
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - Add NEXT_PUBLIC_API_URL pointing to your API URL

**Cost**: ~$12-25/month for both apps + database

---

### Option 2: AWS (EC2 + RDS)

**Best for**: Full control and scalability

1. **Setup RDS Database**:
   ```bash
   # Create PostgreSQL RDS instance
   # Copy endpoint URL
   ```

2. **Launch EC2 Instance**:
   ```bash
   # Ubuntu 22.04 LTS recommended
   # t3.medium or larger
   
   # SSH into instance
   ssh -i your-key.pem ubuntu@your-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Clone your repository
   git clone your-repo-url
   cd your-repo
   
   # Setup
   ./setup.sh
   
   # Configure .env files with production settings
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Setup Nginx Reverse Proxy**:
   ```bash
   sudo apt-get install nginx
   
   # Configure nginx (see below for config)
   sudo nano /etc/nginx/sites-available/aipower
   ```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Web App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Cost**: ~$30-100/month depending on instance size

---

### Option 3: Vercel (Web) + Railway (API)

**Best for**: Fastest deployment, great for startups

**Deploy Web to Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel

# Add environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=your-api-url
```

**Deploy API to Railway**:
1. Go to [Railway](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub (select apps/api folder)
5. Add environment variables
6. Railway auto-detects and deploys

**Cost**: 
- Vercel: Free for hobby projects
- Railway: ~$5-20/month

---

### Option 4: Heroku

**Best for**: Simple deployment

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create apps
heroku create aipower-api
heroku create aipower-web

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini -a aipower-api

# Deploy API
cd apps/api
git subtree push --prefix apps/api heroku-api main

# Deploy Web
cd apps/web
git subtree push --prefix apps/web heroku-web main

# Set environment variables
heroku config:set ALLOWED_ORIGINS=https://aipower-web.herokuapp.com -a aipower-api
```

**Cost**: ~$14-28/month

---

## Production Checklist

Before going live, ensure you've completed:

### Security
- [ ] Changed all default passwords and secrets
- [ ] Generated strong JWT_SECRET and SESSION_SECRET
- [ ] Configured HTTPS/SSL certificates
- [ ] Set proper CORS origins (remove localhost)
- [ ] Enabled rate limiting
- [ ] Set up firewall rules

### Database
- [ ] Migrated to PostgreSQL (from SQLite)
- [ ] Set up automated backups
- [ ] Configured connection pooling
- [ ] Added database monitoring

### Environment
- [ ] Set NODE_ENV=production
- [ ] Configured proper logging
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configured environment variables for production

### Email
- [ ] Set up SMTP credentials
- [ ] Tested email sending
- [ ] Configured proper "from" address
- [ ] Set up email templates

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure application monitoring
- [ ] Set up log aggregation
- [ ] Add performance monitoring

### Testing
- [ ] Tested user registration/login
- [ ] Tested appointment creation
- [ ] Tested admin functions
- [ ] Tested on mobile devices
- [ ] Load tested API endpoints

### DNS & Domain
- [ ] Registered domain name
- [ ] Configured DNS records
- [ ] Set up SSL certificate
- [ ] Configured redirects (www → non-www)

---

## Troubleshooting

### API won't start
```bash
# Check logs
cd apps/api && npm run dev

# Common issues:
# 1. Database connection - check DATABASE_URL
# 2. Port in use - change PORT in .env
# 3. Missing dependencies - run npm install
```

### Database migration errors
```bash
# Reset database (DEVELOPMENT ONLY)
cd apps/api
rm prisma/dev.db
npx prisma migrate reset

# For production, use:
npx prisma migrate deploy
```

### CORS errors
```bash
# Update ALLOWED_ORIGINS in apps/api/.env
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## Support

For issues or questions:
1. Check logs: `tail -f logs/api.log` or `tail -f logs/web.log`
2. Review environment variables
3. Ensure all services are running
4. Check database connectivity

---

## Next Steps

After deployment:
1. Create admin user account
2. Set up your service area and pricing
3. Configure email notifications
4. Test complete user flow
5. Train your team on the admin panel
6. Launch marketing site
7. Monitor performance and errors
