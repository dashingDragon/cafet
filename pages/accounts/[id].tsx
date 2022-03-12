import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import AccountDetails from "../../components/accountDetails";
import LoadingScreen from "../../components/loading";
import PageLayout from "../../components/pageLayout";
import { useAccount } from "../../lib/firestoreHooks";
import { useGuardIsConnected } from "../../lib/hooks";

const AccountDetailsPage: NextPage = () => {
  useGuardIsConnected();
  const router = useRouter();
  const { id } = router.query;

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
