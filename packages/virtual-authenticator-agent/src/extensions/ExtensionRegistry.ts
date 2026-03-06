import type { Extension } from './Extension';

/**
 * Registry for managing WebAuthn extensions.
 *
 * Provides a central place to register extensions and look them up by identifier.
 * Extensions are registered once and can be retrieved for processing.
 */
export class ExtensionRegistry {
  private readonly extensions = new Map<string, Extension>();

  /**
   * Register an extension with the registry.
   *
   * @param extension - The extension instance to register
   * @throws Error if an extension with the same identifier is already registered
   */
  register(extension: Extension): this {
    if (this.extensions.has(extension.identifier)) {
      throw new Error(
        `Extension with identifier "${extension.identifier}" is already registered`,
      );
    }

    this.extensions.set(extension.identifier, extension);
    return this;
  }

  /**
   * Register multiple extensions at once.
   *
   * @param extensions - Array of extension instances to register
   */
  registerAll(extensions: Extension[]): this {
    for (const extension of extensions) {
      this.register(extension);
    }
    return this;
  }

  /**
   * Get an extension by its identifier.
   *
   * @param identifier - The extension identifier
   * @returns The extension instance, or undefined if not found
   */
  get(identifier: string): Extension | undefined {
    return this.extensions.get(identifier);
  }

  /**
   * Check if an extension is registered.
   *
   * @param identifier - The extension identifier
   * @returns True if the extension is registered
   */
  has(identifier: string): boolean {
    return this.extensions.has(identifier);
  }

  /**
   * Get all registered extensions.
   *
   * @returns Array of all registered extensions
   */
  all(): Extension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Get all registered extension identifiers.
   *
   * @returns Array of all registered extension identifiers
   */
  identifiers(): string[] {
    return Array.from(this.extensions.keys());
  }
}
