// Core extension architecture
export { Extension } from './Extension';
export { ExtensionRegistry } from './ExtensionRegistry';
export {
  ExtensionProcessor,
  type ProcessInputsOptions,
  type ProcessInputsResult,
  type ProcessOutputsOptions,
} from './ExtensionProcessor';

// Extension implementations
export {
  CredPropsExtension,
  type CredPropsOutput,
  type CredPropsOutputOptions,
} from './CredPropsExtension';

export {
  HmacSecretExtension,
  type HmacSecretRegistrationInputOptions,
  type HmacSecretAuthenticationInputOptions,
  type HmacSecretRegistrationOutput,
  type HmacSecretAuthenticationOutput,
  type HmacSecretCredentialContext,
} from './HmacSecretExtension';
