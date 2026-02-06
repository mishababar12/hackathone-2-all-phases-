# ⚡ Quick Deployment Guide - Phase 3

## 🎯 **Backend → Hugging Face Spaces**

### 1️⃣ Create Space
```
→ https://huggingface.co/spaces
→ New Space → Docker SDK
→ Name: phase-3-ai-chatbot-backend
```

### 2️⃣ Connect GitHub
```
Settings → GitHub Integration
Repository: mishababar12/hackathone-2-all-phases-
Root: phase-3-ai-chatbot/backend
```

### 3️⃣ Environment Variables
```bash
DATABASE_URL=sqlite:///./todo_app.db
SECRET_KEY=change-me-to-random-string-xyz123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
COHERE_API_KEY=get-from-cohere-dashboard
CORS_ORIGINS=https://your-frontend.vercel.app
```

### 4️⃣ Get Cohere Key
```
→ https://dashboard.cohere.com/
→ API Keys → Copy
```

---

## 🎯 **Frontend → Vercel**

### 1️⃣ Deploy
```
→ https://vercel.com/
→ New Project → Import Git Repository
→ mishababar12/hackathone-2-all-phases-
```

### 2️⃣ Configure
```
Framework: Next.js
Root Directory: phase-3-ai-chatbot/frontend
Build Command: npm run build
Install Command: npm install
```

### 3️⃣ Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://YOUR-HF-SPACE-URL.hf.space
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
```

### 4️⃣ After First Deploy
```
1. Copy your Vercel URL
2. Update NEXT_PUBLIC_BETTER_AUTH_URL with real URL
3. Update backend CORS_ORIGINS with Vercel URL
4. Redeploy both
```

---

## ✅ **Quick Test**

### Backend:
```bash
curl https://YOUR-SPACE.hf.space/health
```

### Frontend:
```
Open browser → Your Vercel URL
→ Sign Up → Login → Create Task → Try Chat
```

---

## 🔗 **Important URLs**

- **HF Spaces**: https://huggingface.co/spaces
- **Vercel**: https://vercel.com/
- **Cohere**: https://dashboard.cohere.com/
- **Your Repo**: https://github.com/mishababar12/hackathone-2-all-phases-

---

**Need detailed guide?** See `DEPLOYMENT.md`
