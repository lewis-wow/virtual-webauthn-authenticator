#!/usr/bin/env -S npx tsx
/**
 * @see https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/types/extract-dom-types.ts
 */
import { createRequire } from 'node:module';
import {
  InterfaceDeclaration,
  Node,
  Project,
  Structure,
  SyntaxKind,
  TypeAliasDeclaration,
} from 'ts-morph';
import { version } from 'typescript';

// 1. Setup require to resolve paths to node_modules
// This allows us to locate typescript's lib files robustly.
const require = createRequire(import.meta.url);

// List of types we directly reference from the dom lib.
const types = [
  'AuthenticatorAssertionResponse',
  'AttestationConveyancePreference',
  'AuthenticatorAttestationResponse',
  'AuthenticatorTransport',
  'AuthenticationExtensionsClientInputs',
  'AuthenticationExtensionsClientOutputs',
  'AuthenticatorSelectionCriteria',
  'COSEAlgorithmIdentifier',
  'Crypto',
  'PublicKeyCredential',
  'PublicKeyCredentialCreationOptions',
  'PublicKeyCredentialDescriptor',
  'PublicKeyCredentialParameters',
  'PublicKeyCredentialRequestOptions',
  'PublicKeyCredentialUserEntity',
  'ResidentKeyRequirement',
  'UserVerificationRequirement',
];

// 2. Resolve the path to TypeScript's lib.dom.d.ts directly from node_modules
const domSourcePath = require.resolve('typescript/lib/lib.dom.d.ts');

console.log(`Extracting types from: ${domSourcePath}`);

// 3. Initialize ts-morph Project
const project = new Project({ skipAddingFilesFromTsConfig: true });
const domSourceFile = project.addSourceFileAtPath(domSourcePath);

// Explicitly type the Sets using the ts-morph types
const resolvedNodes = new Set<InterfaceDeclaration | TypeAliasDeclaration>();
const unresolvedNodes = new Set<InterfaceDeclaration | TypeAliasDeclaration>(
  types.map((type) => {
    const node =
      domSourceFile.getInterface(type) ?? domSourceFile.getTypeAlias(type);
    if (!node) {
      throw new Error(`${type} does not refer to an interface or type alias`);
    }
    return node;
  }),
);

// 4. Walk the dependency graph
while (unresolvedNodes.size > 0) {
  for (const node of unresolvedNodes.values()) {
    unresolvedNodes.delete(node);
    resolvedNodes.add(node);

    // Declarations in lib files are never exported because they are globally
    // available. Since we are extracting the types to a module, we export them.
    node.setIsExported(true);

    // Find all descendant identifiers which reference an interface or type
    // alias, and add them to the unresolved list.
    for (const id of node.getDescendantsOfKind(SyntaxKind.Identifier)) {
      for (const dn of id.getDefinitionNodes()) {
        if (
          Node.isInterfaceDeclaration(dn) ||
          Node.isTypeAliasDeclaration(dn)
        ) {
          if (!resolvedNodes.has(dn)) {
            unresolvedNodes.add(dn);
          }
        }
      }
    }
  }
}

// 5. Generate the Output File
const outputSourceFile = project.createSourceFile(
  'src/types/dom.ts',
  undefined,
  {
    overwrite: true,
  },
);

outputSourceFile.addStatements([
  `/**`,
  ` * Generated from typescript@${version}`,
  ` * To regenerate, run the extraction script from the package root.`,
  ` */`,
]);

const resolvedStructures = Array.from(resolvedNodes).map((node) =>
  node.getStructure(),
);

outputSourceFile.addInterfaces(
  resolvedStructures.filter(Structure.isInterface),
);
outputSourceFile.addTypeAliases(
  resolvedStructures.filter(Structure.isTypeAlias),
);

// 6. Save
outputSourceFile.saveSync();

console.log(
  `Successfully generated src/types/dom.ts with ${resolvedNodes.size} types.`,
);
