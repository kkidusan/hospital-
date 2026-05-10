import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const result: any[] = [];

    for (const row of jsonData) {
      const code = row['Code'] || row['code'];
      if (!code || String(code).trim() === '') continue;

      const title = row['Title'] || row['title'] || '';

      // Determine Chapter
      let chapter = 'Unknown';
      const chapterNo = row['ChapterNo'];

      if (chapterNo) {
        chapter = `Chapter ${String(chapterNo).padStart(2, '0')}`;
      } else if (String(code).startsWith('1')) {
        chapter = 'Chapter 01';
      } else if (String(code).startsWith('2')) {
        chapter = 'Chapter 02';
      } else if (String(code).startsWith('BA')) {
        chapter = 'Chapter 11';
      }

      result.push({
        icdCode: String(code).trim(),
        name: String(title).trim(),
        category: chapter
      });
    }

    return NextResponse.json({
      message: 'Conversion successful',
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}