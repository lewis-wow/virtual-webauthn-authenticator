import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsArray } from 'class-validator';
import { PublicKeyCredentialType } from '../enums/PublicKeyCredentialType.js';

/**
 * Describes a public key credential.
 * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialdescriptor}
 */
export class PublicKeyCredentialDescriptorDto {
  /**
   * The type of the credential.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialdescriptor-type}
   */
  @ApiProperty({
    description: 'The type of the credential.',
    enum: PublicKeyCredentialType,
  })
  @IsEnum(PublicKeyCredentialType)
  public type!: PublicKeyCredentialType;

  /**
   * The ID of the credential.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialdescriptor-id}
   */
  @ApiProperty({ description: 'The ID of the credential.' })
  @IsString()
  public id!: string;

  /**
   * The transports for the credential.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialdescriptor-transports}
   */
  @ApiProperty({
    description: 'The transports for the credential.',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public transports?: string[];
}
