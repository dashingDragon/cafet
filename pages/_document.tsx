import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                {/* PWA stuff */}
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#1976d2" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

                <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
};
