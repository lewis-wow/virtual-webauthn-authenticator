import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

/**
 * Represents a relying party entity for a public key credential.
 * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialrpentity}
 */
export class PublicKeyCredentialRpEntityDto {
  /**
   * The name of the relying party.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialentity-name}
   */
  @ApiProperty({ description: 'The name of the relying party.' })
  @IsString()
  public name!: string;

  /**
   * The ID of the relying party.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialrpentity-id}
   */
  @ApiProperty({ description: 'The ID of the relying party.', required: false })
  @IsOptional()
  @IsString()
  public id?: string;
}
