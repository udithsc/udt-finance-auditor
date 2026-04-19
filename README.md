# Auditor | Private Finance Engine

Auditor is a premium, highly-private personal finance tool tailored for individuals who want complete control over their financial data. It allows users to upload financial documents, automatically extract transactions using Google's Gemini AI, and track multi-currency cash flows without vendor lock-in.

## Key Features
- **Local Document Storage**: Retain your private financial PDFs strictly on your own hardware. 
- **AI-Powered Extraction**: Contextually rips transaction headers from statements directly via Google Gemini 1.5 Pro.
- **Multi-Currency Engine**: Log and compare Net Worth over time natively across standard base and custom currencies.
- **Glassmorphism Premium UI**: Built with pure Tailwind CSS for an incredibly sleek, dark-themed experience.

---

## 🚀 Environment Setup Guide

To run Auditor, prioritize making sure your `.env` contains the required fields:
```env
# Database configuration 
DATABASE_URL="postgresql://auditor:securepassword123@localhost:5432/finance_auditor?schema=public"

# Gemini AI Key (Required for Document Extraction)
GEMINI_API_KEY="your_actual_key"

# NextAuth Config (Required to bypass NextAuth warnings)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="supersecretnextauthkey12345"
```


### 🧑‍💻 Local Development Guide (Recommended! Fast refresh)
For editing the code and instantly seeing changes via Hot Module Replacement:

1. **Start the database container only** (Requires Docker Desktop running)
   ```bash
   docker-compose up -d db
   ```
2. **Push the database schema** to initialize the empty Postgres instance:
   ```bash
   npx prisma db push
   ```
3. **Start the Next.js UI Locally**:
   ```bash
   npm run dev
   ```
4. **Access the application**: open `http://localhost:3000`

---

### 📦 Production & Self-Hosting Guide (Full Containerization)
When you're ready to deploy or want to test the hardened standalone container:

1. Spin down any local dev servers running to free up Port 3000.
2. Build and compose the full stack (this automatically triggers the Next.js standalone build):
   ```bash
   docker-compose up -d --build
   ```
3. You will need to explicitly ensure the Prisma schema is migrated against this database if you hadn't already (since they share the same volume):
   ```bash
   npx prisma db push
   ```
4. Application is live at `http://localhost:3000` isolated completely in Docker!
