import {
  getFunctions,
  getRenderProgress,
  renderMediaOnLambda,
  RenderMediaOnLambdaOutput,
  RenderProgress,
} from "@remotion/lambda";
import { RenderProgressOrFinality } from "../pages/api/progress";
import { CompactStats } from "../remotion/map-response-to-stats";
import { COMP_NAME, SITE_ID } from "./config";

export type Finality =
  | {
      type: "success";
      url: string;
    }
  | {
      type: "error";
      errors: string;
    };

export const getRenderOrMake = async (
  username: string,
  statsOrRenderIdAndBucket: CompactStats | RenderMediaOnLambdaOutput,
): Promise<RenderProgressOrFinality> => {
  let _renderId: string | null = null;
  let _bucketName: string | null = null;
  try {
    const region = 'us-east-1';
    const [first] = await getFunctions({
      compatibleOnly: true,
      region,
    });
    console.log(`Username=${username} Region=${region}`);
    if (!(statsOrRenderIdAndBucket as RenderMediaOnLambdaOutput).renderId) {
      const renderMediaOnLambdaOutput = await renderMediaOnLambda({
        region: region,
        functionName: first.functionName,
        serveUrl: SITE_ID,
        composition: COMP_NAME,
        inputProps: { stats: (statsOrRenderIdAndBucket as CompactStats) },
        codec: "h264",
        imageFormat: "jpeg",
        maxRetries: 1,
        privacy: "public",
        downloadBehavior: {
          type: "download",
          fileName: `${username}.mp4`,
        },
      });
      _renderId = renderMediaOnLambdaOutput.renderId;
      _bucketName = renderMediaOnLambdaOutput.bucketName;
    } else {
      _renderId = (statsOrRenderIdAndBucket as RenderMediaOnLambdaOutput).renderId;
      _bucketName = (statsOrRenderIdAndBucket as RenderMediaOnLambdaOutput).bucketName;
    }
    const progress = await getRenderProgress({
      renderId: _renderId,
      bucketName: _bucketName,
      functionName: first.functionName,
      region: region,
    });
    const finality = getFinality(progress);

    if (finality) {
      return {
        type: "finality",
        finality,
        renderIdAndBucket: {
          renderId: _renderId,
          bucketName: _bucketName,
        },
      };
    }
  
    return {
      type: "progress",
      progress: {
        percent: progress.overallProgress,
      },
      renderIdAndBucket: {
        renderId: _renderId,
        bucketName: _bucketName,
      },
    };
  } catch (err) {
    console.log(`Failed to render video for ${username}`, (err as Error).stack);
    return {
      finality: {
        type: "error",
        errors: (err as Error).stack as string,
      },
      type: "finality",
    };
  }
};

export const getFinality = (
  renderProgress: RenderProgress
): Finality | null => {
  if (renderProgress.outputFile) {
    return {
      type: "success",
      url: renderProgress.outputFile,
    };
  }
  if (renderProgress.fatalErrorEncountered) {
    return {
      type: "error",
      errors: renderProgress.errors[0].stack,
    };
  }
  return null;
};
