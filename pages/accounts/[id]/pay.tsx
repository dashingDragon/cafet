import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LoadingScreen from '../../../components/loading';
import PageLayout from '../../../components/pageLayout';
import ProductMenu from '../../../components/productMenu';
import { useAccount } from '../../../lib/firestoreHooks';
import { useGuardIsAdmin } from '../../../lib/hooks';
import FullHeightScrollableContainer from '../../../components/scrollableContainer';

const AccountPayPage: NextPage = () => {
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
                {account === undefined || admin === undefined
                    ? <>
                        <PageLayout title="Encaisser ..." hideBottomNavigation backTo={`/accounts/${id}`}>
                            <LoadingScreen />
                        </PageLayout>
                    </>
                    : <>
                        <PageLayout title={`Encaisser ${account.firstName} ${account.lastName}`} hideBottomNavigation backTo={`/accounts/${id}`}>
                            <FullHeightScrollableContainer>
                                <ProductMenu account={account} />
                            </FullHeightScrollableContainer>
                        </PageLayout>
                    </>
                }

            </main>
        </>
    );
};

export default AccountPayPage;
