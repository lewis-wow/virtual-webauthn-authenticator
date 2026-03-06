import type { AttestationHandler } from './AttestationHandler';

export class AttestationHandlerRegistry {
  private readonly attestationHandlers = new Map<string, AttestationHandler>();

  register(attestationHandler: AttestationHandler): this {
    if (this.attestationHandlers.has(attestationHandler.attestationFormat)) {
      throw new Error(
        `AttestationHandler with attestationFormat "${attestationHandler.attestationFormat}" is already registered`,
      );
    }

    this.attestationHandlers.set(
      attestationHandler.attestationFormat,
      attestationHandler,
    );
    return this;
  }

  registerAll(attestationHandlers: AttestationHandler[]): this {
    for (const attestationHandler of attestationHandlers) {
      this.register(attestationHandler);
    }
    return this;
  }

  get(attestationFormat: string): AttestationHandler | undefined {
    return this.attestationHandlers.get(attestationFormat);
  }

  has(attestationFormat: string): boolean {
    return this.attestationHandlers.has(attestationFormat);
  }

  all(): AttestationHandler[] {
    return Array.from(this.attestationHandlers.values());
  }

  attestationFormats(): string[] {
    return Array.from(this.attestationHandlers.keys());
  }
}
