import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IStorageService } from '../../domain/interfaces/IStorageService';
import { ImageFile } from '../../domain/entities/ImageFile';
import { UploadResult } from '../../domain/entities/UploadResult';

/**
 * Configuration for Supabase Storage Service
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucket: string;
}

/**
 * SupabaseStorageService
 *
 * Implementation of IStorageService that uploads files to Supabase Storage.
 */
export class SupabaseStorageService implements IStorageService {
  private client: SupabaseClient;
  private bucket: string;
  private baseUrl: string;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
    this.bucket = config.bucket;
    this.baseUrl = config.url;
  }

  /**
   * Upload an image file to Supabase Storage
   */
  async upload(file: ImageFile, path: string): Promise<UploadResult> {
    try {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .upload(path, file.data, {
          contentType: file.mimeType,
          upsert: false,
        });

      if (error) {
        return UploadResult.failure(`Upload failed: ${error.message}`);
      }

      // Generate public URL
      const { data: publicUrlData } = this.client.storage
        .from(this.bucket)
        .getPublicUrl(path);

      return UploadResult.success(publicUrlData.publicUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return UploadResult.failure(`Upload failed: ${errorMessage}`);
    }
  }

  /**
   * Test the connection to Supabase Storage
   * @returns true if connection is successful, error message otherwise
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.client.storage.listBuckets();

      if (error) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }

      const bucketExists = data.some((b) => b.name === this.bucket);
      if (!bucketExists) {
        return {
          success: false,
          message: `Bucket "${this.bucket}" not found. Available buckets: ${data.map((b) => b.name).join(', ')}`,
        };
      }

      return { success: true, message: 'Connection successful' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, message: `Connection failed: ${errorMessage}` };
    }
  }
}
