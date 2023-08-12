import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PageLayout from '../../components/pageLayout';
import { Button, Stack, Typography } from '@mui/material';
import Image, { ImageLoaderProps } from 'next/image';

const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
    return `${src}?w=${width}&q=${quality || 75}`;
};

const SuccessPage: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title="Commande passée" hideBottomNavigation backTo={`/accounts/${id}`}>
                    <Stack direction="column" justifyContent="center" height="100%">
                        <Image
                            loader={imageLoader}
                            src={'/svg/success.svg'}
                            alt={'Success image'}
                            width={120}
                            height={120}
                        />
                        <Typography variant="h3" sx={{ m: '32px' }}>
                            Votre commande est en préparation.
                        </Typography>
                        <Image
                            loader={imageLoader}
                            src={'/svg/cooking.svg'}
                            alt={'Success image'}
                            width={120}
                            height={120}
                        />
                        <Button variant="contained" sx={{ m: '32px' }} onClick={() => router.replace(`/accounts/${id}`)}>
                            Retour
                        </Button>
                    </Stack>
                </PageLayout>
            </main>
        </>
    );
};

export default SuccessPage;
