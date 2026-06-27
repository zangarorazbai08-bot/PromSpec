import { imageProcessingService } from '../src/services/imageProcessingService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create a small 1x1 pixel base64 GIF or JPEG
const base64Image = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

async function test() {
  console.log('Testing imageProcessingService.analyzeImageBase64 with base64 image...');
  const result = await imageProcessingService.analyzeImageBase64(base64Image);
  console.log('Result:', JSON.stringify(result, null, 2));
}

test();
