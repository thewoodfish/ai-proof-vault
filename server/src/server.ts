/**
 * AI Proof Vault 
 *
 * - POST /api/generate   -> form-data: image (file), model (string)
 * - POST /api/verify     -> form-data: image (file)
 *
 * Minimal dependencies:
 *  - express + multer for file upload
 *  - better-sqlite3 for a tiny durable mapping (image_hash -> cid)
 *
 */

import express from "express";
import multer from "multer";
import crypto from "crypto";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import { callGrokVision, callOpenAIVision } from "./util.js";
import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";

// Local imports
import { storeOnFilecoin, retrieveFromFilecoin } from "./storage.js";
import { setupPayments } from "./storage.js";
import cors from 'cors';


// Import env variables
dotenv.config();

// Configure server
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get keys
const PRIVATE_KEY = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : "";
const OPENAI_KEY = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY : "";
const GROK_KEY = "";

// Multer in-memory storage (small files)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Ensure data folder
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Setup SQLite DB
const dbPath = path.join(dataDir, "vault.db");
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS vault (
    image_hash TEXT PRIMARY KEY,
    cid TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);


// Setup synapse
async function setup_synapse() {
    const synapse = await Synapse.create({
        privateKey: PRIVATE_KEY,
        rpcURL: RPC_URLS.calibration.http
    }); await setupPayments(synapse, 0.3); // Deposit 0.3 USDFC
}

// Setup Synapse account with tUSDFC
setup_synapse();

// Helper: SHA-256 hex of buffer
function sha256Hex(buf: Buffer): string {
    return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * Function that can route to different AI models
 * @param imageBuffer - The image as a Buffer
 * @param model - Model name: 'openai', 'grok', or undefined for mock
 * @param apiKey - API key for the chosen provider
 */
async function callAIModel(
    imageBuffer: Buffer,
    model?: string,
): Promise<{ description: string; modelName: string }> {

    if (!model)
        model = 'mock-vision-1';

    switch (model.toLowerCase()) {
        case 'openai':
        case 'gpt-4o-mini':
            return callOpenAIVision(imageBuffer, OPENAI_KEY);

        case 'grok':
        case 'grok-2-vision':
            return callGrokVision(imageBuffer, GROK_KEY);

        default:
            throw new Error(`Unsupported model: ${model}`);
    }
}

/**
 * POST /api/generate
 * form-data: image (file), model (string, optional)
 * Response: { description, model, timestamp, cid }
 */
app.post("/api/generate", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "image file is required" });
        const imageBuffer = req.file.buffer;
        const model = (req.body.model as string) || undefined;

        // Compute image hash
        const imageHash = sha256Hex(imageBuffer);

        // Call AI model
        const ai = await callAIModel(imageBuffer, model);

        // Build proof object
        const timestamp = Math.floor(Date.now() / 1000);
        const proof = {
            image_hash: imageHash,
            description: ai.description,
            model: ai.modelName,
            timestamp,
            vault_version: "0.1.0"
        };

        // Store on Filecoin and get CID
        const cid = await storeOnFilecoin(proof, "testnet");

        // Persist mapping image_hash -> cid in SQLite
        const insert = db.prepare("INSERT OR REPLACE INTO vault (image_hash, cid, created_at) VALUES (?, ?, ?)");
        insert.run(imageHash, cid, timestamp);

        // Respond
        return res.json({
            description: ai.description,
            model: ai.modelName,
            timestamp,
            cid
        });
    } catch (err) {
        console.error("generate error:", err);
        return res.status(500).json({ error: "internal_error", detail: String(err) });
    }
});

/**
 * POST /api/verify
 * form-data: image (file)
 * Response:
 *  { valid: true, description, model, timestamp, cid } OR
 *  { valid: false }
 */
app.post("/api/verify", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "image file is required" });
        const imageBuffer = req.file.buffer;
        const imageHash = sha256Hex(imageBuffer);

        // lookup in DB
        const row: any = db.prepare("SELECT cid, created_at FROM vault WHERE image_hash = ?").get(imageHash);
        if (!row) {
            return res.json({ valid: false, reason: "no_proof_found" });
        }

        const cid: string = row.cid;

        // Fetch proof object from Filecoin
        const proof = await retrieveFromFilecoin(cid, "testnet");
        if (!proof) {
            // If filecoin isn't reachable, but we have the DB mapping, we can still return basic data
            return res.json({
                valid: true,
                cid,
                info: "Proof mapping found but proof JSON not available in Filecoin cache. Hence it has not been verified."
            });
        }

        // Verify the stored hash matches calculated hash
        if ((proof as any).image_hash === imageHash) {
            return res.json({
                valid: true,
                cid,
                description: (proof as any).description,
                model: (proof as any).model,
                timestamp: (proof as any).timestamp
            });
        } else {
            return res.json({ valid: false, reason: "hash_mismatch" });
        }
    } catch (err) {
        console.error("verify error:", err);
        return res.status(500).json({ error: "internal_error", detail: String(err) });
    }
});

app.get("/", (_req, res) => {
    res.send("AI Proof Vault server is running.");
});

app.listen(PORT, () => {
    console.log(`AI Proof Vault server listening on http://localhost:${PORT}`);
});
