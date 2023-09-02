import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PageLayout from '../../components/pageLayout';
import { Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from '../_app';
import { useFirestoreUser } from '../../lib/firestoreHooks';

const SuccessPage: NextPage = () => {
    const router = useRouter();
    const user = useFirestoreUser();
    const { id } = router.query;

    return (
        <>
            <Head>
                <title>{'Cafet'}</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                <Stack direction="column" justifyContent="center" height="100%" mt={24}>
                    <Image
                        loader={imageLoader}
                        src={'/svg/success.svg'}
                        alt={'Success image'}
                        width={120}
                        height={120}
                    />
                    <Typography variant="h5" sx={{ m: '32px' }}>
                        Votre commande est en préparation.
                    </Typography>
                    <Image
                        loader={imageLoader}
                        src={'/svg/cooking.svg'}
                        alt={'Success image'}
                        width={120}
                        height={120}
                    />
                    <Button variant="contained" sx={{ m: '32px', borderRadius: '20px' }} onClick={() => router.replace(user?.isAdmin ? `/accounts/${id}` : '/')}>
                        Retour
                    </Button>
                </Stack>
            </main>
        </>
    );
};

export default SuccessPage;
