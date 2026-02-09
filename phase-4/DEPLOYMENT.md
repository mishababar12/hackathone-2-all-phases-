# 🚀 Phase 3 Deployment Guide

Complete guide to deploy Phase 3 AI Chatbot to Hugging Face Spaces (Backend) and Vercel (Frontend).

---

## 📦 **Part 1: Backend Deployment to Hugging Face Spaces**

### **Step 1: Create Hugging Face Space**

1. Go to: https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Configure:
   - **Space name**: `phase-3-ai-chatbot-backend`
   - **License**: MIT
   - **Space SDK**: Docker
   - **Space hardware**: CPU basic (free)
   - **Visibility**: Public

### **Step 2: Connect GitHub Repository**

1. In your new Space, go to **Settings** → **GitHub Integration**
2. Connect your repository: `mishababar12/hackathone-2-all-phases-`
3. Set **Root directory**: `phase-3-ai-chatbot/backend`
4. Enable **Auto-deploy from GitHub**

### **Step 3: Configure Environment Variables**

In Space Settings → **Variables and Secrets**, add:

```bash
# Database (Use SQLite for free tier or connect external PostgreSQL)
DATABASE_URL=sqlite:///./todo_app.db

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-change-this-to-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Cohere API Key (REQUIRED)
COHERE_API_KEY=your-cohere-api-key-here

# CORS Origins (Add your Vercel frontend URL)
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### **Step 4: Get Your Cohere API Key**

1. Go to: https://dashboard.cohere.com/
2. Sign up / Login
3. Go to **API Keys** section
4. Copy your API key
5. Add it to HF Space environment variables as `COHERE_API_KEY`

### **Step 5: Deploy**

1. Push code to GitHub (already done ✅)
2. HF Space will automatically build and deploy
3. Wait 3-5 minutes for build to complete
4. Your backend will be live at: `https://huggingface.co/spaces/YOUR_USERNAME/phase-3-ai-chatbot-backend`

### **Step 6: Test Backend**

```bash
# Check health endpoint
curl https://YOUR_USERNAME-phase-3-ai-chatbot-backend.hf.space/health

# Expected response:
{"status":"healthy","service":"backend"}
```

---

## 🌐 **Part 2: Frontend Deployment to Vercel**

### **Step 1: Install Vercel CLI (Optional)**

```bash
npm install -g vercel
```

### **Step 2: Deploy via Vercel Dashboard (Recommended)**

1. Go to: https://vercel.com/
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `mishababar12/hackathone-2-all-phases-`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `phase-3-ai-chatbot/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### **Step 3: Configure Environment Variables**

In Vercel Project Settings → **Environment Variables**, add:

```bash
# Backend API URL (Use your HF Space URL)
NEXT_PUBLIC_API_URL=https://YOUR_USERNAME-phase-3-ai-chatbot-backend.hf.space

# Auth URL (Will be your Vercel deployment URL)
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
```

**⚠️ Important**: After first deployment, update `NEXT_PUBLIC_BETTER_AUTH_URL` with your actual Vercel URL.

### **Step 4: Deploy**

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your frontend will be live at: `https://your-app.vercel.app`

### **Step 5: Update Backend CORS**

1. Go back to HF Space Settings
2. Update `CORS_ORIGINS` environment variable:
```bash
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```
3. Restart the Space for changes to take effect

### **Step 6: Update Frontend Auth URL**

1. Go to Vercel Project Settings → Environment Variables
2. Update `NEXT_PUBLIC_BETTER_AUTH_URL` with your actual deployment URL
3. Redeploy the frontend

---

## ✅ **Testing Your Deployment**

### **Test Backend:**
```bash
# Health check
curl https://YOUR_USERNAME-phase-3-ai-chatbot-backend.hf.space/health

# Register a user
curl -X POST https://YOUR_USERNAME-phase-3-ai-chatbot-backend.hf.space/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
```

### **Test Frontend:**
1. Open your Vercel URL in browser
2. Click **"Sign Up"** and create an account
3. Login with your credentials
4. Create a task
5. Try the AI chatbot feature

---

## 🔧 **Troubleshooting**

### **Backend Issues:**

**Problem**: Space not building
- Check Dockerfile syntax
- Verify all dependencies in requirements.txt
- Check HF Space build logs

**Problem**: API not responding
- Verify port 7860 is exposed
- Check CORS_ORIGINS includes your frontend URL
- Verify Cohere API key is set

**Problem**: Database errors
- For SQLite: It will auto-create on first run
- For PostgreSQL: Verify DATABASE_URL format

### **Frontend Issues:**

**Problem**: "Failed to fetch" errors
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend CORS settings
- Open browser console for detailed errors

**Problem**: Build fails on Vercel
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check Vercel build logs

**Problem**: Chat not working
- Verify backend is running
- Check Cohere API key is set in backend
- Check browser console for errors

---

## 📋 **Deployment Checklist**

### **Backend (HF Spaces):**
- [ ] HF Space created with Docker SDK
- [ ] GitHub integration configured
- [ ] Root directory set to `phase-3-ai-chatbot/backend`
- [ ] Environment variables set (DATABASE_URL, SECRET_KEY, COHERE_API_KEY, CORS_ORIGINS)
- [ ] Cohere API key obtained and configured
- [ ] Space deployed successfully
- [ ] Health endpoint tested

### **Frontend (Vercel):**
- [ ] Vercel project created
- [ ] GitHub repository imported
- [ ] Root directory set to `phase-3-ai-chatbot/frontend`
- [ ] Environment variables set (NEXT_PUBLIC_API_URL)
- [ ] Project deployed successfully
- [ ] NEXT_PUBLIC_BETTER_AUTH_URL updated with actual URL
- [ ] Redeployed after URL update

### **Integration:**
- [ ] Backend CORS updated with frontend URL
- [ ] Backend restarted after CORS update
- [ ] Signup/Login tested
- [ ] Task creation tested
- [ ] AI chat feature tested

---

## 🎉 **Success!**

Your Phase 3 AI Chatbot is now deployed and running!

- **Backend**: https://YOUR_USERNAME-phase-3-ai-chatbot-backend.hf.space
- **Frontend**: https://your-app.vercel.app

---

## 📚 **Additional Resources**

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces-overview)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Cohere API Documentation](https://docs.cohere.com/)
