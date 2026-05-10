import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    
    // 1. API Key ን ከ .env ማምጣት (ባዶ ቦታዎችን ያጠፋል)
    const apiKey = process.env.AFROMESSAGE_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key አልተገኘም' }, { status: 500 });
    }

    // 2. ስልክ ቁጥሩን ማስተካከል (ለምሳሌ 0975052194 -> 251975052194)
    let clean = phoneNumber.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = clean.substring(1);
    if (clean.startsWith('251')) clean = clean.substring(3);
    const finalNumber = `251${clean}`;

    const message = "thankyou you are seccessfull";

    // 3. መፍትሄ፦ Token-ን በ Query Parameter መላክ (ለ 401 ስህተት ፍቱን መፍትሄ ነው)
    const url = `https://api.afromessage.com/api/send?token=${apiKey}&to=${finalNumber}&message=${encodeURIComponent(message)}&from=2`;

    console.log("Requesting AfroMessage with new Key...");

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    const responseText = await response.text();
    console.log("AfroMessage Raw Response:", responseText);

    // 401 ከመጣ Key-ው አሁንም ችግር አለበት
    if (response.status === 401) {
      return NextResponse.json({ 
        error: 'ያልተፈቀደ ሙከራ (401)። እባክዎ አዲስ API Key መፍጠርዎን እና ሰርቨርዎን Restart ማድረጉን ያረጋግጡ።' 
      }, { status: 401 });
    }

    const data = JSON.parse(responseText);
    if (data.acknowledge === 'success' || data.status === 'success') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ 
      error: data.errors?.[0] || 'መልዕክቱ አልተላከም' 
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: 'የሰርቨር ስህተት፡ ' + error.message }, { status: 500 });
  }
}