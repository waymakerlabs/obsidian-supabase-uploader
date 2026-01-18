/**
 * Path Generator Interface
 *
 * Defines the contract for generating storage paths for uploaded files.
 * Different implementations can provide different path strategies
 * (date-based, UUID-based, user-based, etc.)
 */
export interface IPathGenerator {
  /**
   * Generate a storage path for a file
   * @param filename The original filename
   * @returns The generated storage path
   */
  generate(filename: string): string;
}
