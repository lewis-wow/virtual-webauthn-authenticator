import { convertSync } from '@openapi-contrib/json-schema-to-openapi-schema';
import type { JSONSchema4 } from 'json-schema';
import type { OpenAPIV3 } from 'openapi-types';

export type SchemaWithDefs = JSONSchema4;

export class OpenApiRefsResolver {
  private components: Record<string, JSONSchema4> = {};

  /**
   * Recursively traverses the object to update references.
   * Returns a NEW object/array, ensuring immutability.
   */
  public resolveRefs(obj: unknown): JSONSchema4 {
    // 1. Handle Arrays (Return new array)
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        this.resolveRefs(item),
      ) as unknown as JSONSchema4;
    }

    // 2. Handle Objects (Return new object)
    if (typeof obj === 'object' && obj !== null) {
      const source = obj as Record<string, unknown>;
      const newObj: Record<string, unknown> = {};

      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (key === '$ref' && typeof source[key] === 'string') {
            // Transformation Logic
            let ref = source[key];
            ref = ref.replace('#/definitions/', '#/components/schemas/');
            ref = ref.replace('#/$defs/', '#/components/schemas/');
            newObj[key] = ref;
          } else {
            // Recursion
            newObj[key] = this.resolveRefs(source[key]);
          }
        }
      }

      return newObj as JSONSchema4;
    }

    // 3. Handle Primitives (Return as is)
    return obj as JSONSchema4;
  }

  /**
   * Extracts definitions without mutating the input schema,
   * resolves references, and converts the result to OpenAPI schema.
   */
  public extract(jsonSchema: JSONSchema4): OpenAPIV3.Document {
    // IMMUTABILITY STEP:
    // Destructure definitions out, leaving the rest of the schema in 'cleanSchema'.
    // This creates a shallow clone and leaves original 'jsonSchema' untouched.
    const { definitions, $defs, ...cleanSchema } = jsonSchema;

    // 1. Extract 'definitions'
    if (definitions) {
      for (const [name, definition] of Object.entries(definitions)) {
        if (!this.components[name]) {
          this.components[name] = this.resolveRefs(definition);
        }
      }
    }

    // 2. Extract '$defs'
    if ($defs) {
      for (const [name, definition] of Object.entries($defs)) {
        if (!this.components[name]) {
          this.components[name] = this.resolveRefs(definition);
        }
      }
    }

    // 3. Resolve refs on the cleaned main schema
    const resolvedSchema = this.resolveRefs(cleanSchema);

    // 4. Return the converted result
    // Note: The return type here depends on what convertSync returns (usually an OpenAPI Schema)
    return convertSync(resolvedSchema);
  }

  public getComponents(): Record<string, JSONSchema4> {
    return this.components;
  }
}
