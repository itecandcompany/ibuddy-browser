import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';
import { z } from 'zod';
import type { IBuddyOCRNativeModule, OcrResult } from './types';

const ocrResultSchema = z.object({
  text: z.string().max(100_000),
  lines: z.array(z.object({
    text: z.string().max(2_000),
    confidence: z.number().min(0).max(1),
  })).max(2_000),
  engine: z.literal('apple-vision'),
  language: z.string().max(40),
});

export async function recognizeImageText(base64Image: string): Promise<OcrResult> {
  if (Platform.OS !== 'ios') {
    throw new Error('On-device Apple Vision OCR is currently available only on iOS.');
  }
  if (!base64Image || base64Image.length > 18_000_000) {
    throw new Error('Choose a valid image smaller than approximately 13 MB.');
  }
  const nativeModule = requireNativeModule<IBuddyOCRNativeModule>('IBuddyOCR');
  const result: unknown = await nativeModule.recognizeText(base64Image);
  const parsed = ocrResultSchema.safeParse(result);
  if (!parsed.success) throw new Error('The on-device OCR module returned an invalid response.');
  return parsed.data;
}
