import { IPathGenerator } from '../../src/domain/interfaces/IPathGenerator';

/**
 * Mock implementation of IPathGenerator for testing
 */
export class MockPathGenerator implements IPathGenerator {
  private callCount: number = 0;
  private customPath: string | null = null;

  /**
   * Set a custom path to return
   */
  setPath(path: string): void {
    this.customPath = path;
  }

  /**
   * Reset the mock state
   */
  reset(): void {
    this.callCount = 0;
    this.customPath = null;
  }

  /**
   * Get the number of times generate was called
   */
  getCallCount(): number {
    return this.callCount;
  }

  generate(filename: string): string {
    this.callCount++;

    if (this.customPath) {
      return this.customPath;
    }

    // Return a predictable path for testing
    const extension = filename.split('.').pop() || 'bin';
    return `mock/path/${this.callCount}.${extension}`;
  }
}
