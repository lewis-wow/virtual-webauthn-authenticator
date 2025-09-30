import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { CoseAlgorithmIdentifier, PublicKeyCredentialType } from '@repo/enums';

/**
 * Specifies the parameters for a public key credential.
 * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialparameters}
 */
export class PublicKeyCredentialParametersDto
  implements PublicKeyCredentialParameters
{
  /**
   * The type of the credential.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialparameters-type}
   */
  @ApiProperty({
    description: 'The type of the credential.',
    enum: PublicKeyCredentialType,
  })
  @IsEnum(PublicKeyCredentialType)
  public type!: PublicKeyCredentialType;

  /**
   * The algorithm to be used for the credential.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialparameters-alg}
   */
  @ApiProperty({
    description: 'The algorithm to be used for the credential.',
    enum: CoseAlgorithmIdentifier,
  })
  @IsNumber()
  public alg!: CoseAlgorithmIdentifier;
}
