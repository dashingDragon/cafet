import { NextPage } from 'next';
import Head from 'next/head';
import PageLayout from '../components/pageLayout';
import FullHeightScrollableContainer from '../components/scrollableContainer';
import Stats from '../components/stats';
import { Card } from '@mui/material';
import Image from 'next/image';
import { imageLoader } from './_app';
import { url } from 'inspector';

const StatsPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>{'Kafet'}</title>
                <meta name="description" content="Kafet App" />
            </Head>

            <main>
                <PageLayout title={`Statistiques`}>
                    <FullHeightScrollableContainer>
                        <Stats />
                    </FullHeightScrollableContainer>
                </PageLayout>
            </main>
        </>
    );
};

export default StatsPage;
