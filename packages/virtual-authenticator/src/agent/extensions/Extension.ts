import type { MaybePromise } from '@repo/types';

/**
 * Base abstract class for all WebAuthn extensions.
 *
 * Extensions can process input (from client to authenticator) and output (from authenticator to client).
 *
 * @see https://www.w3.org/TR/webauthn-3/#sctn-client-extension-processing
 *
 * @template TInputOpts - The type of options passed to processInput
 * @template TInputResult - The return type of processInput
 * @template TOutputOpts - The type of options passed to processOutput
 * @template TOutputResult - The return type of processOutput
 */
export abstract class Extension<
  TInputOpts = unknown,
  TInputResult = unknown,
  TOutputOpts = unknown,
  TOutputResult = unknown,
> {
  /**
   * The unique identifier for this extension (e.g., 'credProps', 'largeBlob').
   */
  abstract readonly identifier: string;

  /**
   * Whether this extension requires authenticator processing.
   * If true, the extension input will be passed to the authenticator.
   */
  abstract readonly requiresAuthenticatorProcessing: boolean;

  /**
   * Process the client extension input and optionally produce authenticator extension input.
   *
   * @param opts - Extension-specific input options
   * @returns The authenticator extension input, or null if no authenticator processing is needed
   */
  processInput?(opts: TInputOpts): MaybePromise<TInputResult | null>;

  /**
   * Process the extension output and produce the client extension result.
   *
   * @param opts - Extension-specific output options
   * @returns The client extension result
   */
  processOutput?(opts: TOutputOpts): MaybePromise<TOutputResult>;
}
