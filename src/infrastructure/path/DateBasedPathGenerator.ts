import { IPathGenerator } from '../../domain/interfaces/IPathGenerator';

/**
 * Generates a UUID v4 string
 * Simple implementation without external dependencies
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * DateBasedPathGenerator
 *
 * Generates storage paths using the current date in YYYY/MM/DD format.
 * Each file gets a unique UUID to prevent collisions.
 *
 * Example output: "2024/06/15/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d.png"
 */
export class DateBasedPathGenerator implements IPathGenerator {
  private readonly dateProvider: () => Date;

  /**
   * @param dateProvider Optional function to provide the current date (useful for testing)
   */
  constructor(dateProvider: () => Date = () => new Date()) {
    this.dateProvider = dateProvider;
  }

  /**
   * Generate a storage path for a file
   * @param filename The original filename
   * @returns Path in format: YYYY/MM/DD/uuid.extension
   */
  generate(filename: string): string {
    const date = this.dateProvider();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const uuid = generateUUID();
    const extension = this.extractExtension(filename);

    const datePath = `${year}/${month}/${day}`;

    if (extension) {
      return `${datePath}/${uuid}.${extension}`;
    }

    return `${datePath}/${uuid}`;
  }

  /**
   * Extract file extension from filename
   */
  private extractExtension(filename: string): string | null {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
      return null;
    }
    return filename.slice(lastDotIndex + 1).toLowerCase();
  }
}
