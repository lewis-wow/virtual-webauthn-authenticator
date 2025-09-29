import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { transformUint8Array } from '../transformers/transformUint8Array.js';

/**
 * Represents a user entity for a public key credential.
 * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialuserentity}
 */
export class PublicKeyCredentialUserEntityDto {
  /**
   * The user's ID.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialuserentity-id}
   */
  @ApiProperty({ description: "The user's ID." })
  @Transform(transformUint8Array)
  public id!: Uint8Array;

  /**
   * The user's name.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialuserentity-name}
   */
  @ApiProperty({ description: "The user's name." })
  @IsString()
  public name!: string;

  /**
   * The user's display name.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialuserentity-displayname}
   */
  @ApiProperty({ description: "The user's display name." })
  @IsString()
  public displayName!: string;
}
