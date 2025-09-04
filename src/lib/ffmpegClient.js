/**
 * FFmpeg.wasm client wrapper for audio conversion
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegClient {
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.loaded = false;
    this.loading = false;
  }

  /**
   * Load FFmpeg with progress callback
   */
  async load(onProgress) {
    if (this.loaded) return;
    if (this.loading) {
      // Wait for existing load to complete
      while (this.loading && !this.loaded) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.loading = true;
    
    try {
      // Use CDN for ffmpeg.wasm assets
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      this.ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg:', message);
      });

      this.ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
          onProgress(progress * 100);
        }
      });

      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.loaded = true;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      throw new Error(`Failed to load FFmpeg: ${error.message}`);
    }
  }

  /**
   * Convert audio file to AIFF format
   */
  async convertToAIFF(inputFile, inputFormat = 'input', onProgress) {
    if (!this.loaded) {
      throw new Error('FFmpeg not loaded. Call load() first.');
    }

    const inputFileName = `input.${inputFormat}`;
    const outputFileName = 'output.aiff';

    try {
      // Write input file to FFmpeg filesystem
      await this.ffmpeg.writeFile(inputFileName, inputFile);

      // Run conversion command
      // -i input: input file
      // -acodec pcm_s16be: 16-bit PCM big-endian (AIFF standard)
      // -ar 44100: 44.1 kHz sample rate
      // -ac 2: stereo channels
      // -y: overwrite output file
      await this.ffmpeg.exec([
        '-i', inputFileName,
        '-acodec', 'pcm_s16be',
        '-ar', '44100',
        '-ac', '2',
        '-y',
        outputFileName
      ]);

      // Read output file
      const outputData = await this.ffmpeg.readFile(outputFileName);

      // Clean up files
      await this.cleanup([inputFileName, outputFileName]);

      return outputData;
    } catch (error) {
      // Clean up on error
      await this.cleanup([inputFileName, outputFileName]);
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  /**
   * Get supported input formats
   */
  async getSupportedFormats() {
    if (!this.loaded) {
      throw new Error('FFmpeg not loaded. Call load() first.');
    }

    try {
      await this.ffmpeg.exec(['-formats']);
      // This would require parsing the output, for now return common formats
      return [
        'mp3', 'wav', 'flac', 'm4a', 'ogg', 'opus', 'aac', 'wma'
      ];
    } catch (error) {
      console.warn('Could not get supported formats:', error);
      return ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'opus'];
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(filenames) {
    for (const filename of filenames) {
      try {
        await this.ffmpeg.deleteFile(filename);
      } catch (error) {
        console.warn(`Could not delete file ${filename}:`, error);
      }
    }
  }

  /**
   * Terminate FFmpeg instance
   */
  terminate() {
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
    }
    this.loaded = false;
    this.loading = false;
  }
}

// Create singleton instance
export const ffmpegClient = new FFmpegClient();

/**
 * Convert file to AIFF with automatic format detection
 */
export async function convertFileToAIFF(file, onProgress) {
  // Load FFmpeg if not already loaded
  await ffmpegClient.load(onProgress);

  // Determine input format from file extension
  const fileName = file.name || 'input';
  const extension = fileName.split('.').pop()?.toLowerCase() || 'mp3';

  // Convert file to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert to AIFF
  const outputData = await ffmpegClient.convertToAIFF(uint8Array, extension, onProgress);

  return outputData;
}

/**
 * Convert URL to AIFF with automatic format detection
 */
export async function convertUrlToAIFF(url, onProgress) {
  // Load FFmpeg if not already loaded
  await ffmpegClient.load(onProgress);

  // Fetch the file
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Determine format from URL or Content-Type
  const contentType = response.headers.get('content-type') || '';
  let extension = 'mp3'; // default

  if (contentType.includes('flac')) extension = 'flac';
  else if (contentType.includes('wav')) extension = 'wav';
  else if (contentType.includes('m4a') || contentType.includes('mp4')) extension = 'm4a';
  else if (contentType.includes('ogg')) extension = 'ogg';
  else if (contentType.includes('opus')) extension = 'opus';
  else {
    // Try to get extension from URL
    const urlPath = new URL(url).pathname;
    const urlExt = urlPath.split('.').pop()?.toLowerCase();
    if (urlExt && ['mp3', 'wav', 'flac', 'm4a', 'ogg', 'opus'].includes(urlExt)) {
      extension = urlExt;
    }
  }

  // Convert to AIFF
  const outputData = await ffmpegClient.convertToAIFF(uint8Array, extension, onProgress);

  return outputData;
}
