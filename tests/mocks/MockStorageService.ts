import { IStorageService } from '../../src/domain/interfaces/IStorageService';
import { ImageFile } from '../../src/domain/entities/ImageFile';
import { UploadResult } from '../../src/domain/entities/UploadResult';

/**
 * Mock implementation of IStorageService for testing
 */
export class MockStorageService implements IStorageService {
  private shouldFail: boolean = false;
  private failureMessage: string = 'Mock upload failed';
  public uploadedFiles: Array<{ file: ImageFile; path: string }> = [];
  public baseUrl: string = 'https://mock-storage.example.com';

  /**
   * Configure the mock to fail on next upload
   */
  setFailure(shouldFail: boolean, message?: string): void {
    this.shouldFail = shouldFail;
    if (message) {
      this.failureMessage = message;
    }
  }

  /**
   * Reset the mock state
   */
  reset(): void {
    this.shouldFail = false;
    this.failureMessage = 'Mock upload failed';
    this.uploadedFiles = [];
  }

  async upload(file: ImageFile, path: string): Promise<UploadResult> {
    if (this.shouldFail) {
      return UploadResult.failure(this.failureMessage);
    }

    this.uploadedFiles.push({ file, path });
    const url = `${this.baseUrl}/${path}`;
    return UploadResult.success(url);
  }
}
