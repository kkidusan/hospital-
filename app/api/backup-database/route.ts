export const dynamic = 'force-dynamic'; // ይህ ቢልድ ስህተቱን ይፈታዋል

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// ፓስወርዱን ለማግኘት የሚረዳ helper function
function getEncryptionPassword() {
  const password = process.env.BACKUP_ENCRYPTION_PASSWORD;
  if (!password) {
    throw new Error("BACKUP_ENCRYPTION_PASSWORD is not set in environment variables");
  }
  return password;
}

export async function POST(request: Request) {
  try {
    const ENCRYPTION_PASSWORD = getEncryptionPassword();
    const formData = await request.formData();
    const file = formData.get('backupFile') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith('.sql.enc')) {
      return NextResponse.json({ success: false, error: "Only encrypted .sql.enc files are allowed" }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tempDir, { recursive: true });

    const tempEncryptedPath = path.join(tempDir, `upload_${randomUUID()}.enc`);
    const tempDecryptedPath = path.join(tempDir, `decrypted_${randomUUID()}.sql`);

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

    const encryptedData = await fs.readFile(tempEncryptedPath);
    const iv = encryptedData.slice(0, IV_LENGTH);
    const encrypted = encryptedData.slice(IV_LENGTH);

    const key = crypto.scryptSync(ENCRYPTION_PASSWORD, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    await fs.writeFile(tempDecryptedPath, decrypted);

    const restoreCmd = `psql -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -f "${tempDecryptedPath}"`;

    await new Promise((resolve, reject) => {
      exec(restoreCmd, { env: { ...process.env, PGPASSWORD: dbPass } }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve(true);
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "Database successfully decrypted and restored!" 
    });

  } catch (error: any) {
    console.error("Restore error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ENCRYPTION_PASSWORD = getEncryptionPassword();
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not found in .env");

    const url = new URL(dbUrl);
    const dbUser = url.username;
    const dbPass = url.password;
    const dbHost = url.hostname;
    const dbPort = url.port || "5432";
    const dbName = url.pathname.slice(1);

    const filename = `Dr.birku_belete_backup.sql.enc`;
    const driveLetters = ['E', 'F', 'G', 'D'];
    let finalPath = "";
    let savedToUsb = false;

    for (const letter of driveLetters) {
      if (existsSync(`${letter}:\\`)) {
        const usbFolder = path.join(`${letter}:\\`, 'Clinic_Backups');
        await fs.mkdir(usbFolder, { recursive: true });
        finalPath = path.join(usbFolder, filename);
        savedToUsb = true;
        break;
      }
    }

    if (!savedToUsb) {
      const localDir = path.join(process.cwd(), 'public', 'backups');
      await fs.mkdir(localDir, { recursive: true });
      finalPath = path.join(localDir, filename);
    }

    const tempSqlPath = path.join(process.cwd(), `temp_backup_${Date.now()}.sql`);
    const dumpCommand = `pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} --clean --if-exists -f "${tempSqlPath}" ${dbName}`;

    await new Promise((resolve, reject) => {
      exec(dumpCommand, { env: { ...process.env, PGPASSWORD: dbPass } }, (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve(true);
      });
    });

    const sqlBuffer = await fs.readFile(tempSqlPath);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(ENCRYPTION_PASSWORD, 'salt', 32);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(sqlBuffer), cipher.final()]);

    const finalBuffer = Buffer.concat([iv, encrypted]);
    await fs.writeFile(finalPath, finalBuffer);

    await fs.unlink(tempSqlPath).catch(() => {});

    return NextResponse.json({ 
      success: true, 
      isUsb: savedToUsb, 
      location: finalPath,
      message: "Database backup created successfully."
    });
  } catch (error: any) {
    console.error("Backup error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}