import type { NextPage } from "next";
import Head from "next/head";
import { Box, Typography } from "@mui/material";
import PageLayout from "../components/pageLayout";
import FullHeightScrollableContainer from "../components/scrollableContainer";

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
            <Typography variant='body1'>Staffs</Typography>
          </FullHeightScrollableContainer>
        </PageLayout>
      </main>
    </>
  );
};

export default StaffPage;
