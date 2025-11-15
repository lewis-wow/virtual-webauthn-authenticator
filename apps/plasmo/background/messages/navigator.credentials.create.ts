import type { PlasmoMessaging } from '@plasmohq/messaging';
import {
  type PublicKeyCredentialCreationOptions,
  type PublicKeyCredential,
} from '@repo/validation';
import type { MessageResponse } from '~types';
import { serializeError } from '~utils/serializeError';

const handler: PlasmoMessaging.MessageHandler<
  PublicKeyCredentialCreationOptions,
  MessageResponse<PublicKeyCredential>
> = async (req, res) => {
  let response: Response;
  let body: string;

  try {
    response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_BASE_URL}/api/credentials/create`,
      {
        method: 'POST',
        body: JSON.stringify(req.body!),
      },
    );

    body = await response.text();
  } catch (error) {
    res.send({
      success: false,
      error: serializeError(error),
    });
    return;
  }

  try {
    const json = JSON.parse(body);

    res.send({ success: true, response, data: json });
  } catch (error) {
    res.send({
      success: false,
      error: serializeError(error),
      response,
      body,
    });
  }
};

export default handler;
