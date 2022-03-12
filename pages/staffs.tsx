import type { NextPage } from "next";
import Head from "next/head";
import LoadingScreen from "../components/loading";
import PageLayout from "../components/pageLayout";
import FullHeightScrollableContainer from "../components/scrollableContainer";
import StaffList from "../components/staffList";
import { useStaffs } from "../lib/firestoreHooks";
import { useGuardIsConnected } from "../lib/hooks";

const StaffPage: NextPage = () => {
  useGuardIsConnected();
  const staffs = useStaffs();

  return (
    <>
      <Head>
        <title>S&apos;Beer Eck</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout title={"S'Beer Eck"}>
          {staffs === undefined
            ? <LoadingScreen />
            : <>
              <FullHeightScrollableContainer>
                <StaffList staffs={staffs} />
              </FullHeightScrollableContainer>
            </>
          }
        </PageLayout>
      </main>
    </>
  );
};

export default StaffPage;
