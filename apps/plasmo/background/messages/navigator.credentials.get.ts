import type { PlasmoMessaging } from '@plasmohq/messaging';
import {
  type PublicKeyCredentialRequestOptions,
  PublicKeyCredentialRequestOptionsSchema,
  type PublicKeyCredential,
  PublicKeyCredentialSchema,
} from '@repo/validation';
import type { MessageResponse } from '~types';

const handler: PlasmoMessaging.MessageHandler<
  PublicKeyCredentialRequestOptions,
  MessageResponse<PublicKeyCredential>
> = async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_BASE_URL}/credentials/get`,
      {
        method: 'POST',
        body: JSON.stringify(
          PublicKeyCredentialRequestOptionsSchema.encode(req.body!),
        ),
      },
    );

    const json = await response.json();

    res.send({ success: true, data: PublicKeyCredentialSchema.parse(json) });
  } catch (error) {
    res.send({ success: false, error: error as Error });
  }
};

export default handler;
