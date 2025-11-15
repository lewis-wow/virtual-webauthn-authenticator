import type { PlasmoMessaging } from '@plasmohq/messaging';
import {
  type PublicKeyCredentialRequestOptions,
  type PublicKeyCredential,
} from '@repo/validation';
import type { MessageResponse } from '~types';

const handler: PlasmoMessaging.MessageHandler<
  PublicKeyCredentialRequestOptions,
  MessageResponse<PublicKeyCredential>
> = async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_BASE_URL}/api/credentials/get`,
      {
        method: 'POST',
        body: JSON.stringify(req.body!),
      },
    );

    const json = await response.json();

    res.send({ success: true, data: json });
  } catch (error) {
    res.send({ success: false, error: error as Error });
  }
};

export default handler;
