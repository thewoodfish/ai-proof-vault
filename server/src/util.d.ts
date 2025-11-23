/**
 * Call OpenAI's GPT-4 Vision model to describe an image
 * @param imageBuffer - The image as a Buffer
 * @param apiKey - OpenAI API key
 * @returns Object with description and model name
 */
declare function callOpenAIVision(imageBuffer: Buffer, apiKey: string): Promise<{
    description: string;
    modelName: string;
}>;
/**
 * Call Grok's vision model to describe an image
 * @param imageBuffer - The image as a Buffer
 * @param apiKey - Grok API key (xAI)
 * @returns Object with description and model name
 */
declare function callGrokVision(imageBuffer: Buffer, apiKey: string): Promise<{
    description: string;
    modelName: string;
}>;
/**
 * Detect MIME type from image buffer
 * @param buffer - Image buffer
 * @returns MIME type string
 */
declare function detectMimeType(buffer: Buffer): string;
export { callOpenAIVision, callGrokVision, detectMimeType };
//# sourceMappingURL=util.d.ts.map