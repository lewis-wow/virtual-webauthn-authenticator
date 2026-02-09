import type { ExtensionRegistry } from './ExtensionRegistry';

export type ProcessInputsOptions<TContext> = {
  /**
   * The extensions object from the credential options (e.g., from PublicKeyCredentialCreationOptions.extensions)
   */
  extensions: Record<string, unknown> | undefined;

  /**
   * Context passed to each extension's processInput method
   */
  context: TContext;

  /**
   * Check if an extension identifier is supported by this client
   */
  isClientExtension: (extensionId: string) => boolean;

  /**
   * Check if an extension identifier requires authenticator processing
   */
  isAuthenticatorExtension: (extensionId: string) => boolean;
};

export type ProcessInputsResult = {
  /**
   * Extensions that passed client validation, keyed by extension identifier
   */
  clientExtensions: Record<string, unknown>;

  /**
   * Authenticator extension inputs (CBOR), keyed by extension identifier
   */
  authenticatorExtensions: Record<string, unknown>;
};

export type ProcessOutputsOptions<TContext> = {
  /**
   * The client extensions that were processed during input phase
   */
  clientExtensions: Record<string, unknown>;

  /**
   * Context passed to each extension's processOutput method
   */
  context: TContext;
};

/**
 * Processor for handling WebAuthn extension input/output processing.
 *
 * This class orchestrates the processing of extensions using a registry
 * of available extensions.
 */
export class ExtensionProcessor {
  constructor(private readonly registry: ExtensionRegistry) {}

  /**
   * Process all extension inputs.
   *
   * For each extension in the input:
   * 1. Check if it's a supported client extension
   * 2. Store the client extension input
   * 3. If it requires authenticator processing, run the extension's processInput
   *
   * @see https://www.w3.org/TR/webauthn-3/#sctn-client-extension-processing
   */
  async processInputs<TContext>(
    opts: ProcessInputsOptions<TContext>,
  ): Promise<ProcessInputsResult> {
    const { extensions, context, isClientExtension, isAuthenticatorExtension } =
      opts;

    const clientExtensions: Record<string, unknown> = {};
    const authenticatorExtensions: Record<string, unknown> = {};

    if (!extensions) {
      return { clientExtensions, authenticatorExtensions };
    }

    for (const [extensionId, clientExtensionInput] of Object.entries(
      extensions,
    )) {
      // If extensionId is not supported by this client platform, continue.
      if (!isClientExtension(extensionId)) {
        continue;
      }

      // Skip extensions with falsy input (e.g., credProps: false means don't use extension)
      if (!clientExtensionInput) {
        continue;
      }

      // Set clientExtensions[extensionId] to clientExtensionInput.
      clientExtensions[extensionId] = clientExtensionInput;

      // If extensionId is not an authenticator extension, continue.
      if (!isAuthenticatorExtension(extensionId)) {
        continue;
      }

      // Get the extension from the registry
      const extension = this.registry.get(extensionId);

      if (!extension?.processInput) {
        continue;
      }

      // Let authenticatorExtensionInput be the (CBOR) result of running
      // extensionId's client extension processing algorithm on clientExtensionInput.
      // If the algorithm returned an error, continue.
      try {
        const authenticatorExtensionInputResult = await extension.processInput({
          clientInput: clientExtensionInput,
          context,
        });

        if (authenticatorExtensionInputResult === null) {
          continue;
        }

        authenticatorExtensions[extensionId] =
          authenticatorExtensionInputResult;
      } catch {
        // If the algorithm returned an error, continue.
        continue;
      }
    }

    return { clientExtensions, authenticatorExtensions };
  }

  /**
   * Process all extension outputs.
   *
   * For each extension that was included in the client extensions,
   * run its processOutput method to generate the client extension result.
   *
   * @see https://www.w3.org/TR/webauthn-3/#sctn-client-extension-processing
   */
  processOutputs<TContext>(
    opts: ProcessOutputsOptions<TContext>,
  ): Record<string, unknown> {
    const { clientExtensions, context } = opts;
    const clientExtensionResults: Record<string, unknown> = {};

    for (const [clientExtensionId] of Object.entries(clientExtensions)) {
      const extension = this.registry.get(clientExtensionId);

      if (!extension?.processOutput) {
        continue;
      }

      clientExtensionResults[clientExtensionId] =
        extension.processOutput(context);
    }

    return clientExtensionResults;
  }
}
