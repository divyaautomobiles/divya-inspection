# 🚗 Divya Automobiles — Complete Inspection System v2

## What's Included

### Roles & Access
| Role | Access |
|------|--------|
| **Inspector** | Create inspections, upload photos/videos, generate PDF |
| **Negotiator** | View inspections, make offers, approve/reject |
| **Admin** | Everything + User management, Branch management, Analytics |

### Features
- ✅ Login with Supabase Auth
- ✅ Role-based dashboards (Inspector / Negotiator / Admin)
- ✅ Complete 8-tab inspection form (Cars24 style)
- ✅ Photos → uploaded to Supabase Storage
- ✅ Videos → uploaded to Supabase Storage
- ✅ PDF report generation
- ✅ Market value auto-calculation
- ✅ Negotiation dashboard with offer system
- ✅ Admin panel (users, roles, branches, analytics)
- ✅ Real-time notifications (Supabase Realtime)
- ✅ Inspector performance reports
- ✅ Monthly inspection charts
- ✅ Mobile responsive sidebar
- ✅ Dark theme with Divya Automobiles branding

## Deploy on Vercel (5 minutes)

### Step 1: Supabase Setup
Run `SUPABASE_SETUP.sql` in Supabase SQL Editor

### Step 2: Create Users
Supabase → Authentication → Users → Add User
Then set role in `profiles` table

### Step 3: GitHub
```bash
git init && git add . && git commit -m "Divya Automobiles v2"
git remote add origin https://github.com/YOUR/divya-inspection.git
git push -u origin main
```

### Step 4: Vercel
1. vercel.com → New Project
2. Import GitHub repo
3. Framework: Vite (auto-detected)
4. Deploy → Live URL!

## Local Dev
```bash
npm install
npm run dev
```
