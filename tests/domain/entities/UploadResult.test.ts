import { UploadResult } from '../../../src/domain/entities/UploadResult';

describe('UploadResult Entity', () => {
  describe('success', () => {
    it('should create a successful result with URL', () => {
      const result = UploadResult.success('https://example.com/image.png');

      expect(result.isSuccess).toBe(true);
      expect(result.url).toBe('https://example.com/image.png');
      expect(result.error).toBeUndefined();
    });

    it('should generate markdown link', () => {
      const result = UploadResult.success('https://example.com/image.png');

      expect(result.toMarkdown()).toBe('![](https://example.com/image.png)');
    });

    it('should generate markdown link with alt text', () => {
      const result = UploadResult.success('https://example.com/image.png');

      expect(result.toMarkdown('My Image')).toBe('![My Image](https://example.com/image.png)');
    });
  });

  describe('failure', () => {
    it('should create a failed result with error message', () => {
      const result = UploadResult.failure('Network error');

      expect(result.isSuccess).toBe(false);
      expect(result.url).toBeUndefined();
      expect(result.error).toBe('Network error');
    });

    it('should throw when generating markdown for failed result', () => {
      const result = UploadResult.failure('Upload failed');

      expect(() => result.toMarkdown()).toThrow('Cannot generate markdown for failed upload');
    });
  });
});
