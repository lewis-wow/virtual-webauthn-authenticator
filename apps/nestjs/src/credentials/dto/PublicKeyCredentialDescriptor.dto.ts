import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsArray } from 'class-validator';
import { AuthenticatorTransport, PublicKeyCredentialType } from '@repo/enums';

/**
 * Describes a public key credential.
 * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialdescriptor}
 */
export class PublicKeyCredentialDescriptorDto
  implements PublicKeyCredentialDescriptor
{
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
  public id!: BufferSource;

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
  @IsEnum(AuthenticatorTransport, { each: true })
  public transports?: AuthenticatorTransport[];
}
