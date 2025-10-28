# ⚡ Quick Start - 5 Minute Setup

Get AI Power running on your machine in 5 minutes or less!

---

## Step 1: Check Prerequisites (30 seconds)

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

Don't have Node.js? [Download here](https://nodejs.org/)

---

## Step 2: Install Everything (2 minutes)

```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

This installs all dependencies and sets up the database.

---

## Step 3: Configure (1 minute)

**Quick config for development:**

The setup created `.env` files for you. For a quick start, you can use the defaults!

Optional: Edit these files if you want to customize:
- `apps/api/.env` - API configuration
- `apps/web/.env.local` - Web configuration

---

## Step 4: Start Servers (30 seconds)

```bash
# Start both API and Web servers
chmod +x start-dev.sh
./start-dev.sh
```

---

## Step 5: Open Your Browser (30 seconds)

Go to: **http://localhost:3000**

You should see your application running! 🎉

---

## What's Next?

### Test the Application

1. **Register** a new user account
2. **Add a vehicle** to your profile
3. **Book an appointment**
4. **Login as admin** to see the dashboard

### Learn More

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to production
- **[README.md](./README.md)** - Full documentation

---

## Troubleshooting

### Ports Already in Use?

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001

# Kill processes if needed
kill -9 <PID>
```

### Setup Failed?

```bash
# Try manual setup
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

### Still Having Issues?

Check the detailed guide: [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## Useful Commands

```bash
# View logs
tail -f logs/api.log
tail -f logs/web.log

# Stop servers
# Press Ctrl+C in the terminal running start-dev.sh

# Reset database (dev only)
cd apps/api
npx prisma migrate reset
```

---

## Success! 🚀

Your application is now running at:
- **Web**: http://localhost:3000
- **API**: http://localhost:3001/api
- **GraphQL**: http://localhost:3001/api/graphql

Start building your mobile tire service business! 💪
