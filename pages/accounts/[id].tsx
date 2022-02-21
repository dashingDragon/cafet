import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AccountDetails from '../../components/accountDetails';
import PageLayout from '../../components/pageLayout';
import FullHeightScrollableContainer from '../../components/scrollableContainer';

export enum School {
  Ensimag = 0,
  Phelma,
  E3,
  Papet,
  Gi,
  Polytech,
  Esisar,
  Iae,
  Uga,
  Unknown,
}

export type Account = {
  id: string | undefined,
  firstName: string,
  lastName: string,
  isMember: boolean,
  school: School,
  balance: number,
  stats: {
    quantityDrank: number,
    totalMoney: number,
  },
};

const AccountDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // TODO: with real data
  const account: Account = {
    id: id as string,
    firstName: "John",
    lastName: "Doe",
    isMember: true,
    school: School.Ensimag,
    balance: 1234,
    stats: {
      quantityDrank: 0,
      totalMoney: 0,
    },
  };

  return (
    <>
      <Head>
        <title>{"S'Beer Eck"}</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <PageLayout title="Details du compte" showBackButton hideBottomNavigation>
          <AccountDetails account={account} />
        </PageLayout>
      </main>
    </>
  );
};

export default AccountDetailsPage;
