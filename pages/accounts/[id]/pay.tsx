import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import LoadingScreen from "../../../components/loading";
import PageLayout from "../../../components/pageLayout";
import PayForm from "../../../components/payForm";
import { useAccount } from "../../../lib/firestoreHooks";
import { useGuardIsConnected } from "../../../lib/hooks";

const AccountPayPage: NextPage = () => {
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
        {account === undefined
          ? <>
            <PageLayout title="Encaisser ..." hideBottomNavigation backTo={`/accounts/${id}`}>
              <LoadingScreen />
            </PageLayout>
          </>
          : <>
            <PageLayout title={`Encaisser ${account.firstName} ${account.lastName}`} hideBottomNavigation backTo={`/accounts/${id}`}>
              <PayForm account={account} />
            </PageLayout>
          </>
        }

      </main>
    </>
  );
};

export default AccountPayPage;
