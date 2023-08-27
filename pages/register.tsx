import { NextPage } from 'next';
import Head from 'next/head';
import Register from '../components/register';
import { useGuardIsConnected } from '../lib/hooks';
import LoadingScreen from '../components/loading';

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
                {user === null
                    ? <LoadingScreen />
                    : <Register />
                }
            </main>
        </>
    );
};

export default RegisterPage;
