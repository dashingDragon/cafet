import type { NextPage } from "next";
import Head from "next/head";
import PageLayout from "../components/pageLayout";
import AccountList from "../components/accountList";

const AccountPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{"S'Beer Eck"}</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout title={"S'Beer Eck"}>
          <AccountList />
        </PageLayout>
      </main>
    </>
  );
};

export default AccountPage;
