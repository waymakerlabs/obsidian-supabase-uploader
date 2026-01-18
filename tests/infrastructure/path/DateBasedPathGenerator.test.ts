import { DateBasedPathGenerator } from '../../../src/infrastructure/path/DateBasedPathGenerator';

describe('DateBasedPathGenerator', () => {
  let generator: DateBasedPathGenerator;

  beforeEach(() => {
    generator = new DateBasedPathGenerator();
  });

  describe('generate', () => {
    it('should generate path with YYYY/MM/DD format', () => {
      const path = generator.generate('test.png');

      // Path should match pattern: YYYY/MM/DD/uuid.ext
      const pattern = /^\d{4}\/\d{2}\/\d{2}\/[a-f0-9-]+\.png$/;
      expect(path).toMatch(pattern);
    });

    it('should use current date', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const path = generator.generate('image.jpg');

      expect(path.startsWith(`${year}/${month}/${day}/`)).toBe(true);
    });

    it('should preserve file extension', () => {
      const pngPath = generator.generate('test.png');
      const jpgPath = generator.generate('photo.jpg');
      const gifPath = generator.generate('animation.gif');
      const webpPath = generator.generate('modern.webp');

      expect(pngPath.endsWith('.png')).toBe(true);
      expect(jpgPath.endsWith('.jpg')).toBe(true);
      expect(gifPath.endsWith('.gif')).toBe(true);
      expect(webpPath.endsWith('.webp')).toBe(true);
    });

    it('should generate unique paths for same filename', () => {
      const path1 = generator.generate('test.png');
      const path2 = generator.generate('test.png');

      expect(path1).not.toBe(path2);
    });

    it('should handle filename without extension', () => {
      const path = generator.generate('noextension');

      // Should still generate a valid path
      expect(path).toMatch(/^\d{4}\/\d{2}\/\d{2}\/[a-f0-9-]+$/);
    });

    it('should handle filename with multiple dots', () => {
      const path = generator.generate('my.image.file.png');

      expect(path.endsWith('.png')).toBe(true);
    });
  });

  describe('with custom date provider', () => {
    it('should use provided date for path generation', () => {
      const fixedDate = new Date('2024-06-15');
      const customGenerator = new DateBasedPathGenerator(() => fixedDate);

      const path = customGenerator.generate('test.png');

      expect(path.startsWith('2024/06/15/')).toBe(true);
    });
  });
});
