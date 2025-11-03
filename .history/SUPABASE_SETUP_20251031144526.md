# Supabase Database Configuration Guide

## Overview
Your MapIt project is now configured to use **Supabase PostgreSQL** database for both local development and production (Vercel) deployment.

## Connection Details

### Database Connection String
```
postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Connection Type
- **Session Pooler** (Port 5432) - Recommended for serverless functions
- Region: AWS AP Southeast 1 (Singapore)
- Database: postgres
- Schema: public

## Local Development Setup

### 1. Environment Variables
The `.env` file has been updated with your Supabase connection:

```env
DATABASE_URL=postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
PORT=3101
SERVER_HOST=127.0.0.1
VITE_API_URL=http://127.0.0.1:3101
```

### 2. Start Local Development

```bash
# Install dependencies (if not already done)
npm install

# Start the Express server
node server.js
# Server will run on http://127.0.0.1:3101

# In another terminal, start Vite dev server
npm run dev
# Frontend will run on http://localhost:5173
```

### 3. Test Connection

```bash
# Test database connection
node -e "import('./config/database.js').then(db => db.testConnection())"
```

## Vercel Deployment Setup

### 1. Set Environment Variable in Vercel

Go to: https://vercel.com/your-project/settings/environment-variables

Add the following:

**Variable Name:**
```
DATABASE_URL
```

**Variable Value:**
```
postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

### 2. Deploy

After adding the environment variable:

```bash
# Commit and push (triggers auto-deploy)
git add .
git commit -m "Configure Supabase database connection"
git push
```

Or manually redeploy from Vercel dashboard.

## Database Schema

Your Supabase database should have these tables:

### Core Tables
- `customer` - User accounts
- `admin` - Admin accounts
- `map` - User-created maps
- `zones` - Map zones/regions
- `packages` - Subscription packages
- `orders` - Package purchases

### SQL to Create Tables

If tables don't exist in Supabase, run this in SQL Editor:

```sql
-- See setup-neon-database.sql for complete schema
-- Or check your existing database structure
```

## Supabase Dashboard

Access your Supabase project:
- **Dashboard**: https://app.supabase.com/project/vfqmqcillubgddsdzvlc
- **Database**: Settings → Database
- **SQL Editor**: SQL Editor tab
- **Table Editor**: Table Editor tab

## Connection Pooling

### Session Pooler (Current Setup)
- **Port**: 5432
- **Best for**: Serverless functions (Vercel)
- **Max connections**: Pooled automatically by Supabase
- **Transaction mode**: Session

### Alternative: Transaction Pooler
If you need Transaction pooler:
- **Port**: 6543
- **Connection**: `postgresql://postgres.vfqmqcillubgddsdzvlc:SOnclD1eHCYTOWz5@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

## API Endpoints Testing

Test your APIs after setup:

```bash
# Test connection
curl https://your-app.vercel.app/api/test-connection

# Test admin login
curl -X POST https://your-app.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mapit.com","password":"your-password"}'

# Test customer maps
curl https://your-app.vercel.app/api/customer/1/maps
```

## Troubleshooting

### Connection Refused Error
If you see `ECONNREFUSED`:
1. Check DATABASE_URL is set in Vercel dashboard
2. Verify Supabase project is active
3. Check connection string is correct

### SSL Certificate Error
Ensure SSL is configured:
```javascript
ssl: { rejectUnauthorized: false }
```

### Timeout Issues
Increase timeout in `config/database.js`:
```javascript
connectionTimeoutMillis: 10000
```

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Logs → Database
3. Check for connection errors

## Migration from Neon to Supabase

If you have existing data in Neon:

1. **Export from Neon**:
   - Use `pg_dump` to export data
   - Or export via Neon console

2. **Import to Supabase**:
   - Use SQL Editor to run import scripts
   - Or use `psql` with connection string

## Security Notes

⚠️ **Important**:
- Never commit `.env` file to git
- Rotate passwords regularly in Supabase dashboard
- Use Supabase Row Level Security (RLS) for additional protection
- Monitor connection usage in Supabase dashboard

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Support**: https://supabase.com/support
- **Project Issues**: Check Vercel logs and Supabase dashboard

---

**Configuration Complete!** ✅

Your MapIt project is now connected to Supabase and ready for both local development and production deployment.
