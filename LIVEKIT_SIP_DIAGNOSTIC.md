# LiveKit Phone Calls Not Connecting - Backend Diagnostic

## Problem

- ✅ LiveKit room connects successfully
- ✅ Your microphone publishes to the room
- ❌ **The actual phone call to the number doesn't happen**
- ❌ No audio comes through

This means the **LiveKit SIP bridge is not configured or not working** on your backend.

---

## What LiveKit SIP Needs

To make actual phone calls, LiveKit needs:

1. **LiveKit SIP service** running (separate from LiveKit server)
2. **SIP Trunk** configured (Twilio, Telnyx, SignalWire, etc.)
3. **Backend API endpoints** to create SIP participants
4. **Proper environment variables** set

---

## Backend Checklist

### 1. Environment Variables

Your backend `.env` file MUST have:

```env
# LiveKit Server
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud

# LiveKit SIP (CRITICAL for phone calls)
LIVEKIT_SIP_URL=https://your-livekit-server.livekit.cloud
LIVEKIT_SIP_API_KEY=your_sip_api_key
LIVEKIT_SIP_API_SECRET=your_sip_api_secret

# Your SIP Trunk Provider (e.g., Twilio)
SIP_TRUNK_NUMBER=+1234567890
SIP_TRUNK_URI=sip:trunk-name@sip.twilio.com
SIP_TRUNK_USERNAME=your_username
SIP_TRUNK_PASSWORD=your_password
```

**Are these set?** ❓

---

### 2. LiveKit SIP Service

LiveKit has **two separate services**:

- **LiveKit Server** - handles rooms, participants, audio/video streams ✅ (This one works)
- **LiveKit SIP** - bridges to phone networks ❌ (This one is missing)

**Check if LiveKit SIP is running:**

If using **LiveKit Cloud**:

- SIP should be enabled in your cloud project
- Check the SIP tab in your LiveKit Cloud dashboard

If **self-hosting**:

- You need to run the `livekit-sip` service separately
- See: https://github.com/livekit/sip

---

### 3. Backend API Endpoint Issues

Your backend has `/api/livekit/call` endpoint that should:

```javascript
// What the endpoint should do:
POST /api/livekit/call
{
  "callerId": "crm-dialer",
  "phoneNumber": "+1234567890",
  "prospectId": "123"
}

// Should return:
{
  "roomName": "call_crm-dialer_1234567890_timestamp",
  "token": "eyJhbGc...",  // LiveKit room token for the user
  "url": "wss://your-server.livekit.cloud"
}

// AND it should also:
// 1. Create a SIP participant in the room to dial the phone number
// 2. Use LiveKit SIP API to create outbound SIP call
```

**The missing piece:** Creating the SIP participant that actually calls the phone number.

---

### 4. Creating SIP Participant (Backend Code Needed)

Your backend needs to use the **LiveKit SIP API** after creating the room:

```javascript
// Example using livekit-server-sdk (Node.js)
import { SipClient } from "livekit-server-sdk";

const sipClient = new SipClient(
  process.env.LIVEKIT_SIP_URL,
  process.env.LIVEKIT_SIP_API_KEY,
  process.env.LIVEKIT_SIP_API_SECRET
);

// After creating the room, create a SIP participant
const sipParticipant = await sipClient.createSipParticipant({
  sipTrunkId: "your-sip-trunk-id", // Configured in LiveKit
  sipCallTo: phoneNumber, // E.g., +1234567890
  roomName: roomName,
  participantIdentity: "sip-caller",
  participantName: "Phone Call",
  dtmf: "",
  playRingtone: true,
});
```

**Does your backend do this?** ❓

---

### 5. SIP Trunk Configuration

You need a **SIP Trunk** configured in LiveKit to connect to the phone network.

**Using LiveKit Cloud:**

1. Go to Settings → SIP Trunks
2. Add a new trunk (Twilio, Telnyx, etc.)
3. Note the `sipTrunkId` - you'll use this in the API call

**Self-hosting:**

1. Configure SIP trunk in LiveKit SIP service config
2. Example config:

```yaml
sip_trunks:
  - id: my-twilio-trunk
    name: Twilio SIP Trunk
    outbound_address: sip.twilio.com
    outbound_number: +1234567890
    auth_username: your_username
    auth_password: your_password
```

**Is this configured?** ❓

---

### 6. Database Tables Needed

Check if these tables exist and have proper structure:

#### `calls` table

```sql
CREATE TABLE calls (
  id VARCHAR(255) PRIMARY KEY,
  room_name VARCHAR(255) NOT NULL,
  caller_id VARCHAR(255),
  phone_number VARCHAR(50),
  prospect_id VARCHAR(255),
  status ENUM('initiated', 'ringing', 'connected', 'ended', 'failed'),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `livekit_sip_trunks` table (optional, if managing trunks in DB)

```sql
CREATE TABLE livekit_sip_trunks (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  sip_trunk_id VARCHAR(255) NOT NULL,  -- LiveKit SIP trunk ID
  provider VARCHAR(50),  -- twilio, telnyx, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Quick Test

To verify SIP is working, try this backend endpoint test:

```bash
# Make a call via your backend API
curl -X POST http://localhost:5000/api/livekit/call \
  -H "Content-Type: application/json" \
  -d '{
    "callerId": "test",
    "phoneNumber": "+1234567890",
    "callerName": "Test Caller"
  }'
```

**Expected response:**

```json
{
  "roomName": "call_test_1234567890_timestamp",
  "token": "eyJhbGc...",
  "url": "wss://..."
}
```

**Then check:**

1. Does the phone actually ring? ✅ / ❌
2. Check LiveKit dashboard - do you see 2 participants in the room (you + SIP)?
3. Check backend logs for SIP-related errors

---

## Most Likely Issue

Based on your logs, **the SIP participant is not being created**. Your room has only YOU as a participant, not the phone call.

**What to check on backend:**

1. Is `livekit-server-sdk` installed? (`npm list livekit-server-sdk`)
2. Does `/api/livekit/call` endpoint call `sipClient.createSipParticipant()`?
3. Are SIP environment variables (`LIVEKIT_SIP_*`) set?
4. Is there a SIP trunk configured in LiveKit?

---

## Next Steps

1. ✅ Check backend `.env` for LiveKit SIP variables
2. ✅ Verify SIP trunk is configured in LiveKit dashboard/config
3. ✅ Review backend code in `/api/livekit/call` endpoint
4. ✅ Add SIP participant creation logic if missing
5. ✅ Test with curl to isolate frontend vs backend issue

Let me know what you find!
