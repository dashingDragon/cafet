import { NextPage } from "next";
import Head from "next/head";
import Login from "../components/login";

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{"Kafet"}</title>
        <meta name="description" content="Kafet App" />
      </Head>

      <main>
        <Login />
      </main>
    </>
  );
};

export default LoginPage;
