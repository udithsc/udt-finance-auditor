import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Prepare User Bypass (Since auth is temporarily disabled)
    let user = await prisma.user.findUnique({ where: { email: "demo@example.com" } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: "demo@example.com", name: "Demo User" },
      });
    }

    // 2. Save File Locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const filename = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, buffer);
    const fileUrl = `/uploads/${filename}`; // Public access URL

    // 3. Upload Document to Gemini for Analysis
    const geminiFile = await ai.files.upload({
      file: filepath,
      config: { displayName: filename },
    });

    // 4. Prompt Gemini to Extract Transactions ensuring STRICT JSON layout
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { fileData: { fileUri: geminiFile.uri, mimeType: geminiFile.mimeType } },
            {
              text: `You are a financial processor. Extract all financial transactions from this statement.
              Return ONLY a valid JSON Array. Do not include markdown formatting or backticks.
              
              Array Model [{
                "date": "YYYY-MM-DD",
                "description": "Store or transfer description",
                "amount": float (absolute positive value always),
                "type": "CREDIT" | "DEBIT" (CREDIT is money coming IN to account, DEBIT is money leaving),
                "currency": "MYR" | "USD" | "LKR",
                "category": "String (best guess e.g. 'Food', 'Transport', 'Entertainment', 'Transfer', etc)"
              }]`
            }
          ]
        }
      ]
    });

    // 5. Parse Gemini response
    let extractedText = response.text || "[]";
    // Clean potential markdown blocks just in case Gemini ignored rules
    extractedText = extractedText.replace(/```json/g, "").replace(/```/g, "").trim();

    const transactionsData = JSON.parse(extractedText);

    // 6. Store Document Record
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        filename: file.name,
        fileUrl: fileUrl,
        status: "PROCESSED",
        extractedData: JSON.stringify(transactionsData), // Cache raw extraction
      }
    });

    // 7. Store Transactions mapping the document ID
    const validTransactions = [];
    for (const tx of transactionsData) {
      if (tx.date && tx.description && tx.amount != null) {
        validTransactions.push({
          userId: user.id,
          documentId: document.id,
          date: new Date(tx.date),
          description: tx.description,
          amount: parseFloat(tx.amount),
          type: tx.type === "CREDIT" ? "CREDIT" : "DEBIT",
          currency: tx.currency || "MYR",
          category: tx.category || "Uncategorized",
          status: "PENDING", // Requires review via UI
        });
      }
    }

    if (validTransactions.length > 0) {
      await prisma.transaction.createMany({
        data: validTransactions
      });
    }

    // 8. Delete local file now that data is in database (Maintain privacy)
    try {
      await fs.unlink(filepath);
    } catch (err) {
      console.warn("Could not delete file after processing:", err);
    }

    return NextResponse.json({ 
      success: true, 
      document: { ...document, fileUrl: "[DELETED]" }, // Inform UI it's gone
      transactionsCount: validTransactions.length,
      transactions: validTransactions
    });

  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
