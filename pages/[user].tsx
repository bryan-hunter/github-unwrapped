import { Player, PlayerRef } from "@remotion/player";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { transparentize } from "polished";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AbsoluteFill } from "remotion";
import { getFont } from "../remotion/font";
import { Main } from "../remotion/Main";
import { CompactStats } from "../remotion/map-response-to-stats";
import { backButton } from "../src/components/button";
import Download from "../src/components/Download";
import { Footer, FOOTER_HEIGHT } from "../src/components/Footer";
import Rerender from "../src/components/Rerender";
import Spinner from "../src/components/spinner";
import { getStatsOrFetch } from "../src/get-stats-or-fetch";
import { BACKGROUND_COLOR, BASE_COLOR } from "../src/palette";
import { RenderProgressOrFinality } from "./api/progress";

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}

const SafeHydrate: React.FC = ({ children }) => {
  return (
    <div suppressHydrationWarning>
      {typeof window === "undefined" ? null : children}
    </div>
  );
};

const iosSafari = () => {
  if (typeof window === "undefined") {
    return false;
  }
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  return iOS && webkit;
};

export const getStaticProps = async ({
  params,
}: {
  params: { user: string };
}) => {
  const { user } = params;

  if (user.length > 40) {
    console.log("Username too long");
    return { notFound: true };
  }

  try {
    const compact = await getStatsOrFetch(user);
    if (!compact) {
      return { notFound: true };
    }
    return {
      props: {
        user: compact,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
};

const style: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxWidth: 800,
  margin: "auto",
  paddingLeft: 20,
  paddingRight: 20,
};

const abs: React.CSSProperties = {
  backgroundColor: BACKGROUND_COLOR,
  width: "100%",
  position: "relative",
};

const container: React.CSSProperties = {
  minHeight: `calc(100vh - ${FOOTER_HEIGHT}px)`,
  width: "100%",
  position: "relative",
};

const title: React.CSSProperties = {
  fontFamily: "Jelle",
  textAlign: "center",
  color: BASE_COLOR,
  marginBottom: 0,
};

const subtitle: React.CSSProperties = {
  fontFamily: "Jelle",
  textAlign: "center",
  fontSize: 20,
  color: "red",
  marginTop: 14,
  marginBottom: 0,
};

const layout: React.CSSProperties = {
  margin: "auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

getFont();

export default function User(props: { user: CompactStats | null }) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const player = useRef<PlayerRef>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = props;

  const router = useRouter();
  const username = ([] as string[]).concat(router.query.user ?? "")[0];

  useEffect(() => {
    if (!ready || !user || !player.current) {
      return;
    }
    player.current.addEventListener("pause", () => {
      setPlaying(false);
    });
    player.current.addEventListener("ended", () => {
      setPlaying(false);
    });
    player.current.addEventListener("play", () => {
      setPlaying(true);
    });
  }, [ready, user]);

  useEffect(() => {
    setReady(true);
  }, []);

  const [downloadProgress, setDownloadProgress] =
    useState<RenderProgressOrFinality | null>(null);
  const [retrying, setRetrying] = useState(false);
  const progressRef = useRef(downloadProgress);
  progressRef.current = downloadProgress;

  const pollProgress = useCallback(async () => {
    const poll = async () => {
      if (!progressRef.current?.renderIdAndBucket?.renderId) {
        return;
      }
      const progress = await fetch("/api/progress", {
        method: "POST",
        body: JSON.stringify({
          username,
          renderId: progressRef.current?.renderIdAndBucket?.renderId,
          bucketName: progressRef.current?.renderIdAndBucket?.bucketName,
        }),
      });
      const progressJson = (await progress.json()) as RenderProgressOrFinality;
      setDownloadProgress(progressJson);
      if (progressJson.type !== "finality") {
        setTimeout(poll, 1000);
      }
    };

    setTimeout(() => {
      poll();
    }, 1000);
  }, [username]);

  const render = useCallback(async () => {
    if (!username) {
      return;
    }
    const res = await fetch("/api/render", {
      method: "POST",
      body: JSON.stringify({
        username,
      }),
    });
    const prog = (await res.json()) as RenderProgressOrFinality;
    setDownloadProgress(prog);
  }, [username]);

  const retry = useCallback(async () => {
    setRetrying(true);
    const res = await fetch("/api/retry", {
      method: "POST",
      body: JSON.stringify({
        username,
      }),
    });
    const prog = (await res.json()) as RenderProgressOrFinality;
    setDownloadProgress(prog);
    setRetrying(false);
  }, [username]);

  const type = downloadProgress?.type ?? null;

  useEffect(() => {
    if (type === "progress") {
      pollProgress();
    }
  }, [type, pollProgress]);

  useEffect(() => {
    if (downloadProgress === null) {
      render();
    }
  }, [downloadProgress, render]);

  if (!user) {
    return (
      <div ref={ref}>
        <Spinner></Spinner>
      </div>
    );
  }

  return (
    <SafeHydrate>
      <div ref={ref}>
        <Head>
          <title>
            {username}
            {"'"}s #GitHubUnwrapped
          </title>
          <meta
            property="og:title"
            content={`${username}'s #GitHubUnwrapped`}
            key="title"
          />

          <meta
            name="description"
            content={`My coding 2021 in review. Get your own personalized video as well!`}
          />
          <link rel="icon" href="/fav.png" />
        </Head>
        <div style={abs}>
          <div style={container}>
            <header style={style}>
              <br></br>
              <br></br>
              <h1 style={title}>Here is your #GitHubUnwrapped!</h1>
              <h3 style={subtitle}>@{username}</h3>
              <div
                style={{
                  height: 20,
                }}
              ></div>
              {user ? (
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <Player
                    ref={player}
                    component={Main}
                    compositionHeight={1080}
                    compositionWidth={1080}
                    durationInFrames={990}
                    fps={30}
                    style={{
                      ...layout,
                      boxShadow: "0 0 10px " + transparentize(0.8, BASE_COLOR),
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                    inputProps={{
                      stats: user,
                      enableDecoration: false,
                    }}
                  ></Player>
                  <AbsoluteFill
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      display: "flex",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      // @ts-expect-error
                      player.current.toggle(e);
                    }}
                  >
                    {playing ? null : (
                      <div
                        style={{
                          width: 200,
                          height: 200,
                          backgroundColor: "white",
                          borderRadius: "50%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          boxShadow:
                            "0 0 40px " + transparentize(0.9, BASE_COLOR),
                        }}
                      >
                        <svg
                          style={{
                            height: 60,
                            transform: `translateX(3px)`,
                          }}
                          viewBox="0 0 448 512"
                        >
                          <path
                            fill={BASE_COLOR}
                            d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                          ></path>
                        </svg>
                        <br />
                        <div
                          style={{
                            color: BASE_COLOR,
                            fontFamily: "Jelle",
                            textTransform: "uppercase",
                            fontSize: 18,
                          }}
                        >
                          Click to play
                        </div>
                      </div>
                    )}
                  </AbsoluteFill>
                </div>
              ) : null}
              <div
                style={{
                  height: 40,
                }}
              ></div>
              <div style={layout}>
                <p
                  style={{
                    color: BASE_COLOR,
                    fontFamily: "Jelle",
                    textAlign: "center",
                  }}
                >
                  Download your video and tweet it using{" "}
                  <span
                    style={{
                      color: "black",
                    }}
                  >
                    #GitHubUnwrapped
                  </span>{" "}
                  hashtag!
                </p>
                <Download
                  downloadProgress={downloadProgress}
                  retry={retry}
                  retrying={retrying}
                  username={username}
                ></Download>
                {iosSafari() ? (
                  <p
                    style={{
                      color: BASE_COLOR,
                      fontFamily: "Jelle",
                      textAlign: "center",
                      fontSize: 12,
                    }}
                  >
                    Tip for iOS Safari: Long press the {'"'}Download button{'"'}
                    , then press {'"'}Download Linked File{'"'} to save the
                    video locally.
                  </p>
                ) : null}
                <div
                  style={{
                    height: 20,
                  }}
                ></div>
                <Link href="/" passHref>
                  <button style={backButton}>View for another user</button>
                </Link>
                <div
                  style={{
                    height: 20,
                  }}
                ></div>
                <Rerender
                  stats={user}
                  downloadProgress={downloadProgress}
                  username={username}
                ></Rerender>
                <br />
                <br />
                <br />
              </div>
            </header>
          </div>
        </div>
        <Footer></Footer>
      </div>
    </SafeHydrate>
  );
}
