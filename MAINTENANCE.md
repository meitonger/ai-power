# 🔧 Maintenance & Troubleshooting Guide

This guide covers common maintenance tasks and troubleshooting steps for AI Power.

---

## Regular Maintenance Tasks

### Daily Tasks

**Check Application Health**
```bash
# Check if services are running
curl http://localhost:3001/api/health
curl http://localhost:3000

# With PM2
pm2 status

# With Docker
docker-compose ps
```

**Monitor Logs**
```bash
# View recent errors
tail -100 logs/api-error.log
tail -100 logs/web-error.log

# Follow logs in real-time
tail -f logs/api.log
tail -f logs/web.log
```

### Weekly Tasks

**Review Performance**
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check PM2 logs
pm2 logs --lines 200
```

**Database Maintenance**
```bash
cd apps/api

# Check database size
du -sh prisma/dev.db  # SQLite
# or for PostgreSQL:
psql -U aipower -d aipower -c "SELECT pg_size_pretty(pg_database_size('aipower'));"

# Backup database (PostgreSQL)
pg_dump -U aipower aipower > backup_$(date +%Y%m%d).sql
```

### Monthly Tasks

**Update Dependencies**
```bash
# Check for outdated packages
cd apps/api && npm outdated
cd apps/web && npm outdated

# Update packages (carefully)
npm update

# For major version updates, review changelogs first
```

**Review Security**
```bash
# Check for security vulnerabilities
cd apps/api && npm audit
cd apps/web && npm audit

# Fix automatically (review changes)
npm audit fix
```

**Clean Up**
```bash
# Remove old log files (older than 30 days)
find logs/ -name "*.log" -mtime +30 -delete

# Clean up old backups (older than 90 days)
find backups/ -name "*.sql" -mtime +90 -delete

# Clear npm cache
npm cache clean --force
```

---

## Common Issues & Solutions

### Issue: API Won't Start

**Symptoms:**
- API server fails to start
- Port already in use error

**Solutions:**

1. **Check if port is in use:**
```bash
lsof -i :3001
# Kill the process using the port
kill -9 <PID>
```

2. **Check environment variables:**
```bash
cat apps/api/.env
# Ensure DATABASE_URL and other required vars are set
```

3. **Check database connection:**
```bash
cd apps/api
npx prisma db push
```

4. **Reinstall dependencies:**
```bash
cd apps/api
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: Database Connection Failed

**Symptoms:**
- Cannot connect to database
- Prisma client errors

**Solutions:**

1. **For SQLite (Development):**
```bash
cd apps/api
# Check if database file exists
ls -la prisma/dev.db

# Regenerate database
npx prisma migrate reset
npx prisma generate
```

2. **For PostgreSQL (Production):**
```bash
# Test connection
psql -U aipower -d aipower -c "SELECT 1;"

# Check DATABASE_URL format:
# postgresql://username:password@host:5432/database?schema=public
```

3. **Regenerate Prisma Client:**
```bash
cd apps/api
npx prisma generate
npm restart
```

---

### Issue: Web App Shows API Connection Error

**Symptoms:**
- "Failed to fetch" errors
- API calls timeout

**Solutions:**

1. **Check API is running:**
```bash
curl http://localhost:3001/api/health
```

2. **Check environment variables:**
```bash
# In apps/web/.env.local
cat apps/web/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Check CORS settings:**
```bash
# In apps/api/.env
cat apps/api/.env
# ALLOWED_ORIGINS should include web URL
```

4. **Check network:**
```bash
# Test API from web server
curl -v http://localhost:3001/api/health
```

---

### Issue: Email Notifications Not Sending

**Symptoms:**
- Users not receiving appointment confirmations
- Email errors in logs

**Solutions:**

1. **Check SMTP configuration:**
```bash
cat apps/api/.env | grep SMTP
```

2. **Test email sending:**
```bash
# Use a test endpoint or check logs
tail -f logs/api.log | grep email
```

3. **Common SMTP issues:**

**Gmail:**
- Use App Password, not regular password
- Enable "Less secure app access" or use OAuth2

**Other providers:**
- Check SMTP_PORT (usually 587 for TLS, 465 for SSL)
- Verify SMTP_USER and SMTP_PASS are correct
- Check firewall allows outbound SMTP

---

### Issue: High Memory Usage

**Symptoms:**
- Server running slowly
- Out of memory errors

**Solutions:**

1. **Check memory usage:**
```bash
free -h
pm2 monit  # If using PM2
docker stats  # If using Docker
```

2. **Restart services:**
```bash
# PM2
pm2 restart all

# Docker
docker-compose restart

# Manual
pkill -f "node" && ./start-prod.sh
```

3. **Increase memory limits:**
```bash
# In ecosystem.config.js (PM2)
max_memory_restart: '1G'  # Increase this value

# For Docker, edit docker-compose.yml:
services:
  api:
    deploy:
      resources:
        limits:
          memory: 1G
```

---

### Issue: Slow Performance

**Symptoms:**
- Pages load slowly
- API responses slow

**Solutions:**

1. **Check database performance:**
```bash
cd apps/api
# Open Prisma Studio to inspect data
npx prisma studio

# Check for slow queries in logs
tail -1000 logs/api.log | grep -i "slow"
```

2. **Optimize database:**
```bash
# PostgreSQL: Run VACUUM
psql -U aipower -d aipower -c "VACUUM ANALYZE;"

# Check indexes
# Review apps/api/prisma/schema.prisma for @@index
```

3. **Check for large log files:**
```bash
du -sh logs/*
# Rotate logs if too large
```

4. **Enable production mode:**
```bash
# Ensure NODE_ENV=production in all .env files
cat apps/api/.env | grep NODE_ENV
cat apps/web/.env.local | grep NODE_ENV
```

---

## Database Operations

### Backup Database

**PostgreSQL:**
```bash
# Full backup
pg_dump -U aipower aipower > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -U aipower aipower | gzip > backup_$(date +%Y%m%d).sql.gz

# With Docker
docker exec aipower-db pg_dump -U aipower aipower > backup.sql
```

**SQLite (Development):**
```bash
cp apps/api/prisma/dev.db backups/dev_$(date +%Y%m%d).db
```

### Restore Database

**PostgreSQL:**
```bash
# Drop and recreate database (CAREFUL!)
psql -U aipower -c "DROP DATABASE IF EXISTS aipower;"
psql -U aipower -c "CREATE DATABASE aipower;"

# Restore from backup
psql -U aipower aipower < backup.sql

# With Docker
cat backup.sql | docker exec -i aipower-db psql -U aipower aipower
```

### Database Migrations

**Create new migration:**
```bash
cd apps/api
# Edit prisma/schema.prisma first
npx prisma migrate dev --name descriptive_name
```

**Apply migrations (production):**
```bash
cd apps/api
npx prisma migrate deploy
```

**Reset database (DEVELOPMENT ONLY):**
```bash
cd apps/api
npx prisma migrate reset  # This deletes all data!
npm run db:seed  # Reseed if needed
```

---

## Process Management

### Using PM2

**Start:**
```bash
pm2 start ecosystem.config.js
```

**Stop:**
```bash
pm2 stop all
# or specific app
pm2 stop aipower-api
```

**Restart:**
```bash
pm2 restart all
# or specific app
pm2 restart aipower-api
```

**View logs:**
```bash
pm2 logs
pm2 logs aipower-api --lines 200
```

**Monitor:**
```bash
pm2 monit
```

**Save configuration:**
```bash
pm2 save
pm2 startup  # Enable auto-start on boot
```

### Using Docker

**Start:**
```bash
docker-compose up -d
```

**Stop:**
```bash
docker-compose stop
```

**Restart:**
```bash
docker-compose restart
# or specific service
docker-compose restart api
```

**View logs:**
```bash
docker-compose logs -f
docker-compose logs -f api
```

**Rebuild after code changes:**
```bash
docker-compose up -d --build
```

---

## Monitoring Commands

**System Resources:**
```bash
# CPU and Memory
top
htop  # If installed

# Disk space
df -h

# Disk I/O
iostat  # If installed
```

**Application Status:**
```bash
# Check if services are responding
curl -I http://localhost:3001/api/health
curl -I http://localhost:3000

# Check process status
ps aux | grep node

# Check ports
netstat -tuln | grep -E '3000|3001'
```

**Database:**
```bash
# PostgreSQL connections
psql -U aipower -d aipower -c "SELECT count(*) FROM pg_stat_activity;"

# PostgreSQL database size
psql -U aipower -d aipower -c "SELECT pg_size_pretty(pg_database_size('aipower'));"
```

---

## Log Management

**View logs:**
```bash
# Recent errors
tail -100 logs/api-error.log
tail -100 logs/web-error.log

# Follow in real-time
tail -f logs/api.log

# Search for specific error
grep -i "error" logs/api.log | tail -50
```

**Rotate logs:**
```bash
# Create log rotation script
cat > rotate-logs.sh << 'EOF'
#!/bin/bash
mv logs/api.log logs/api.log.$(date +%Y%m%d)
mv logs/web.log logs/web.log.$(date +%Y%m%d)
pm2 restart all  # or docker-compose restart
gzip logs/*.log.* 2>/dev/null
EOF

chmod +x rotate-logs.sh
```

**Clean old logs:**
```bash
# Delete logs older than 30 days
find logs/ -name "*.log.*" -mtime +30 -delete
```

---

## Security Checks

**Check for exposed secrets:**
```bash
# Ensure .env files are not in git
git status | grep .env  # Should be empty

# Check .gitignore
cat .gitignore | grep .env
```

**Update SSL certificates:**
```bash
# With Let's Encrypt/Certbot
sudo certbot renew
sudo systemctl reload nginx
```

**Check for updates:**
```bash
# Security vulnerabilities
cd apps/api && npm audit
cd apps/web && npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Performance Optimization

**Clear caches:**
```bash
# npm cache
npm cache clean --force

# Next.js cache
cd apps/web
rm -rf .next/cache
```

**Optimize database:**
```bash
# PostgreSQL
psql -U aipower -d aipower -c "VACUUM ANALYZE;"
psql -U aipower -d aipower -c "REINDEX DATABASE aipower;"
```

**Check slow queries:**
```bash
# Enable slow query logging in PostgreSQL
# Edit postgresql.conf:
# log_min_duration_statement = 1000  # Log queries > 1 second
```

---

## Emergency Procedures

### Complete System Restart

```bash
# Stop everything
pm2 stop all  # or: docker-compose down

# Clear caches
rm -rf apps/api/node_modules/.cache
rm -rf apps/web/.next

# Restart
pm2 start ecosystem.config.js  # or: docker-compose up -d
```

### Rollback to Previous Version

```bash
# If using git
git log --oneline -10  # Find commit to rollback to
git checkout <commit-hash>

# Rebuild
cd apps/api && npm install && npm run build
cd apps/web && npm install && npm run build

# Restart
pm2 restart all
```

### Database Disaster Recovery

```bash
# Restore from last good backup
psql -U aipower -c "DROP DATABASE IF EXISTS aipower;"
psql -U aipower -c "CREATE DATABASE aipower;"
psql -U aipower aipower < /path/to/last/backup.sql

# Restart application
pm2 restart all
```

---

## Getting Help

1. **Check logs first**: Most issues show up in logs
2. **Review documentation**: [README.md](./README.md), [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Search for error messages**: Copy exact error and search
4. **Check service status**: Ensure all services are running
5. **Test connections**: API → Database, Web → API

---

## Useful Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Remember: Always backup before making changes! 💾**
