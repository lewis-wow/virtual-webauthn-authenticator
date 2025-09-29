import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AuthenticatorAttachment } from '../enums/AuthenticatorAttachment.js';
import { ResidentKeyRequirement } from '../enums/ResidentKeyRequirement.js';
import { UserVerificationRequirement } from '../enums/UserVerificationRequirement.js';

/**
 * Specifies the criteria for selecting an authenticator.
 * @see {@link https://w3c.github.io/webauthn/#dictionary-authenticatorselection}
 */
export class AuthenticatorSelectionCriteriaDto {
  /**
   * Specifies the type of authenticator to be used.
   * @see {@link https://w3c.github.io/webauthn/#dom-authenticatorselectioncriteria-authenticatorattachment}
   */
  @ApiProperty({
    description: 'Specifies the type of authenticator to be used.',
    enum: AuthenticatorAttachment,
    required: false,
  })
  @IsOptional()
  @IsEnum(AuthenticatorAttachment)
  public authenticatorAttachment?: AuthenticatorAttachment;

  /**
   * Specifies the resident key requirement.
   * @see {@link https://w3c.github.io/webauthn/#dom-authenticatorselectioncriteria-residentkey}
   */
  @ApiProperty({
    description: 'Specifies the resident key requirement.',
    enum: ResidentKeyRequirement,
    required: false,
  })
  @IsOptional()
  @IsEnum(ResidentKeyRequirement)
  public residentKey?: ResidentKeyRequirement;

  /**
   * Specifies the user verification requirement.
   * @see {@link https://w3c.github.io/webauthn/#dom-authenticatorselectioncriteria-userverification}
   */
  @ApiProperty({
    description: 'Specifies the user verification requirement.',
    enum: UserVerificationRequirement,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserVerificationRequirement)
  public userVerification?: UserVerificationRequirement;
}
