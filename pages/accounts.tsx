import type { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import AccountList from '../components/lists/accountList';
import { useGuardIsAdmin } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import FullHeightScrollableContainer from '../components/scrollableContainer';

const AccountPage: NextPage = () => {
    const admin = useGuardIsAdmin();

    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={'Kafet'}>
                    {admin === undefined ? (
                        <FullHeightScrollableContainer>
                            <LoadingScreen />
                        </FullHeightScrollableContainer>
                    ) : (
                        <AccountList />
                    )}
                </PageLayout>
            </main>
        </>
    );
};

export default AccountPage;
