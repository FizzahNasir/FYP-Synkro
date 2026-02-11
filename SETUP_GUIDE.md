# Synkro Meeting Transcription - Setup & Testing Guide

## ✅ What Has Been Fixed

### 1. **File Size Validation**
- Changed from 200MB to 25MB (Whisper API limit)
- Updated endpoint documentation
- Added file size validation in transcription task

### 2. **Storage URL Parsing**
- Fixed to support local storage (`local://`)
- Fixed to support AWS S3 (`.amazonaws.com/`)
- Fixed to support Cloudinary (`cloudinary.com`)
- Added logging for storage type detection

### 3. **OpenAI API Key Validation**
- Added startup validation that checks if OpenAI key is configured
- Shows clear warning if missing
- Displays in configuration check on startup

### 4. **Audio Duration Calculation**
- Added `mutagen` library for audio metadata extraction
- Calculates duration from audio file during transcription
- Saves duration to database
- Handles errors gracefully if duration cannot be determined

### 5. **Error Handling & Logging**
- Added comprehensive logging throughout transcription pipeline
- Logs all major steps with timestamps
- Logs errors with full stack traces
- Better error messages for debugging
- Automatic cleanup of temporary files on error

### 6. **API Key Configuration**
- ✅ OpenAI API Key: **CONFIGURED**
- ✅ Storage: **Local filesystem** (development mode)
- ✅ Database: **SQLite** (easy setup)

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

New dependency added: `mutagen==1.47.0` for audio duration calculation

### Step 2: Start Redis (Required for background tasks)

**Option A: Using Docker (Recommended)**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Option B: Windows (using WSL or native Redis)**
```bash
# If you have Redis installed locally
redis-server
```

**Option C: Skip Redis for now (upload will work, but transcription won't start automatically)**

### Step 3: Start Celery Worker

Open a new terminal:
```bash
cd backend
celery -A app.celery_app worker --loglevel=info --pool=solo
```

**Note:** On Windows, use `--pool=solo` flag

### Step 4: Start FastAPI Server

Open another terminal:
```bash
cd backend
uvicorn app.main:app --reload
```

You should see:
```
[*] Starting Synkro v1.0.0
[*] Environment: development

[*] Configuration Check:
    ✓ OpenAI API Key: Configured
    ⚠ Storage: Local filesystem (development only)
    ✓ Database: SQLite
    ✓ Redis: Configured
```

---

## 📝 Testing the Meeting Transcription

### Test 1: Upload a Meeting Recording

1. **Get a test audio file** (MP3, WAV, M4A, etc., under 25MB)
   - Use a sample meeting recording
   - Or download a test file from: https://file-examples.com/index.php/sample-audio-files/

2. **Upload via API:**

```bash
# Login first to get access token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=alice@synkro.dev&password=password123"

# Save the access_token from response

# Upload meeting
curl -X POST http://localhost:8000/api/meetings/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@path/to/your/audio.mp3" \
  -F "title=Team Standup Meeting"
```

3. **Expected Response:**
```json
{
  "id": "uuid-here",
  "title": "Team Standup Meeting",
  "status": "processing",
  "message": "Meeting uploaded successfully. Transcription will begin shortly."
}
```

### Test 2: Check Transcription Progress

Watch the Celery worker terminal - you should see logs like:

```
[INFO] Starting transcription for meeting {id}
[INFO] Meeting {id}: Using local storage, key = meetings/filename.mp3
[INFO] Meeting {id}: Downloading audio to /tmp/tmpXXXX.mp3
[INFO] Meeting {id}: Downloaded file size = 2.34MB
[INFO] Meeting {id}: Duration = 5 minutes (315.2 seconds)
[INFO] Meeting {id}: Starting Whisper API transcription
[INFO] Meeting {id}: Transcription complete, length = 1234 characters
[INFO] Meeting {id}: Status updated to TRANSCRIBED
[INFO] Meeting {id}: Summarization task triggered
```

Then summarization logs:
```
[INFO] Starting summarization for meeting {id}
[INFO] Meeting {id}: Calling GPT-4 for summarization
[INFO] Meeting {id}: Summarization complete
[INFO] Meeting {id}: Created 3 action items, skipped 1 low-confidence items
[INFO] Meeting {id}: Status updated to COMPLETED
```

### Test 3: View Results

```bash
# Get meeting details
curl -X GET http://localhost:8000/api/meetings/{meeting_id} \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response includes:
- `transcript`: Full transcription with timestamps
- `summary`: Structured summary with key topics, decisions, action items, blockers
- `duration_minutes`: Audio duration
- `action_items`: Array of extracted action items with confidence scores

---

## 🎯 What the System Does

### Upload Flow:
1. ✅ User uploads audio file (< 25MB)
2. ✅ File is validated (format, size)
3. ✅ File is stored locally in `backend/uploads/meetings/`
4. ✅ Meeting record created with status `PROCESSING`
5. ✅ Celery task triggered for transcription

### Transcription Flow:
1. ✅ Download audio from storage
2. ✅ Validate file size (must be < 25MB)
3. ✅ Calculate audio duration using mutagen
4. ✅ Call OpenAI Whisper API for transcription
5. ✅ Format transcript with timestamps `[MM:SS] text`
6. ✅ Save transcript and duration to database
7. ✅ Update status to `TRANSCRIBED`
8. ✅ Trigger summarization task

### Summarization Flow:
1. ✅ Call GPT-4 to generate structured summary
2. ✅ Extract action items from summary
3. ✅ Create ActionItem records (confidence >= 0.6)
4. ✅ Update status to `COMPLETED`
5. ⏳ Send notifications (TODO - not implemented yet)

---

## 📊 Storage Locations

### Local Storage:
- **Location:** `backend/uploads/meetings/`
- **URL Format:** `local://meetings/uuid.mp3`
- **Cleanup:** Files remain until meeting is deleted

### Database:
- **Location:** `backend/synkro.db` (SQLite)
- **Tables:** meetings, action_items, users, teams, tasks

---

## 🐛 Troubleshooting

### Issue: "Meeting uploaded successfully. (Automatic transcription requires Celery/Redis configuration)"
**Solution:** Redis/Celery not running. Start Redis and Celery worker.

### Issue: "Transcription failed - File size exceeds maximum"
**Solution:** Audio file is > 25MB. Compress or split the audio file.

### Issue: "OpenAI API Key: MISSING"
**Solution:** Check that your .env file has the API key on line 20.

### Issue: "Failed to calculate duration"
**Solution:** Audio file format not supported by mutagen. Transcription will still work, duration will be null.

### Issue: Task stuck in PROCESSING
**Solution:** Check Celery worker logs for errors. Common issues:
- OpenAI API rate limit exceeded
- Network connectivity issues
- Invalid audio file format

---

## 💰 OpenAI API Costs

Based on OpenAI pricing (as of 2024):

### Whisper API:
- **Cost:** $0.006 per minute of audio
- **Example:** 30-minute meeting = $0.18

### GPT-4 (Summarization):
- **Cost:** ~$0.01-0.03 per summary
- **Varies:** Based on transcript length

### Total per meeting:
- **Estimate:** $0.20 - $0.50 per meeting (depending on length)

---

## 🔒 Security Recommendations

1. **Regenerate your OpenAI API Key** after testing (you shared it in conversation)
2. Never commit `.env` file to git (already in `.gitignore`)
3. For production, use AWS S3 instead of local storage
4. Set up rate limiting on upload endpoint
5. Add file virus scanning before transcription
6. Enable SSL/HTTPS for production deployment

---

## ✨ Next Steps

After testing the transcription system, you can:

1. **Add more test meetings** to build up data
2. **Test action item conversion** to tasks
3. **View meetings in the frontend** (if frontend is running)
4. **Set up AWS S3** for production storage
5. **Implement notifications** when action items are created
6. **Add webhook support** for integration with other tools

---

## 📞 Need Help?

If you encounter issues:
1. Check the FastAPI server logs
2. Check the Celery worker logs
3. Check `backend/uploads/meetings/` to verify files are being stored
4. Test the OpenAI API key manually: https://platform.openai.com/playground

---

**Status:** ✅ All systems ready for testing!
