import type { PlasmoMessaging } from '@plasmohq/messaging';
import {
  type PublicKeyCredentialCreationOptions,
  type PublicKeyCredential,
} from '@repo/validation';
import { AuthType } from '~node_modules/@repo/enums/src';
import type { MessageResponse } from '~types';
import { serializeError } from '~utils/serializeError';

const handler: PlasmoMessaging.MessageHandler<
  PublicKeyCredentialCreationOptions,
  MessageResponse<PublicKeyCredential>
> = async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_BASE_URL}/api/credentials/create`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PLASMO_PUBLIC_API_KEY}`,
          'X-Auth-Type': AuthType.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body!),
      },
    );

    const json = await response.json();

    res.send({ ok: response.ok, data: json });
  } catch (error) {
    res.send({ ok: false, error: serializeError(error) });
  }
};

export default handler;
