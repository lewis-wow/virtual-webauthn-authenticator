import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * Represents the client inputs for authentication extensions.
 * @see {@link https://w3c.github.io/webauthn/#dictdef-authenticationextensionsclientinputs}
 */
export class AuthenticationExtensionsClientInputsDto
  implements AuthenticationExtensionsClientInputs
{
  /**
   * Indicates whether the client should return credential properties.
   * @see {@link https://w3c.github.io/webauthn/#dom-authenticationextensionsclientinputs-credprops}
   */
  @ApiProperty({
    description: 'Whether to return credential properties.',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public credProps?: boolean;
}
