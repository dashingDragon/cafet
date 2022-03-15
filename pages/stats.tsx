import { NextPage } from "next";
import Head from "next/head";
import LoadingScreen from "../components/loading";
import PageLayout from "../components/pageLayout";
import FullHeightScrollableContainer from "../components/scrollableContainer";
import StatsEvent from "../components/statsEvent";
import { useCurrentEvent } from "../lib/firestoreHooks";

const StatsPage: NextPage = () => {
  const event = useCurrentEvent();

  return (
    <>
      <Head>
        <title>{"S'Beer Eck"}</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout title={`Stats pour l'event ${event?.name ?? "uwu"}`}>
          <FullHeightScrollableContainer>
            {event === undefined
              ? <LoadingScreen />
              : <StatsEvent event={event} />
            }
          </FullHeightScrollableContainer>
        </PageLayout>
      </main>
    </>
  );
};

export default StatsPage;
