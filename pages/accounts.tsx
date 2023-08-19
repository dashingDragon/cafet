import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import AccountList from '../components/accountList';
import { useGuardIsAdmin } from '../lib/hooks';
import { Box, Card, Typography } from '@mui/material';
import { imageLoader } from './_app';
import Image from 'next/image';

const AccountPage: NextPage = () => {
    useGuardIsAdmin();

    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'}>
                    <>
                        <Card sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            margin: '16px',
                            mt: '48px',
                            borderRadius: '20px',
                            overflow: 'visible',
                            px: '32px',
                            height: '40px',
                            background: theme => theme.palette.mode === 'light'
                                ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(223,191,209,1) 100%)'
                                : 'linear-gradient(135deg, rgba(81,86,100,1) 0%, rgba(126,105,117,1) 100%)',
                        }}>
                            <Typography variant="h5" >Comptes</Typography>
                            <Box sx={{ marginTop: '-35px' }}>
                                <Image
                                    loader={imageLoader}
                                    src={'/svg/account.svg'}
                                    alt={'Success image'}
                                    width={90}
                                    height={90}
                                />
                            </Box>
                        </Card>
                        <AccountList />
                    </>
                </PageLayout>
            </main>
        </>
    );
};

export default AccountPage;
