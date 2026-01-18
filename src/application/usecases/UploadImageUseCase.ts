import { ImageFile, ImageFileParams, ImageValidationError } from '../../domain/entities/ImageFile';
import { UploadResult } from '../../domain/entities/UploadResult';
import { IStorageService } from '../../domain/interfaces/IStorageService';
import { IPathGenerator } from '../../domain/interfaces/IPathGenerator';

/**
 * UploadImageUseCase
 *
 * Application use case for uploading images to storage.
 * Orchestrates the image validation, path generation, and upload process.
 */
export class UploadImageUseCase {
  constructor(
    private readonly storageService: IStorageService,
    private readonly pathGenerator: IPathGenerator
  ) {}

  /**
   * Execute the upload use case with a pre-validated ImageFile
   * @param imageFile Validated ImageFile entity
   * @returns Promise resolving to UploadResult
   */
  async execute(imageFile: ImageFile): Promise<UploadResult> {
    // Generate storage path
    const path = this.pathGenerator.generate(imageFile.normalizedName);

    // Upload to storage
    return this.storageService.upload(imageFile, path);
  }

  /**
   * Execute the upload use case from raw file data
   * Handles validation internally and returns failure result if invalid
   * @param params Raw file parameters
   * @returns Promise resolving to UploadResult
   */
  async executeFromRaw(params: ImageFileParams): Promise<UploadResult> {
    try {
      // Create and validate ImageFile
      const imageFile = ImageFile.create(params);

      // Execute the upload
      return this.execute(imageFile);
    } catch (error) {
      if (error instanceof ImageValidationError) {
        return UploadResult.failure(error.message);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return UploadResult.failure(errorMessage);
    }
  }
}
