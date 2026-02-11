# Quick Start Guide - Meeting Transcription

**Everything is configured and ready to test!**

---

## ⚡ Start in 3 Steps

### 1. Install New Dependency (One-time)
```bash
cd backend
pip install mutagen==1.47.0
```

### 2. Start Backend Services (3 terminals)

**Terminal 1 - Redis:**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Terminal 2 - Celery Worker:**
```bash
cd backend
celery -A app.celery_app worker --loglevel=info --pool=solo
```

**Terminal 3 - FastAPI:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Verify Startup Shows:**
```
✓ OpenAI API Key: Configured
⚠ Storage: Local filesystem (development only)
✓ Database: SQLite
✓ Redis: Configured
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

---

## 🧪 Test Upload

1. **Open:** http://localhost:3000/dashboard/meetings

2. **Login:** alice@synkro.dev / password123

3. **Upload:**
   - Click upload area
   - Select audio file (< 25MB: .mp3, .wav, .m4a, etc.)
   - Title auto-fills
   - Click "Upload and Transcribe"

4. **Watch Progress:**
   - Meeting appears with "processing" status
   - Check Celery terminal for detailed logs
   - Wait 1-5 minutes (depends on file length)
   - Status changes: PROCESSING → TRANSCRIBED → COMPLETED

5. **View Results:**
   - Click on completed meeting
   - See transcript, summary, action items

6. **Delete Meeting:**
   - Hover over meeting card
   - Click trash icon that appears
   - Confirm deletion

---

## 📁 Where Files Are Stored

- **Audio Files:** `backend/uploads/meetings/`
- **Database:** `backend/synkro.db`
- **Logs:** Celery worker terminal

---

## ⚠️ Important Limits

- **Max File Size:** 25MB (Whisper API limit)
- **Supported Formats:** MP3, WAV, M4A, WebM, MP4
- **Cost:** ~$0.20 per 30-minute meeting

---

## 🐛 Quick Fixes

### "Upload failed"
- File must be < 25MB
- Check file format
- Make sure you're logged in

### Stuck in "processing"
- Check Celery worker is running
- Check Celery logs for errors
- Delete and re-upload if needed

### Delete button not showing
- Hover over the meeting card
- Refresh the page

---

## 🔒 Security Reminder

**⚠️ REGENERATE YOUR OPENAI API KEY**

The key was shared in conversation. After testing:
1. Go to https://platform.openai.com/api-keys
2. Delete current key
3. Create new key
4. Update `backend/.env` line 20

---

## 📊 What Happens During Transcription

```
Upload → Validate → Store File → Create DB Record
   ↓
Start Celery Task → Download File → Check Size
   ↓
Calculate Duration → Call Whisper API → Save Transcript
   ↓
Start Summarization → Call GPT-4 → Extract Action Items
   ↓
Save Summary → Create Action Items → Mark Complete
```

**Watch Celery logs to see every step!**

---

## 📚 Full Documentation

- **SESSION_SUMMARY.md** - Complete quick reference
- **WORK_SUMMARY.md** - Technical details
- **SETUP_GUIDE.md** - Comprehensive guide
- **README.md** - Project overview

---

**Status:** ✅ Ready to test!
