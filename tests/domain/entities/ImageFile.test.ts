import { ImageFile, ImageValidationError } from '../../../src/domain/entities/ImageFile';

describe('ImageFile Entity', () => {
  describe('create', () => {
    it('should create a valid ImageFile for PNG', () => {
      const buffer = Buffer.from('fake-image-data');
      const imageFile = ImageFile.create({
        name: 'test.png',
        mimeType: 'image/png',
        data: buffer,
        size: buffer.length,
      });

      expect(imageFile.name).toBe('test.png');
      expect(imageFile.mimeType).toBe('image/png');
      expect(imageFile.extension).toBe('png');
    });

    it('should create a valid ImageFile for JPEG', () => {
      const buffer = Buffer.from('fake-image-data');
      const imageFile = ImageFile.create({
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
        data: buffer,
        size: buffer.length,
      });

      expect(imageFile.mimeType).toBe('image/jpeg');
      expect(imageFile.extension).toBe('jpg');
    });

    it('should create a valid ImageFile for GIF', () => {
      const buffer = Buffer.from('fake-image-data');
      const imageFile = ImageFile.create({
        name: 'animation.gif',
        mimeType: 'image/gif',
        data: buffer,
        size: buffer.length,
      });

      expect(imageFile.mimeType).toBe('image/gif');
      expect(imageFile.extension).toBe('gif');
    });

    it('should create a valid ImageFile for WebP', () => {
      const buffer = Buffer.from('fake-image-data');
      const imageFile = ImageFile.create({
        name: 'modern.webp',
        mimeType: 'image/webp',
        data: buffer,
        size: buffer.length,
      });

      expect(imageFile.mimeType).toBe('image/webp');
      expect(imageFile.extension).toBe('webp');
    });
  });

  describe('validation - MIME type', () => {
    it('should throw error for unsupported MIME type', () => {
      const buffer = Buffer.from('fake-data');

      expect(() => {
        ImageFile.create({
          name: 'document.pdf',
          mimeType: 'application/pdf',
          data: buffer,
          size: buffer.length,
        });
      }).toThrow(ImageValidationError);
    });

    it('should throw error for text files', () => {
      const buffer = Buffer.from('text content');

      expect(() => {
        ImageFile.create({
          name: 'readme.txt',
          mimeType: 'text/plain',
          data: buffer,
          size: buffer.length,
        });
      }).toThrow(ImageValidationError);
    });
  });

  describe('validation - file size', () => {
    it('should throw error when file exceeds 10MB', () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      expect(() => {
        ImageFile.create({
          name: 'huge.png',
          mimeType: 'image/png',
          data: largeBuffer,
          size: largeBuffer.length,
        });
      }).toThrow(ImageValidationError);
    });

    it('should accept file at exactly 10MB', () => {
      const maxBuffer = Buffer.alloc(10 * 1024 * 1024); // exactly 10MB

      const imageFile = ImageFile.create({
        name: 'max-size.png',
        mimeType: 'image/png',
        data: maxBuffer,
        size: maxBuffer.length,
      });

      expect(imageFile).toBeDefined();
    });
  });

  describe('filename normalization', () => {
    it('should normalize filename with spaces', () => {
      const buffer = Buffer.from('fake-image-data');
      const imageFile = ImageFile.create({
        name: 'my image file.png',
        mimeType: 'image/png',
        data: buffer,
        size: buffer.length,
      });

      expect(imageFile.normalizedName).toBe('my-image-file.png');
    });

    it('should normalize filename with special characters', () => {
      const buffer = Buffer.from('fake-image-data');
      const imageFile = ImageFile.create({
        name: 'image@2024!#test.png',
        mimeType: 'image/png',
        data: buffer,
        size: buffer.length,
      });

      expect(imageFile.normalizedName).toMatch(/^[a-z0-9-]+\.png$/);
    });

    it('should handle Korean filename', () => {
      const buffer = Buffer.from('fake-image-data');
      const imageFile = ImageFile.create({
        name: '스크린샷.png',
        mimeType: 'image/png',
        data: buffer,
        size: buffer.length,
      });

      // Korean characters should be replaced, but extension preserved
      expect(imageFile.normalizedName).toMatch(/\.png$/);
    });
  });
});
