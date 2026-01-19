import { App, PluginSettingTab, Setting, Notice, setIcon } from 'obsidian';
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
 * Connection status type
 */
type ConnectionStatus = 'unknown' | 'testing' | 'connected' | 'disconnected';

/**
 * Settings Tab for the Supabase Image Uploader plugin
 */
export class SettingsTab extends PluginSettingTab {
  plugin: SupabaseUploaderPlugin;
  private connectionStatus: ConnectionStatus = 'unknown';
  private statusBadgeEl: HTMLElement | null = null;

  constructor(app: App, plugin: SupabaseUploaderPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('supabase-uploader-settings');

    // Header with status badge
    const headerContainer = containerEl.createDiv({ cls: 'settings-header' });
    headerContainer.createEl('h2', { text: 'Supabase Image Uploader' });
    this.statusBadgeEl = headerContainer.createSpan({ cls: 'connection-badge unknown' });
    this.updateStatusBadge();

    // ─────────────────────────────────────────────────────────────
    // Connection Settings Section
    // ─────────────────────────────────────────────────────────────
    this.createSectionHeader(containerEl, 'Connection');

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
            this.setConnectionStatus('unknown');
          })
      );

    // Supabase Anon Key with show/hide toggle
    let isKeyVisible = false;
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
            this.setConnectionStatus('unknown');
          });
        text.inputEl.type = 'password';
        text.inputEl.addClass('api-key-input');
        return text;
      })
      .addExtraButton((button) => {
        button
          .setIcon('eye')
          .setTooltip('Show/Hide API Key')
          .onClick(() => {
            const input = containerEl.querySelector('.api-key-input') as HTMLInputElement;
            if (input) {
              isKeyVisible = !isKeyVisible;
              input.type = isKeyVisible ? 'text' : 'password';
              button.setIcon(isKeyVisible ? 'eye-off' : 'eye');
            }
          });
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
            this.setConnectionStatus('unknown');
          })
      );

    // Test Connection Button
    new Setting(containerEl)
      .setName('Test Connection')
      .setDesc('Verify your Supabase configuration')
      .addButton((button) =>
        button
          .setButtonText('Test Connection')
          .setCta()
          .onClick(async () => {
            await this.testConnection(button);
          })
      );

    // ─────────────────────────────────────────────────────────────
    // Usage Section
    // ─────────────────────────────────────────────────────────────
    this.createSectionHeader(containerEl, 'Usage');

    const usageContainer = containerEl.createDiv({ cls: 'settings-info-box' });
    usageContainer.createEl('p', {
      text: 'Once configured, simply paste (Ctrl/Cmd+V) or drag & drop images into your notes.',
    });

    const featureList = usageContainer.createEl('ul', { cls: 'settings-feature-list' });
    featureList.createEl('li', { text: '📋 Paste from clipboard → Auto upload' });
    featureList.createEl('li', { text: '🖱️ Drag & drop files → Auto upload' });
    featureList.createEl('li', { text: '🗑️ Right-click image → Delete from Supabase' });

    // ─────────────────────────────────────────────────────────────
    // Setup Guide Section
    // ─────────────────────────────────────────────────────────────
    this.createSectionHeader(containerEl, 'Supabase Setup Guide');

    const guideContainer = containerEl.createDiv({ cls: 'settings-info-box' });
    const instructionsList = guideContainer.createEl('ol', { cls: 'settings-steps' });
    instructionsList.createEl('li', { text: 'Go to your Supabase Dashboard → Storage' });
    instructionsList.createEl('li', { text: 'Create a new bucket (e.g., "obsidian-images")' });
    instructionsList.createEl('li', { text: 'Set the bucket to Public' });
    instructionsList.createEl('li', { text: 'Add RLS policies for INSERT (and optionally DELETE)' });

    // Documentation link
    const linkContainer = guideContainer.createDiv({ cls: 'settings-link-container' });
    const docLink = linkContainer.createEl('a', {
      text: '📖 View full documentation',
      href: 'https://github.com/waymakerlabs/obsidian-supabase-uploader#readme',
    });
    docLink.setAttr('target', '_blank');
  }

  /**
   * Create a section header
   */
  private createSectionHeader(container: HTMLElement, title: string): void {
    container.createEl('div', { cls: 'settings-section-header', text: title });
  }

  /**
   * Update the connection status badge
   */
  private updateStatusBadge(): void {
    if (!this.statusBadgeEl) return;

    this.statusBadgeEl.empty();
    this.statusBadgeEl.className = `connection-badge ${this.connectionStatus}`;

    const statusConfig = {
      unknown: { icon: 'help-circle', text: 'Not tested' },
      testing: { icon: 'loader', text: 'Testing...' },
      connected: { icon: 'check-circle', text: 'Connected' },
      disconnected: { icon: 'x-circle', text: 'Disconnected' },
    };

    const config = statusConfig[this.connectionStatus];
    const iconSpan = this.statusBadgeEl.createSpan({ cls: 'badge-icon' });
    setIcon(iconSpan, config.icon);
    this.statusBadgeEl.createSpan({ text: config.text });
  }

  /**
   * Set connection status and update badge
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.updateStatusBadge();
  }

  /**
   * Test the connection to Supabase
   */
  private async testConnection(button: any): Promise<void> {
    const { supabaseUrl, supabaseAnonKey, bucketName } = this.plugin.settings;

    if (!supabaseUrl || !supabaseAnonKey || !bucketName) {
      new Notice('Please fill in all Supabase settings first');
      return;
    }

    button.setButtonText('Testing...');
    button.setDisabled(true);
    this.setConnectionStatus('testing');

    try {
      const storageService = new SupabaseStorageService({
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
        bucket: bucketName,
      });

      const result = await storageService.testConnection();

      if (result.success) {
        new Notice('✅ Connection successful!');
        this.setConnectionStatus('connected');
      } else {
        new Notice(`❌ ${result.message}`);
        this.setConnectionStatus('disconnected');
      }
    } catch (error) {
      new Notice(`❌ Connection failed: ${error}`);
      this.setConnectionStatus('disconnected');
    } finally {
      button.setButtonText('Test Connection');
      button.setDisabled(false);
    }
  }
}
