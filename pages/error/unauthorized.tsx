import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PageLayout from '../../components/pageLayout';
import { Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from '../_app';

const UnauthorizedPage: NextPage = () => {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title="Erreur" hideBottomNavigation>
                    <Stack direction="column" justifyContent="center" height="100%">
                        <Typography variant="h3" sx={{ m: '32px' }}>
                            {'Vous n\'êtes pas autorisé à consulter cette page.'}
                        </Typography>
                        <Image
                            loader={imageLoader}
                            src={'/svg/error.svg'}
                            alt={'Success image'}
                            width={120}
                            height={120}
                        />
                        <Button color="error" variant="contained" sx={{ m: '32px' }} onClick={() => router.back()}>
                            Retour
                        </Button>
                    </Stack>
                </PageLayout>
            </main>
        </>
    );
};

export default UnauthorizedPage;
