import { CircularProgress } from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import AccountDetails from "../../components/accountDetails";
import LoadingScreen from "../../components/loading";
import PageLayout from "../../components/pageLayout";
import { Account, School } from "../../lib/accounts";
import { useAccount } from "../../lib/firestoreHooks";

const AccountDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // TODO: with real data
  // const account: Account = {
  //   id: id as string,
  //   firstName: "John",
  //   lastName: "Doe",
  //   isMember: true,
  //   school: School.Ensimag,
  //   balance: 1234,
  //   stats: {
  //     quantityDrank: 0,
  //     totalMoney: 0,
  //   },
  // };

  const account = useAccount(id as string);

  return (
    <>
      <Head>
        <title>{"S'Beer Eck"}</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout title="Details du compte" hideBottomNavigation backTo="/">
          {account === undefined
            ? <LoadingScreen />
            : <AccountDetails account={account} />
          }
        </PageLayout>
      </main>
    </>
  );
};

export default AccountDetailsPage;
