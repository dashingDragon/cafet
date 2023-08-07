import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import AccountList from '../components/accountList';
import { useGuardIsConnected } from '../lib/hooks';

const AccountPage: NextPage = () => {
    useGuardIsConnected();

    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'}>
                    <AccountList />
                </PageLayout>
            </main>
        </>
    );
};

export default AccountPage;
