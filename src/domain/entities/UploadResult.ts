/**
 * UploadResult Entity
 *
 * Represents the result of an image upload operation.
 * Uses the Result pattern to handle success/failure states.
 */
export class UploadResult {
  readonly isSuccess: boolean;
  readonly url?: string;
  readonly error?: string;

  private constructor(params: { isSuccess: boolean; url?: string; error?: string }) {
    this.isSuccess = params.isSuccess;
    this.url = params.url;
    this.error = params.error;
  }

  /**
   * Create a successful upload result
   */
  static success(url: string): UploadResult {
    return new UploadResult({
      isSuccess: true,
      url,
    });
  }

  /**
   * Create a failed upload result
   */
  static failure(error: string): UploadResult {
    return new UploadResult({
      isSuccess: false,
      error,
    });
  }

  /**
   * Generate markdown image syntax for the uploaded image
   * @param altText Optional alt text for the image
   * @throws Error if the upload was not successful
   */
  toMarkdown(altText: string = ''): string {
    if (!this.isSuccess || !this.url) {
      throw new Error('Cannot generate markdown for failed upload');
    }
    return `![${altText}](${this.url})`;
  }
}
