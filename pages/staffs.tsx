import type { NextPage } from "next";
import Head from "next/head";
import { Box, Typography } from "@mui/material";
import PageLayout from "../components/pageLayout";
import FullHeightScrollableContainer from "../components/scrollableContainer";
import StaffList from "../components/staffList";

const StaffPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>S&apos;Beer Eck</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout title={"S'Beer Eck"}>
          <FullHeightScrollableContainer>
            <StaffList />
          </FullHeightScrollableContainer>
        </PageLayout>
      </main>
    </>
  );
};

export default StaffPage;
