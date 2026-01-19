/**
 * Supported image MIME types
 */
const SUPPORTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;

type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Extension mapping for MIME types
 */
const MIME_TO_EXTENSION: Record<SupportedMimeType, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

/**
 * Custom error for image validation failures
 */
export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

/**
 * Input parameters for creating an ImageFile
 */
export interface ImageFileParams {
  name: string;
  mimeType: string;
  data: ArrayBuffer | Buffer;
  size: number;
}

/**
 * ImageFile Entity
 *
 * Represents an image file with validation rules.
 * This is a Domain entity that has no dependencies on external libraries.
 */
export class ImageFile {
  readonly name: string;
  readonly mimeType: SupportedMimeType;
  readonly data: ArrayBuffer | Buffer;
  readonly size: number;
  readonly extension: string;
  readonly normalizedName: string;

  private constructor(params: {
    name: string;
    mimeType: SupportedMimeType;
    data: ArrayBuffer | Buffer;
    size: number;
  }) {
    this.name = params.name;
    this.mimeType = params.mimeType;
    this.data = params.data;
    this.size = params.size;
    this.extension = MIME_TO_EXTENSION[params.mimeType];
    this.normalizedName = this.normalizeName(params.name);
  }

  /**
   * Factory method to create an ImageFile with validation
   */
  static create(params: ImageFileParams): ImageFile {
    // Validate MIME type (type guard narrows mimeType to SupportedMimeType)
    const { mimeType } = params;
    if (!this.isSupportedMimeType(mimeType)) {
      throw new ImageValidationError(
        `Unsupported MIME type: ${mimeType}. Supported types: ${SUPPORTED_MIME_TYPES.join(', ')}`
      );
    }

    // Validate file size
    if (params.size > MAX_FILE_SIZE) {
      throw new ImageValidationError(
        `File size ${params.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes (10MB)`
      );
    }

    return new ImageFile({
      name: params.name,
      mimeType,
      data: params.data,
      size: params.size,
    });
  }

  /**
   * Check if the MIME type is supported
   */
  private static isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
    return SUPPORTED_MIME_TYPES.includes(mimeType as SupportedMimeType);
  }

  /**
   * Normalize filename to be URL-safe
   */
  private normalizeName(name: string): string {
    // Get extension
    const ext = this.extension;

    // Remove extension from name
    const baseName = name.replace(/\.[^.]+$/, '');

    // Convert to lowercase, replace spaces with hyphens
    // Remove non-alphanumeric characters except hyphens
    const normalized = baseName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // If normalized name is empty (e.g., all Korean characters), use 'image'
    const finalName = normalized || 'image';

    return `${finalName}.${ext}`;
  }
}
