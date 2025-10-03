import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Attestation } from '@repo/enums';
import { PublicKeyCredentialRpEntityDto } from './PublicKeyCredentialRpEntity.dto.js';
import { PublicKeyCredentialUserEntityDto } from './PublicKeyCredentialUserEntity.dto.js';
import { PublicKeyCredentialParametersDto } from './PublicKeyCredentialParameters.dto.js';
import { PublicKeyCredentialDescriptorDto } from './PublicKeyCredentialDescriptor.dto.js';
import { AuthenticatorSelectionCriteriaDto } from './AuthenticatorSelectionCriteria.dto.js';
import { AuthenticationExtensionsClientInputsDto } from './AuthenticationExtensionsClientInputs.dto.js';
import { transformBufferSource } from '../../lib/transformers/transformBufferSource.js';

/**
 * Represents the options for creating a new public key credential.
 * @see {@link https://w3c.github.io/webauthn/#dictionary-makecredentialoptions}
 */
export class PublicKeyCredentialCreationOptionsDto
  implements PublicKeyCredentialCreationOptions
{
  /**
   * The relying party entity.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-rp}
   */
  @ApiProperty({ description: 'The relying party entity.' })
  @ValidateNested()
  @Type(() => PublicKeyCredentialRpEntityDto)
  public rp!: PublicKeyCredentialRpEntityDto;

  /**
   * The user entity.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-user}
   */
  @ApiProperty({ description: 'The user entity.' })
  @ValidateNested()
  @Type(() => PublicKeyCredentialUserEntityDto)
  public user!: PublicKeyCredentialUserEntityDto;

  /**
   * A challenge to be signed by the authenticator.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-challenge}
   */
  @ApiProperty({
    description: 'A challenge to be signed by the authenticator.',
  })
  @Transform(transformBufferSource)
  public challenge!: BufferSource;

  /**
   * The parameters for the public key credential.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-pubkeycredparams}
   */
  @ApiProperty({
    description: 'The parameters for the public key credential.',
    type: [PublicKeyCredentialParametersDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => PublicKeyCredentialParametersDto)
  public pubKeyCredParams!: PublicKeyCredentialParametersDto[];

  /**
   * The timeout for the operation.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-timeout}
   */
  @ApiProperty({
    description: 'The timeout for the operation.',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public timeout?: number;

  /**
   * A list of credentials to exclude.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-excludecredentials}
   */
  @ApiProperty({
    description: 'A list of credentials to exclude.',
    type: [PublicKeyCredentialDescriptorDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicKeyCredentialDescriptorDto)
  public excludeCredentials?: PublicKeyCredentialDescriptorDto[];

  /**
   * The authenticator selection criteria.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-authenticatorselection}
   */
  @ApiProperty({
    description: 'The authenticator selection criteria.',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthenticatorSelectionCriteriaDto)
  public authenticatorSelection?: AuthenticatorSelectionCriteriaDto;

  /**
   * The attestation conveyance preference.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-attestation}
   */
  @ApiProperty({
    description: 'The attestation conveyance preference.',
    enum: Attestation,
    required: false,
  })
  @IsOptional()
  @IsEnum(Attestation)
  public attestation?: Attestation;

  /**
   * The extensions for the operation.
   * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-extensions}
   */
  @ApiProperty({
    description: 'The extensions for the operation.',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthenticationExtensionsClientInputsDto)
  public extensions?: AuthenticationExtensionsClientInputsDto;
}
