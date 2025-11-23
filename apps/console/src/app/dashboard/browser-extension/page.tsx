import { Page } from '@/components/Page';
import { Button } from '@repo/ui/components/Button';
import { Stack } from '@repo/ui/components/Stack';
import Link from 'next/link';

const BrowserExtensionPage = () => {
  return (
    <Page pageTitle="Browser extension">
      <Stack direction="column" gap="1rem">
        <Button asChild>
          <Link href="/generated/Keyless.crx" download="/generated/Keyless.crx">
            Download Extension (.crx)
          </Link>
        </Button>

        <Button asChild>
          <Link href="/generated/Keyless.zip" download="/generated/Keyless.zip">
            Download Extension (.zip)
          </Link>
        </Button>
      </Stack>
    </Page>
  );
};

export default BrowserExtensionPage;
