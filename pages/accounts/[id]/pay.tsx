import { Typography } from "@mui/material";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import PageLayout from '../../../components/pageLayout';
import { Account, School } from "../[id]";

// TODO: all

const AccountPayPage: NextPage = () => {
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
        <PageLayout title={`Encaisser ${account.firstName} ${account.lastName}`}>
          <Typography>Hi</Typography>
        </PageLayout>
      </main>
    </>
  );
};

export default AccountPayPage;
