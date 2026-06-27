import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API key:', apiKey ? `${apiKey.substring(0, 6)}...` : 'None');

if (!apiKey) {
  console.error('No GEMINI_API_KEY found in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    console.log('Sending test request to Gemini...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello, respond with exactly "OK" if you can hear me.',
    });
    console.log('SUCCESS!');
    console.log('Response text:', response.text);
  } catch (error) {
    console.error('Error occurred:');
    console.error(error);
  }
}

run();
