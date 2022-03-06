import { NextPage } from "next";
import Head from "next/head";
import Login from "../components/login";

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{"S'Beer Eck"}</title>
        <meta name="description" content="S'Beer Eck App" />
      </Head>

      <main>
        <Login />
      </main>
    </>
  );
};

export default LoginPage;
