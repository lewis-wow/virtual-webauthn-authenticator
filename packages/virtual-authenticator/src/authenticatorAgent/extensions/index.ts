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
