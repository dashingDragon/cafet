import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LoadingScreen from '../../../components/loading';
import PageLayout from '../../../components/pageLayout';
import ProductMenu from '../../../components/productMenu';
import { useAccount } from '../../../lib/firestoreHooks';
import { useGuardIsAdmin } from '../../../lib/hooks';

const AccountPayPage: NextPage = () => {
    const admin = useGuardIsAdmin();
    const router = useRouter();
    const { id } = router.query;

    const account = useAccount(id as string);

    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
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
                            <ProductMenu account={account} />
                        </PageLayout>
                    </>
                }

            </main>
        </>
    );
};

export default AccountPayPage;
