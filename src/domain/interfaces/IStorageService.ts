import { ImageFile } from '../entities/ImageFile';
import { UploadResult } from '../entities/UploadResult';

/**
 * Storage Service Interface
 *
 * Defines the contract for uploading images to a storage backend.
 * This interface allows for different implementations (Supabase, S3, local, etc.)
 */
export interface IStorageService {
  /**
   * Upload an image file to the storage
   * @param file The image file to upload
   * @param path The destination path in the storage
   * @returns Promise resolving to the upload result
   */
  upload(file: ImageFile, path: string): Promise<UploadResult>;
}
