import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type SupabaseUploaderPlugin from '../plugin/SupabaseUploaderPlugin';
import { SupabaseStorageService } from '../../infrastructure/storage/SupabaseStorageService';

/**
 * Plugin settings interface
 */
export interface PluginSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  bucketName: string;
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  bucketName: 'obsidian-images',
};

/**
 * Settings Tab for the Supabase Image Uploader plugin
 */
export class SettingsTab extends PluginSettingTab {
  plugin: SupabaseUploaderPlugin;

  constructor(app: App, plugin: SupabaseUploaderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Supabase Image Uploader Settings' });

    // Supabase URL
    new Setting(containerEl)
      .setName('Supabase URL')
      .setDesc('Your Supabase project URL (e.g., https://xxx.supabase.co)')
      .addText((text) =>
        text
          .setPlaceholder('https://your-project.supabase.co')
          .setValue(this.plugin.settings.supabaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.supabaseUrl = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // Supabase Anon Key
    new Setting(containerEl)
      .setName('Supabase Anon Key')
      .setDesc('Your Supabase anonymous (public) key')
      .addText((text) => {
        text
          .setPlaceholder('eyJhbGciOiJIUzI1NiIs...')
          .setValue(this.plugin.settings.supabaseAnonKey)
          .onChange(async (value) => {
            this.plugin.settings.supabaseAnonKey = value.trim();
            await this.plugin.saveSettings();
          });
        // Hide the input like a password field
        text.inputEl.type = 'password';
        return text;
      });

    // Bucket Name
    new Setting(containerEl)
      .setName('Bucket Name')
      .setDesc('The Supabase Storage bucket to upload images to')
      .addText((text) =>
        text
          .setPlaceholder('obsidian-images')
          .setValue(this.plugin.settings.bucketName)
          .onChange(async (value) => {
            this.plugin.settings.bucketName = value.trim();
            await this.plugin.saveSettings();
          })
      );

    // Test Connection Button
    new Setting(containerEl)
      .setName('Test Connection')
      .setDesc('Test the connection to your Supabase Storage')
      .addButton((button) =>
        button.setButtonText('Test').onClick(async () => {
          const { supabaseUrl, supabaseAnonKey, bucketName } = this.plugin.settings;

          if (!supabaseUrl || !supabaseAnonKey || !bucketName) {
            new Notice('Please fill in all Supabase settings first');
            return;
          }

          button.setButtonText('Testing...');
          button.setDisabled(true);

          try {
            const storageService = new SupabaseStorageService({
              url: supabaseUrl,
              anonKey: supabaseAnonKey,
              bucket: bucketName,
            });

            const result = await storageService.testConnection();

            if (result.success) {
              new Notice('✅ Connection successful!');
            } else {
              new Notice(`❌ ${result.message}`);
            }
          } catch (error) {
            new Notice(`❌ Connection failed: ${error}`);
          } finally {
            button.setButtonText('Test');
            button.setDisabled(false);
          }
        })
      );

    // Usage Instructions
    containerEl.createEl('h3', { text: 'Usage' });
    containerEl.createEl('p', {
      text: 'Once configured, simply paste (Ctrl/Cmd+V) or drag & drop images into your notes. They will be automatically uploaded to Supabase Storage and inserted as markdown links.',
    });

    // Supabase Setup Instructions
    containerEl.createEl('h3', { text: 'Supabase Setup' });
    const instructionsList = containerEl.createEl('ol');
    instructionsList.createEl('li', { text: 'Go to your Supabase Dashboard → Storage' });
    instructionsList.createEl('li', { text: 'Create a new bucket (e.g., "obsidian-images")' });
    instructionsList.createEl('li', { text: 'Set the bucket to Public' });
    instructionsList.createEl('li', {
      text: 'Add a policy to allow anonymous uploads: INSERT policy for anon role',
    });
  }
}
