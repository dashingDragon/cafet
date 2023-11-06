import { NextPage } from 'next';
import Head from 'next/head';
import Register from '../components/register';
import { useGuardIsConnected } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import PageLayout from '../components/layout/pageLayout';
import FullHeightScrollableContainer from '../components/layout/scrollableContainer';

const RegisterPage: NextPage = () => {
    const user = useGuardIsConnected();
    return (
        <>
            <Head>
                <title>{'Cafet'}</title>
                <meta name="description" content="Cafet App" />
            </Head>

            <main>
                <PageLayout hideBottomNavigation hideTopBar>
                    <FullHeightScrollableContainer>
                        {user === null
                            ? <LoadingScreen />
                            : <Register />
                        }
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default RegisterPage;
