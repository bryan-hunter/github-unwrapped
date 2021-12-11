import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { getFont } from "../remotion/font";
import { button } from "../src/components/button";
import { BACKGROUND_COLOR, BASE_COLOR } from "../src/palette";

const input = (loading: boolean): React.CSSProperties => ({
  padding: 16,
  border: "2px solid transparent",
  borderRadius: 8,
  fontSize: 28,
  fontFamily: "inherit",
});

const container: React.CSSProperties = {
  backgroundColor: BACKGROUND_COLOR,
  height: "100%",
  width: "100%",
  position: "absolute",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
};

const headerStyle: React.CSSProperties = {
  maxWidth: 800,
  paddingLeft: 20,
  paddingRight: 20,
  textAlign: "center",
};

const h1: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: 48,
  color: BASE_COLOR,
  fontFamily: "Jelle",
};

const paragraph: React.CSSProperties = {
  color: BASE_COLOR,
  lineHeight: 1.5,
};

getFont();

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit: React.FormEventHandler = useCallback(
    (e) => {
      e.preventDefault();
      if (username.trim() === "") {
        return;
      }
      setLoading(true);
      router.push(`/${username}`);
    },
    [router, username]
  );

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      e.preventDefault();
      setUsername(e.target.value);
    },
    []
  );

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={container}>
        <header style={headerStyle}>
          <div style={h1}>Your coding year in review</div>
          <p style={paragraph}>
            Get a personalized video of your Github activity in 2021. Type your
            username to get started!
          </p>
          <br />

          <form onSubmit={onSubmit}>
            <input
              autoFocus
              value={username}
              onChange={onChange}
              type={"text"}
              disabled={loading}
              style={input(loading)}
              placeholder="GitHub username"
            ></input>
            <br />
            <br />
            <input
              style={button}
              type="submit"
              value={loading ? "Getting your Wrapped..." : "Get your Wrapped"}
            />
          </form>
        </header>
      </div>
    </div>
  );
}
