// frontend/app/(dashboard)/api/academic_years/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const JSON_PATH = path.join(process.cwd(), 'src', 'assets', 'resources', 'academic_years.json');

export async function GET() {
  try {
    const fileData = fs.readFileSync(JSON_PATH, 'utf8');

    // Check if file is empty before parsing
    if (!fileData || fileData.trim() === "") {
       return NextResponse.json({ 
         responseCode: 1, 
         responseMessage: "File is empty", 
         data: null 
       });
    }

    const data = JSON.parse(fileData);
    return NextResponse.json({ 
      responseCode: 0, 
      responseMessage: "Success", 
      data: data 
    });
  } catch (error) {
    console.error("JSON Read Error:", error);
    return NextResponse.json({ 
      responseCode: 1, 
      responseMessage: `Failed to read file: ${error}`, 
      data: null 
    }, { status: 500 });
  }
}

// MUST be named exactly POST
export async function POST(request: Request) {
    try {
        const body = await request.json();
        fs.writeFileSync(JSON_PATH, JSON.stringify(body, null, 2), 'utf8');
        return NextResponse.json({ 
            responseCode: 0, 
            responseMessage: "Updated successfully", 
            data: body 
        });
    } catch (error) {
        return NextResponse.json({ 
            responseCode: 1, 
            responseMessage: "Failed to write file", 
            data: null 
        }, { status: 500 });
    }
}