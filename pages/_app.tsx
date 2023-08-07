import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { darkTheme, lightTheme, useAppTheme } from '../lib/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { initializeApp, getApp } from 'firebase/app';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const [theme] = useAppTheme();

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            router.replace(router.asPath);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Setup firebase
    const _firebase = useMemo(() => {
        try {
            return getApp();
        } catch (e) {
            // Doesn't really matter that it is on git
            const firebaseConfig = {
                apiKey: 'AIzaSyAXPX2zOln1JRzT_jZuBbhoz6RufOXxWgM',
                authDomain: 'kafet-394406.firebaseapp.com',
                projectId: 'kafet-394406',
                storageBucket: 'kafet-394406.appspot.com',
                messagingSenderId: '752961124318',
                appId: '1:752961124318:web:2980fec92a1b91c1154f4f',

            };


            return initializeApp(firebaseConfig);
        }
    }, []);

    return (
        <>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1.0, user-scalable=no" />
            </Head>
            <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
                <CssBaseline enableColorScheme />
                <Component {...pageProps} />
            </ThemeProvider>
        </>
    );
}

export default MyApp;
