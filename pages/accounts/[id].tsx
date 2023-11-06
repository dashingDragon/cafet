import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AccountDetails from '../../components/accountDetails';
import LoadingScreen from '../../components/loading';
import PageLayout from '../../components/layout/pageLayout';
import { useAccount } from '../../lib/firestoreHooks';
import { useGuardIsAdmin } from '../../lib/hooks';
import FullHeightScrollableContainer from '../../components/layout/scrollableContainer';

const AccountDetailsPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    const router = useRouter();
    const { id } = router.query;

    const account = useAccount(id as string);

    return (
        <>
            <Head>
                <title>{'Cafet'}</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                <PageLayout title="Details du compte" hideBottomNavigation backTo="/accounts">
                    <FullHeightScrollableContainer>
                        {account === undefined || admin === undefined
                            ? <LoadingScreen />
                            : <AccountDetails account={account} />
                        }
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default AccountDetailsPage;
