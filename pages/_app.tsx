import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { darkTheme, lightTheme, useAppTheme } from "../lib/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useMemo } from "react";
import { initializeApp, getApp } from "firebase/app";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [theme] = useAppTheme();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
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
        apiKey: "AIzaSyAzxBzN7JlhNeue5LSMc1EspCN5NUczCHY",
        authDomain: "fir-beer-eck.firebaseapp.com",
        projectId: "fir-beer-eck",
        storageBucket: "fir-beer-eck.appspot.com",
        messagingSenderId: "1090030112161",
        appId: "1:1090030112161:web:09c9aea9e7467eeb8b4fe0",
      };
      return initializeApp(firebaseConfig);
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
        <CssBaseline enableColorScheme />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
