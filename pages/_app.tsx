import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { darkTheme, lightTheme, useAppTheme } from '../lib/theme';
import { ThemeProvider } from '@mui/material';

function MyApp({ Component, pageProps }: AppProps) {
  const [theme] = useAppTheme();

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
