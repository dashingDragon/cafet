import type { NextPage } from 'next';
import Head from 'next/head';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import PageLayout from '../components/pageLayout';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>S&apos;Beer Eck</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout>
          <Box sx={{bgcolor: "red"}}>
            <Button variant="contained">Coucou</Button>
          </Box>
        </PageLayout>
      </main>
    </>
  );
};

export default Home;
