export type OcrLine = { text: string; confidence: number };
export type OcrResult = {
  text: string;
  lines: OcrLine[];
  engine: 'apple-vision';
  language: string;
};
export interface IBuddyOCRNativeModule {
  recognizeText(base64Image: string): Promise<OcrResult>;
}
