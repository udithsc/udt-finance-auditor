import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/current-user";
import { getAppSettings } from "@/lib/app-settings";

export const runtime = "nodejs";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

type ExtractedTransaction = {
  date?: string;
  description?: string;
  amount?: number | string;
  type?: string;
  currency?: string;
  category?: string;
};

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown extraction error";
}

function stripJsonMarkdown(text: string) {
  return text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseTransactionJson(rawText: string): ExtractedTransaction[] {
  const cleanedText = stripJsonMarkdown(rawText);
  const arrayStart = cleanedText.indexOf("[");
  const arrayEnd = cleanedText.lastIndexOf("]");
  const jsonText = arrayStart >= 0 && arrayEnd > arrayStart
    ? cleanedText.slice(arrayStart, arrayEnd + 1)
    : cleanedText;

  const parsedData: unknown = JSON.parse(jsonText);
  return Array.isArray(parsedData) ? parsedData : [];
}

function normalizeCurrency(currency: string | undefined, defaultCurrency: string) {
  const normalized = currency?.toUpperCase().trim();
  if (normalized === "RM") return "MYR";
  return normalized || defaultCurrency;
}

function normalizeType(type: string | undefined) {
  return type?.toUpperCase() === "CREDIT" ? "CREDIT" : "DEBIT";
}

function isValidDate(value: string | undefined) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export async function POST(req: Request) {
  let filepath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const sourceType = String(formData.get("sourceType") || "auto");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF or image file such as JPG, PNG, WEBP, HEIC, or HEIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Upload files smaller than 20MB." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const [user, settings] = await Promise.all([getCurrentUser(), getAppSettings()]);

    // 2. Save File Locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const filename = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    filepath = path.join(uploadsDir, filename);

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
            { fileData: { fileUri: geminiFile.uri, mimeType: geminiFile.mimeType || file.type } },
            {
              text: `You are a careful financial data extraction engine.

Input type hint: ${sourceType}

Extract financial transactions from any of these inputs:
- bank statements
- card statements
- receipts
- utility, telecom, rent, tax, school, medical, or subscription bills
- payment confirmations
- bank or wallet SMS screenshots
- merchant invoices or screenshots

Return ONLY a valid JSON array. Do not include markdown, comments, explanations, or backticks.

Rules:
- If the file is a bank/card statement, extract every visible transaction row.
- If the file is a bill, receipt, invoice, or payment confirmation, extract the payable/paid total as one DEBIT transaction unless it is clearly a refund.
- If the file is an SMS screenshot, extract the transaction described in the message. If multiple messages contain transactions, return each one.
- Ignore balances, available limits, opening balances, closing balances, subtotals, taxes, duplicate totals, and non-transaction text unless no final total exists.
- Use absolute positive numbers for amount.
- Use CREDIT only when money comes into the user's account. Use DEBIT for bills, purchases, withdrawals, fees, transfers out, and payments.
- Dates must be YYYY-MM-DD. Prefer transaction date, then paid date, then bill/invoice date, then due date. If no date is visible, omit the item.
- Currency should be an ISO-like uppercase code. Prefer the visible currency. If no currency is visible, use ${settings.baseCurrency}. Use MYR for RM.
- Make description human readable: merchant/biller/bank counterparty plus useful reference if visible.
- Categorize with a concise category such as Food, Transport, Utilities, Telecom, Rent, Shopping, Health, Education, Entertainment, Fees, Transfer, Salary, Refund, Investment, Cash Withdrawal, Credit Card Payment, Uncategorized.

Array schema:
[{
  "date": "YYYY-MM-DD",
  "description": "merchant, biller, counterparty, or transaction summary",
  "amount": 123.45,
  "type": "CREDIT" | "DEBIT",
  "currency": "${settings.baseCurrency}" | "other visible currency",
  "category": "best category"
}]`
            }
          ]
        }
      ]
    });

    // 5. Parse Gemini response
    const transactionsData = parseTransactionJson(response.text || "[]");

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
      const amount = Number(tx.amount);
      const transactionDate = tx.date;
      if (transactionDate && isValidDate(transactionDate) && tx.description && Number.isFinite(amount) && amount > 0) {
        validTransactions.push({
          userId: user.id,
          documentId: document.id,
          date: new Date(transactionDate),
          description: tx.description.trim(),
          amount: Math.round(amount * 100) / 100,
          type: normalizeType(tx.type),
          currency: normalizeCurrency(tx.currency, settings.baseCurrency),
          baseCurrency: settings.baseCurrency,
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

    return NextResponse.json({ 
      success: true, 
      document: { ...document, fileUrl: "[DELETED]" }, // Inform UI it's gone
      transactionsCount: validTransactions.length,
      transactions: validTransactions
    });

  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  } finally {
    if (filepath) {
      try {
        await fs.unlink(filepath);
      } catch (err) {
        console.warn("Could not delete file after processing:", err);
      }
    }
  }
}
