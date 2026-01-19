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
   * Delete an image file from Supabase Storage
   * @param path The path of the file to delete
   * @returns Promise with success status and message
   */
  async delete(path: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await this.client.storage
        .from(this.bucket)
        .remove([path]);

      if (error) {
        return { success: false, message: `Delete failed: ${error.message}` };
      }

      return { success: true, message: 'Image deleted successfully' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, message: `Delete failed: ${errorMessage}` };
    }
  }

  /**
   * Extract the storage path from a public URL
   * @param url The public URL of the image
   * @returns The storage path or null if not a valid Supabase URL
   */
  extractPathFromUrl(url: string): string | null {
    try {
      // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.png
      // Or custom domain: https://supabase.example.com/storage/v1/object/public/bucket-name/path/to/file.png
      const pattern = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
      const match = url.match(pattern);

      if (match && match[1] === this.bucket) {
        return match[2]; // Return the path after bucket name
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if a URL belongs to this Supabase storage
   */
  isSupabaseUrl(url: string): boolean {
    return url.includes(this.baseUrl) && url.includes('/storage/v1/object/public/');
  }

  /**
   * Test the connection to Supabase Storage
   * Tests by attempting to list files in the bucket (works with anon key)
   * @returns true if connection is successful, error message otherwise
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Try to list files in the bucket (limit to 1 for efficiency)
      // This works with anon key if the bucket has proper RLS policies
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .list('', { limit: 1 });

      if (error) {
        // Check for common error types
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          return { success: false, message: `Bucket "${this.bucket}" not found` };
        }
        return { success: false, message: `Connection failed: ${error.message}` };
      }

      return { success: true, message: 'Connection successful' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, message: `Connection failed: ${errorMessage}` };
    }
  }
}
