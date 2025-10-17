import type { PlasmoMessaging } from '@plasmohq/messaging';
import type {
  IPublicKeyCredentialRequestOptions,
  IPublicKeyCredentialAuthenticatorAssertionResponse,
} from '@repo/types';
import type { MessageResponse } from '~types';

const handler: PlasmoMessaging.MessageHandler<
  IPublicKeyCredentialRequestOptions,
  MessageResponse<IPublicKeyCredentialAuthenticatorAssertionResponse>
> = async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_BASE_URL}/credentials`,
      {
        method: 'GET',
      },
    );

    const json = await response.json();

    res.send({ success: true, data: json });
  } catch (error) {
    res.send({ success: false, error: error as Error });
  }
};

export default handler;
