# 🚀 Vercel Hosting Setup Guide

## ✅ Current Status

### Local Development (Working ✅)
- **Backend Server**: Running on port 3101
- **Frontend Server**: Running on port 5174
- **Database**: Connected to Supabase ✅
- **Test URL**: http://localhost:5174

### Vercel Hosting (Needs Configuration ⚠️)
- **Repository**: https://github.com/montahaeidiii/map_It
- **Auto-Deploy**: Enabled (deploys on git push)
- **Database**: Needs environment variable configuration

---

## 🔧 Quick Setup - Add Database to Vercel

### Option 1: Using Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/montahaeidiiis-projects/map-it/settings/environment-variables

2. **Add DATABASE_URL**:
   - Click **"Add New"** button
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
   - **Environments**: Check all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **"Save"**

3. **Redeploy**:
   - Go to: https://vercel.com/montahaeidiiis-projects/map-it
   - Click **"Redeploy"** button (or just push to GitHub)

---

### Option 2: Using Vercel CLI

1. **Authenticate**:
   ```powershell
   npx vercel login
   ```

2. **Link Project**:
   ```powershell
   npx vercel link
   ```
   - Select: `montahaeidiii` (your account)
   - Select: `map-it` (your project)

3. **Add Environment Variable**:
   ```powershell
   # For Production
   echo "postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" | npx vercel env add DATABASE_URL production
   
   # For Preview
   echo "postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" | npx vercel env add DATABASE_URL preview
   
   # For Development
   echo "postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" | npx vercel env add DATABASE_URL development
   ```

4. **Verify**:
   ```powershell
   npx vercel env ls
   ```

5. **Redeploy**:
   ```powershell
   npx vercel --prod
   ```

---

## 🧪 Testing

### Local Testing (Already Working ✅)
```powershell
# Frontend is running on:
http://localhost:5174

# Backend is running on:
http://localhost:3101

# Test database connection:
node -e "import('./config/database.js').then(db => db.testConnection())"
```

### Production Testing (After Vercel Setup)
1. Wait 1-2 minutes for deployment
2. Visit your production URL (check Vercel dashboard)
3. Test endpoints:
   - Customer Login: `POST /api/login`
   - Admin Login: `POST /api/admin/login`
   - Get Packages: `GET /api/packages`

---

## 📋 API Endpoints (8 Serverless Functions)

All deployed to Vercel:

1. **`/api/login`** - Customer login
2. **`/api/register`** - Customer registration
3. **`/api/packages`** - List packages
4. **`/api/admin`** - Admin endpoints (login, maps, orders, stats)
5. **`/api/customer`** - Customer data (maps, package info)
6. **`/api/map`** - Map operations (get, zones, create)
7. **`/api/zone`** - Single zone creation
8. **`/api/zones`** - Bulk zone creation

---

## ✅ What's Already Done

- ✅ Database migrated to Supabase
- ✅ All API endpoints consolidated (8 functions)
- ✅ Routing conflicts fixed
- ✅ Code pushed to GitHub
- ✅ Vercel auto-deploy enabled
- ✅ Local development working
- ✅ `.env` file configured

## ⚠️ What You Need to Do

1. **Add DATABASE_URL to Vercel** (see Option 1 or 2 above)
2. **Wait for redeploy** (1-2 minutes)
3. **Test production** (visit your Vercel URL)

That's it! 🎉

---

## 🔗 Quick Links

- **GitHub Repo**: https://github.com/montahaeidiii/map_It
- **Vercel Dashboard**: https://vercel.com/montahaeidiiis-projects/map-it
- **Environment Variables**: https://vercel.com/montahaeidiiis-projects/map-it/settings/environment-variables
- **Local Frontend**: http://localhost:5174
- **Local Backend**: http://localhost:3101

---

## 🆘 Troubleshooting

### "Database connection failed" on Vercel
- ❌ DATABASE_URL not added to Vercel
- ✅ Add it via dashboard (Option 1 above)

### "404 Not Found" on API endpoints
- ❌ Old deployment cached
- ✅ Redeploy from Vercel dashboard

### Local servers not starting
```powershell
# Check what's using the ports
netstat -ano | findstr "3101 5173"

# Kill processes if needed
taskkill /PID <process_id> /F
```

### Database connection test fails
```powershell
# Test connection
node -e "import('./config/database.js').then(db => db.testConnection())"
```
