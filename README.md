# ⚡️ AI Proof Vault
The Internet Has a Trust Problem. We Fix It.

AI can now fabricate photo-realistic images that look indistinguishable from reality.
But the world has no universal way to prove whether a visual is authentic.

AI Proof Vault is a decentralized verification layer for images.
It generates tamper-proof proofs on Filecoin and lets anyone verify authenticity instantly.

You upload an image → We hash it, describe it, timestamp it, and store its proof immutably.

No watermarking.
No proprietary detectors.
Just cryptographic truth.

## 🔥 Why This Matters (The Real “Why”)

The world is drowning in synthetic media.
2025 is the first year AI images surpassed real ones online.

This isn’t just a tech challenge — it’s a societal crisis:

- Fake political images influencing elections

- Fabricated “evidence” circulating in seconds

- Journalists losing authority

- Courtrooms rejecting digital proof

- People’s reputations destroyed by a single fake AI photo

Watermarks can be removed.
Detectors fail on simple edits.
Metadata is easily stripped.

What the world lacks is a universal trust layer for images.

We built one.

## 🧠 Our Insight

Instead of trying to guess whether an image is fake…

We make authenticity cryptographically verifiable.

For each uploaded image:

- 💠 Compute SHA-256 hash

- 🧾 Generate a consistent metadata description using an AI model

- 🕒 Timestamp the metadata

- 📦 Package these proofs

- 🔐 Store them immutably on Filecoin Warm Storage

- 🔍 Allow anyone to verify an image by recomputing its hash

This flips the entire detection problem:

Don't ask **“Is this fake?”**
Ask **“Does this image match the original proof?”**

Simple. Immutable. Universal.

## 🚀 What We Built
**Frontend (React + Vite)**

A clean interface for two main operations:

- Generate Proof — Upload an image, pick a model, get a Proof Package (hash, description, timestamp, CID).

- Verify Proof — Upload an image + CID → instantly know if it matches.


**Backend (Node.js + Express)**
- ```/api/generate```

1. Accepts image + model (OpenAI)

1. Generates description

1. Hashes image

1. Creates a Proof Package

1. Uploads it to Filecoin via Synapse SDK

1. Returns CID + metadata

- ```/api/verify```

1. Accepts image + CID

1. Fetches stored proof

1. Re-hashes submitted image

1. Confirms authenticity

**Decentralized Storage (Filecoin Warm Storage)**

We use:

- Synapse SDK

- USDFC micro-deposits

- Warm Storage services

Every proof is permanent.
Tamper-proof.
Available globally.

## 🛰 Architecture Diagram
```bash
User → Frontend → Backend → Hash + AI Description → Proof Package
                                              ↓
                                       Filecoin Storage (CID)
                                              ↓
                              ← Verification (Hash == Stored Hash?)
```

## 🔐 How It Works (Deep Dive)
1. Upload

User chooses an image.

2. Generate Description

We send it to an AI model for a deterministic description.

3. Cryptographic Hash

We compute a SHA-256 hash of the exact file bytes.

4. Build the Proof Package
```json
{
  "description": "...",
  "model": "gpt-4o-mini",
  "hash": "sha256:xxxxxx",
  "timestamp": 1700000000
}
```

5. Store on Filecoin

We bundle this and store it through Warm Storage → receive a CID.

6. Verification

We take a second image → hash it → compare with stored hash.

If equal → Verified Original.
If not → Mismatch (fake or modified).

## 🧪 Example API Requests
- Generate
```bash
curl -X POST http://localhost:4000/api/generate \
  -F "image=@photo.jpg" \
  -F "model=gpt-4o-mini"
```

- Verify
```bash
curl -X POST http://localhost:4000/api/verify \
  -F "image=@photo.jpg" \
  -F "cid=bafy..."
```

## ⚔️ Built With

OpenAI GPT-4o mini (vision → description)

Synapse SDK

Filecoin Warm Storage

USDFC testnet token

Node.js + Express

React + Vite

lucide-react

FormData + Fetch API

## 🛠 Local Setup
git clone <repo>
cd ai-proof-vault/server
cp .env.example .env
npm install
npm run dev


Frontend:

cd ai-proof-vault/web
npm install
npm run dev


Set VITE_API_URL=http://localhost:4000/api



AI Proof Vault is a cryptographically-verified truth layer for the visual internet.
Built in 48 hours. Powered by AI (OpenAI) + Filecoin. 

Ready for the world. 🚀