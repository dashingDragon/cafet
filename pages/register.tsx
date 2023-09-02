import { NextPage } from 'next';
import Head from 'next/head';
import Register from '../components/register';
import { useGuardIsConnected } from '../lib/hooks';
import LoadingScreen from '../components/loading';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';

const RegisterPage: NextPage = () => {
    const user = useGuardIsConnected();
    console.log('register page');
    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
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
