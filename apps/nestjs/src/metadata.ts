/* eslint-disable */
export default async () => {
  const t = {
    ['./dto/PublicKeyCredentialRpEntity.dto.js']: await import(
      './dto/PublicKeyCredentialRpEntity.dto.js'
    ),
    ['./dto/PublicKeyCredentialUserEntity.dto.js']: await import(
      './dto/PublicKeyCredentialUserEntity.dto.js'
    ),
    ['./dto/PublicKeyCredentialParameters.dto.js']: await import(
      './dto/PublicKeyCredentialParameters.dto.js'
    ),
    ['./dto/PublicKeyCredentialDescriptor.dto.js']: await import(
      './dto/PublicKeyCredentialDescriptor.dto.js'
    ),
    ['./dto/AuthenticatorSelectionCriteria.dto.js']: await import(
      './dto/AuthenticatorSelectionCriteria.dto.js'
    ),
    ['./dto/AuthenticationExtensionsClientInputs.dto.js']: await import(
      './dto/AuthenticationExtensionsClientInputs.dto.js'
    ),
  };
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./dto/PublicKeyCredentialRpEntity.dto.js'),
          {
            PublicKeyCredentialRpEntityDto: {
              name: {
                required: true,
                type: () => String,
                description: 'The name of the relying party.',
              },
              id: {
                required: false,
                type: () => String,
                description: 'The ID of the relying party.',
              },
            },
          },
        ],
        [
          import('./dto/PublicKeyCredentialUserEntity.dto.js'),
          {
            PublicKeyCredentialUserEntityDto: {
              id: {
                required: true,
                type: () => Object,
                description: "The user's ID.",
              },
              name: {
                required: true,
                type: () => String,
                description: "The user's name.",
              },
              displayName: {
                required: true,
                type: () => String,
                description: "The user's display name.",
              },
            },
          },
        ],
        [
          import('./dto/PublicKeyCredentialParameters.dto.js'),
          {
            PublicKeyCredentialParametersDto: {
              type: {
                required: true,
                type: () => String,
                description: 'The type of the credential.',
              },
              alg: {
                required: true,
                type: () => Object,
                description: 'The algorithm to be used for the credential.',
              },
            },
          },
        ],
        [
          import('./dto/PublicKeyCredentialDescriptor.dto.js'),
          {
            PublicKeyCredentialDescriptorDto: {
              type: {
                required: true,
                type: () => String,
                description: 'The type of the credential.',
              },
              id: {
                required: true,
                type: () => Object,
                description: 'The ID of the credential.',
              },
              transports: {
                required: false,
                type: () => [Object],
                description: 'The transports for the credential.',
              },
            },
          },
        ],
        [
          import('./dto/AuthenticatorSelectionCriteria.dto.js'),
          {
            AuthenticatorSelectionCriteriaDto: {
              authenticatorAttachment: {
                required: false,
                type: () => Object,
                description: 'Specifies the type of authenticator to be used.',
              },
              residentKey: {
                required: false,
                type: () => Object,
                description: 'Specifies the resident key requirement.',
              },
              userVerification: {
                required: false,
                type: () => Object,
                description: 'Specifies the user verification requirement.',
              },
            },
          },
        ],
        [
          import('./dto/AuthenticationExtensionsClientInputs.dto.js'),
          {
            AuthenticationExtensionsClientInputsDto: {
              credProps: {
                required: false,
                type: () => Boolean,
                description:
                  'Indicates whether the client should return credential properties.',
              },
            },
          },
        ],
        [
          import('./dto/PublicKeyCredentialCreationOptions.dto.js'),
          {
            PublicKeyCredentialCreationOptionsDto: {
              rp: {
                required: true,
                type: () =>
                  t['./dto/PublicKeyCredentialRpEntity.dto.js']
                    .PublicKeyCredentialRpEntityDto,
                description: 'The relying party entity.',
              },
              user: {
                required: true,
                type: () =>
                  t['./dto/PublicKeyCredentialUserEntity.dto.js']
                    .PublicKeyCredentialUserEntityDto,
                description: 'The user entity.',
              },
              challenge: {
                required: true,
                type: () => Object,
                description: 'A challenge to be signed by the authenticator.',
              },
              pubKeyCredParams: {
                required: true,
                type: () => [
                  t['./dto/PublicKeyCredentialParameters.dto.js']
                    .PublicKeyCredentialParametersDto,
                ],
                description: 'The parameters for the public key credential.',
                minItems: 1,
              },
              timeout: {
                required: false,
                type: () => Number,
                description: 'The timeout for the operation.',
              },
              excludeCredentials: {
                required: false,
                type: () => [
                  t['./dto/PublicKeyCredentialDescriptor.dto.js']
                    .PublicKeyCredentialDescriptorDto,
                ],
                description: 'A list of credentials to exclude.',
              },
              authenticatorSelection: {
                required: false,
                type: () =>
                  t['./dto/AuthenticatorSelectionCriteria.dto.js']
                    .AuthenticatorSelectionCriteriaDto,
                description: 'The authenticator selection criteria.',
              },
              attestation: {
                required: false,
                type: () => Object,
                description: 'The attestation conveyance preference.',
              },
              extensions: {
                required: false,
                type: () =>
                  t['./dto/AuthenticationExtensionsClientInputs.dto.js']
                    .AuthenticationExtensionsClientInputsDto,
                description: 'The extensions for the operation.',
              },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./credentials/Credentials.controller.js'),
          { CredentialsController: { createCredentials: {} } },
        ],
      ],
    },
  };
};
