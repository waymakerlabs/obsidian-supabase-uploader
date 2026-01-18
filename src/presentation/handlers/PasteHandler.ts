import { Editor, MarkdownView, Notice } from 'obsidian';
import { UploadImageUseCase } from '../../application/usecases/UploadImageUseCase';

/**
 * PasteHandler
 *
 * Handles paste events in the editor and uploads images to storage.
 */
export class PasteHandler {
  private readonly uploadUseCase: UploadImageUseCase;
  private isConfigured: () => boolean;

  constructor(uploadUseCase: UploadImageUseCase, isConfigured: () => boolean) {
    this.uploadUseCase = uploadUseCase;
    this.isConfigured = isConfigured;
  }

  /**
   * Handle the paste event
   * @param evt The clipboard event
   * @param editor The Obsidian editor instance
   * @param view The markdown view
   * @returns true if the event was handled, false otherwise
   */
  async handle(evt: ClipboardEvent, editor: Editor, view: MarkdownView): Promise<boolean> {
    // Check if plugin is configured
    if (!this.isConfigured()) {
      return false; // Let Obsidian handle the paste
    }

    const files = evt.clipboardData?.files;
    if (!files || files.length === 0) {
      return false; // No files in clipboard, let Obsidian handle it
    }

    // Check if any file is an image
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      return false; // No images, let Obsidian handle it
    }

    // Prevent default paste behavior
    evt.preventDefault();

    // Process each image
    for (const file of imageFiles) {
      await this.processImage(file, editor);
    }

    return true;
  }

  /**
   * Process and upload a single image file
   */
  private async processImage(file: File, editor: Editor): Promise<void> {
    // Insert placeholder
    const cursor = editor.getCursor();
    const placeholder = `![Uploading ${file.name}...]()`;
    editor.replaceRange(placeholder, cursor);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Execute upload
      const result = await this.uploadUseCase.executeFromRaw({
        name: file.name,
        mimeType: file.type,
        data: arrayBuffer,
        size: file.size,
      });

      // Replace placeholder with result
      const content = editor.getValue();
      if (result.isSuccess) {
        const markdown = result.toMarkdown();
        editor.setValue(content.replace(placeholder, markdown));
        new Notice('✅ Image uploaded successfully');
      } else {
        editor.setValue(content.replace(placeholder, `<!-- Upload failed: ${result.error} -->`));
        new Notice(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const content = editor.getValue();
      editor.setValue(content.replace(placeholder, `<!-- Upload failed: ${errorMessage} -->`));
      new Notice(`❌ Upload failed: ${errorMessage}`);
    }
  }
}
