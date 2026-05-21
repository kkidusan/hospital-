import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import crypto from 'crypto';

// ቢልድ እንዳይቋረጥ እዚህ ጋር throw አናደርግም
const ENCRYPTION_PASSWORD = process.env.BACKUP_ENCRYPTION_PASSWORD;
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export async function POST(request: Request) {
  // 1. ፓስወርዱ መኖሩን ጥያቄው ሲመጣ ብቻ እንፈትሻለን
  if (!ENCRYPTION_PASSWORD) {
    console.error("Critical Error: BACKUP_ENCRYPTION_PASSWORD is not set in environment.");
    return NextResponse.json(
      { success: false, error: "Server configuration error: Encryption key missing." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('backupFile') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith('.sql.enc')) {
      return NextResponse.json({ success: false, error: "Only encrypted .sql.enc files are allowed" }, { status: 400 });
    }

    // ጊዜያዊ ፎልደር ማዘጋጀት
    const tempDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tempDir, { recursive: true });

    const tempEncryptedPath = path.join(tempDir, `upload_${randomUUID()}.enc`);
    const tempDecryptedPath = path.join(tempDir, `decrypted_${randomUUID()}.sql`);

    // ፋይሉን ወደ ሰርቨሩ መጻፍ
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempEncryptedPath, buffer);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not found");

    const url = new URL(dbUrl);
    const dbUser = url.username;
    const dbPass = url.password;
    const dbHost = url.hostname;
    const dbPort = url.port || "5432";
    const dbName = url.pathname.slice(1);

    // Decryption process
    const encryptedData = await fs.readFile(tempEncryptedPath);
    const iv = encryptedData.slice(0, IV_LENGTH);
    const encrypted = encryptedData.slice(IV_LENGTH);

    // ፓስወርዱን በመጠቀም Key ማመንጨት
    const key = crypto.scryptSync(ENCRYPTION_PASSWORD, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    await fs.writeFile(tempDecryptedPath, decrypted);

    // PostgreSQL Restore Command (psql በመጠቀም)
    const restoreCmd = `psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -f "${tempDecryptedPath}"`;

    await new Promise((resolve, reject) => {
      exec(restoreCmd, { env: { ...process.env, PGPASSWORD: dbPass } }, (error, stdout, stderr) => {
        if (error) {
          console.error("PSQL Restore Error:", stderr || error.message);
          reject(new Error(stderr || error.message));
        } else {
          resolve(true);
        }
      });
    });

    // ጊዜያዊ ፋይሎችን ማጽዳት
    if (existsSync(tempEncryptedPath)) await fs.unlink(tempEncryptedPath);
    if (existsSync(tempDecryptedPath)) await fs.unlink(tempDecryptedPath);

    return NextResponse.json({ 
      success: true, 
      message: "Database successfully decrypted and restored!" 
    });

  } catch (error: any) {
    console.error("Restore handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}