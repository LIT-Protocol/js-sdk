/**
 * Infer MIME type from data type
 */
export function inferMimeTypeFromDataType(
  dataType: 'image' | 'video' | 'file'
): string {
  switch (dataType) {
    case 'image':
      return 'image/jpeg'; // Default to JPEG for images
    case 'video':
      return 'video/mp4'; // Default to MP4 for videos
    case 'file':
      return 'application/octet-stream'; // Generic binary for files
    default:
      return 'application/octet-stream';
  }
}

/**
 * Infer data type from input data and create appropriate metadata
 */
export function inferDataType(
  data: any
): 'uint8array' | 'string' | 'json' | 'buffer' | 'image' | 'video' | 'file' {
  if (data instanceof Uint8Array) {
    return 'uint8array';
  }
  if (Buffer.isBuffer(data)) {
    return 'buffer';
  }
  if (typeof data === 'string') {
    return 'string';
  }
  if (typeof data === 'object' && data !== null) {
    // Check if it's a File object
    if (typeof File !== 'undefined' && data instanceof File) {
      if (data.type.startsWith('image/')) return 'image';
      if (data.type.startsWith('video/')) return 'video';
      return 'file';
    }
    // Check if it's a Blob object
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      if (data.type.startsWith('image/')) return 'image';
      if (data.type.startsWith('video/')) return 'video';
      return 'file';
    }
    // Otherwise treat as JSON object
    return 'json';
  }
  return 'uint8array';
}

export function convertDecryptedData(
  data: Uint8Array,
  dataType?:
    | 'uint8array'
    | 'string'
    | 'json'
    | 'buffer'
    | 'image'
    | 'video'
    | 'file',
  metadata?: {
    mimeType?: string;
    filename?: string;
    size?: number;
    custom?: Record<string, any>;
  }
): string | object | Buffer | Uint8Array | Blob | File {
  if (!dataType || dataType === 'uint8array') {
    return data;
  }

  switch (dataType) {
    case 'string':
      return new TextDecoder().decode(data);
    case 'json':
      try {
        const str = new TextDecoder().decode(data);
        return JSON.parse(str);
      } catch (error) {
        throw new Error(`Failed to parse decrypted data as JSON: ${error}`);
      }
    case 'buffer':
      return Buffer.from(data);
    case 'image':
    case 'video':
    case 'file': {
      const mimeType =
        metadata?.mimeType || inferMimeTypeFromDataType(dataType);
      const filename = metadata?.filename;

      // In browser environment, create File or Blob objects
      if (typeof File !== 'undefined' && filename) {
        return new File([data], filename, { type: mimeType });
      } else if (typeof Blob !== 'undefined') {
        return new Blob([data], { type: mimeType });
      } else {
        // In Node.js environment, return Buffer with metadata
        const buffer = Buffer.from(data);
        (buffer as any)._litMetadata = { mimeType, filename };
        return buffer;
      }
    }
    default:
      throw new Error(`Unsupported data type: ${dataType}`);
  }
}

/**
 * Extract metadata from File or Blob objects
 */
export function extractFileMetadata(data: any): {
  mimeType?: string;
  filename?: string;
  size?: number;
} {
  const metadata: any = {};

  if (typeof File !== 'undefined' && data instanceof File) {
    metadata.mimeType = data.type;
    metadata.filename = data.name;
    metadata.size = data.size;
  } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
    metadata.mimeType = data.type;
    metadata.size = data.size;
  }

  return metadata;
}
