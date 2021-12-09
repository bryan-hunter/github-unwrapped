import { lighten } from "polished";
import React from "react";
import { AbsoluteFill } from "remotion";
import { BACKGROUND_COLOR, BASE_COLOR } from "../src/palette";

const title: React.CSSProperties = {
  textAlign: "center",
  fontSize: 70,
  fontFamily: "sans-serif",
  color: BASE_COLOR,
  fontWeight: "bold",
};

const subtitle: React.CSSProperties = {
  textAlign: "center",
  fontSize: 36,
  fontFamily: "sans-serif",
  color: BASE_COLOR,
  fontWeight: "bold",
  marginTop: 12,
};

export const EndCard: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: lighten(0.08, BACKGROUND_COLOR),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={title}>
        What a year!<br></br>#GithubWrapped
      </div>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
        }}
      >
        <div style={subtitle}>githubwrapped.com</div>
        <div style={subtitle}>Made using Remotion</div>
        <div
          style={{
            height: 40,
          }}
        ></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};