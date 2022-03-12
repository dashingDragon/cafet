import type { NextPage } from "next";
import Head from "next/head";
import BeerList from "../components/beerList";
import PageLayout from "../components/pageLayout";
import FullHeightScrollableContainer from "../components/scrollableContainer";
import { useBeers } from "../lib/firestoreHooks";
import { useGuardIsConnected } from "../lib/hooks";

const BeerPage: NextPage = () => {
  useGuardIsConnected();
  const beers = useBeers();

  return (
    <>
      <Head>
        <title>S&apos;Beer Eck</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout title={"S'Beer Eck"}>
          <FullHeightScrollableContainer>
            <BeerList beers={beers} />
          </FullHeightScrollableContainer>
        </PageLayout>
      </main>
    </>
  );
};

export default BeerPage;
