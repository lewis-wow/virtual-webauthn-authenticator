import { mainWorldToContentScriptMessaging } from '@/messaging/mainWorldToContentScriptMessaging';
import { Exception } from '@repo/exception';
import { Logger } from '@repo/logger';
import {
  bytesToBase64url,
  bytesToHex,
  convertBrowserCreationOptions,
  convertBrowserRequestOptions,
  createPublicKeyCredentialResponseImpl,
  PublicKeyCredentialImpl,
} from '@repo/virtual-authenticator/browser';
import {
  decodeAttestationObject,
  parseAuthenticatorData,
} from '@repo/virtual-authenticator/cbor';
import {
  PublicKeyCredentialCreationOptionsDtoSchema,
  PublicKeyCredentialDtoSchema,
  PublicKeyCredentialRequestOptionsDtoSchema,
} from '@repo/virtual-authenticator/dto';
import { PublicKeyCredentialSchema } from '@repo/virtual-authenticator/validation';

const logger = new Logger({ prefix: 'MAIN' });
const textDecoder = new TextDecoder();
logger.info('Init');

const toReadable = (value: unknown): unknown => {
  if (value instanceof Uint8Array) {
    return {
      byteLength: value.byteLength,
      base64url: bytesToBase64url(value),
      hex: bytesToHex(value),
    };
  }

  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries()).map(([key, mapValue]) => [
        String(key),
        toReadable(mapValue),
      ]),
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) => toReadable(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([key, objectValue]) => [key, toReadable(objectValue)],
      ),
    );
  }

  return value;
};

const decodeClientDataJSON = (clientDataJSON: Uint8Array): unknown => {
  try {
    return JSON.parse(textDecoder.decode(clientDataJSON));
  } catch {
    return {
      parseError: 'Failed to parse clientDataJSON',
      raw: toReadable(clientDataJSON),
    };
  }
};

const normalizePublicKeyCredential = (rawCredential: unknown) => {
  try {
    return PublicKeyCredentialSchema.parse(rawCredential);
  } catch {
    return PublicKeyCredentialDtoSchema.parse(rawCredential);
  }
};

const parsePublicKeyCredentialResponseForLog = (rawCredential: unknown) => {
  const publicKeyCredential = normalizePublicKeyCredential(rawCredential);
  const { response } = publicKeyCredential;

  const base = {
    id: publicKeyCredential.id,
    type: publicKeyCredential.type,
    authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
    clientExtensionResults: publicKeyCredential.clientExtensionResults,
    rawId: toReadable(publicKeyCredential.rawId),
    clientDataJSON: decodeClientDataJSON(response.clientDataJSON),
  };

  if ('attestationObject' in response) {
    const attestationObject = decodeAttestationObject(
      response.attestationObject,
    );
    const authData = attestationObject.get('authData');

    return {
      ...base,
      ceremony: 'create',
      attestation: {
        fmt: attestationObject.get('fmt'),
        attStmt: toReadable(attestationObject.get('attStmt')),
        authData: toReadable(parseAuthenticatorData(authData)),
      },
    };
  }

  return {
    ...base,
    ceremony: 'get',
    assertion: {
      authenticatorData: toReadable(
        parseAuthenticatorData(response.authenticatorData),
      ),
      signature: toReadable(response.signature),
      userHandle: toReadable(response.userHandle),
    },
  };
};

export default defineUnlistedScript(() => {
  logger.info('Init');

  navigator.credentials.create = async (opts?: CredentialCreationOptions) => {
    logger.info('Intercepted navigator.credentials.create', opts);

    const publicKeyCredentialCreationOptions = convertBrowserCreationOptions(
      opts?.publicKey,
    );

    logger.info(
      'Create options (parsed):',
      JSON.stringify(toReadable(publicKeyCredentialCreationOptions), null, 2),
    );

    const encodedPkOptions = PublicKeyCredentialCreationOptionsDtoSchema.encode(
      publicKeyCredentialCreationOptions!,
    );

    const response = await mainWorldToContentScriptMessaging.sendMessage(
      'credentials.create',
      {
        publicKeyCredentialCreationOptions: encodedPkOptions,
      },
    );

    if (!response.ok) {
      throw new Exception(response.error);
    }

    const parsedPublicKeyCredential = PublicKeyCredentialDtoSchema.parse(
      response.data,
    );

    let parsedCredentialForLog: unknown;

    try {
      parsedCredentialForLog = parsePublicKeyCredentialResponseForLog(
        parsedPublicKeyCredential,
      );
    } catch (error) {
      logger.warn('Parsed credentials.create response failed', {
        error,
      });
      parsedCredentialForLog = publicKeyCredentialToJSONSafe(response.data);
    }

    const publicKeyCredential = new PublicKeyCredentialImpl({
      id: parsedPublicKeyCredential.id,
      rawId: parsedPublicKeyCredential.rawId,
      response: createPublicKeyCredentialResponseImpl(
        parsedPublicKeyCredential.response,
      ),
      authenticatorAttachment:
        parsedPublicKeyCredential.authenticatorAttachment,
      clientExtensionResults: parsedPublicKeyCredential.clientExtensionResults,
    });

    logger.info(
      'Public key credential (parsed):',
      JSON.stringify(parsedCredentialForLog, null, 2),
    );

    return publicKeyCredential;
  };

  navigator.credentials.get = async (opts?: CredentialRequestOptions) => {
    logger.info('Intercepted navigator.credentials.get', opts);

    const publicKeyCredentialRequestOptions = convertBrowserRequestOptions(
      opts?.publicKey,
    );

    logger.info(
      'Get options (parsed):',
      JSON.stringify(toReadable(publicKeyCredentialRequestOptions), null, 2),
    );

    const encodedPkOptions = PublicKeyCredentialRequestOptionsDtoSchema.encode(
      publicKeyCredentialRequestOptions!,
    );

    const response = await mainWorldToContentScriptMessaging.sendMessage(
      'credentials.get',
      {
        publicKeyCredentialRequestOptions: encodedPkOptions,
      },
    );

    if (!response.ok) {
      throw new Exception(response.error);
    }

    const parsedPublicKeyCredential = PublicKeyCredentialDtoSchema.parse(
      response.data,
    );

    let parsedCredentialForLog: unknown;

    try {
      parsedCredentialForLog = parsePublicKeyCredentialResponseForLog(
        parsedPublicKeyCredential,
      );
    } catch (error) {
      logger.warn('Parsed credentials.get response failed', {
        error,
      });
      parsedCredentialForLog = publicKeyCredentialToJSONSafe(response.data);
    }

    const publicKeyCredential = new PublicKeyCredentialImpl({
      id: parsedPublicKeyCredential.id,
      rawId: parsedPublicKeyCredential.rawId,
      response: createPublicKeyCredentialResponseImpl(
        parsedPublicKeyCredential.response,
      ),
      authenticatorAttachment:
        parsedPublicKeyCredential.authenticatorAttachment,
      clientExtensionResults: parsedPublicKeyCredential.clientExtensionResults,
    });

    logger.info(
      'Public key credential (parsed):',
      JSON.stringify(parsedCredentialForLog, null, 2),
    );

    return publicKeyCredential;
  };
});

const publicKeyCredentialToJSONSafe = (rawCredential: unknown) => {
  const publicKeyCredential = normalizePublicKeyCredential(rawCredential);

  return {
    id: publicKeyCredential.id,
    rawId: toReadable(publicKeyCredential.rawId),
    type: publicKeyCredential.type,
    authenticatorAttachment: publicKeyCredential.authenticatorAttachment,
    response: toReadable(publicKeyCredential.response),
    clientExtensionResults: publicKeyCredential.clientExtensionResults,
  };
};
