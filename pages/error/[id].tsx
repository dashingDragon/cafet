import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PageLayout from '../../components/layout/pageLayout';
import { Button, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from '../_app';
import { useFirestoreUser } from '../../lib/firestoreHooks';
import FullHeightScrollableContainer from '../../components/layout/scrollableContainer';

const SuccessPage: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const user = useFirestoreUser();

    return (
        <>
            <Head>
                <title>{'Cafet'}</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                <PageLayout hideBottomNavigation hideTopBar>
                    <FullHeightScrollableContainer>
                        <Stack direction="column" justifyContent="center" height="100%" m={4}>
                            <Typography variant="h5" sx={{ m: '32px' }}>
                                {'Une erreur s\'est produite. Veuillez réessayer.'}
                            </Typography>
                            <Image
                                loader={imageLoader}
                                src={'/svg/error.svg'}
                                alt={'Success image'}
                                width={120}
                                height={120}
                            />
                            <Button color="error" variant="contained" sx={{ m: '32px' }} onClick={() => router.replace(user?.isAdmin ? `/accounts/${id}` : '/')}>
                        Retour
                            </Button>
                        </Stack>
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default SuccessPage;
