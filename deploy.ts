import {
  AwsRegion,
  deployFunction,
  deploySite,
  getOrCreateBucket,
} from "@remotion/lambda";
import dotenv from "dotenv";
import path from "path";
import { SITE_ID } from "./src/config";
dotenv.config();

console.log(`Found 1 accounts. Deploying...`);

export const usedRegions: AwsRegion[] = ['us-east-1'];

const execute = async () => {
    for (const region of usedRegions) {
      const { functionName, alreadyExisted } = await deployFunction({
        architecture: "arm64",
        createCloudWatchLogGroup: true,
        memorySizeInMb: 2048,
        timeoutInSeconds: 240,
        region,
      });
      console.log(
        `${
          alreadyExisted ? "Ensured" : "Deployed"
        } function "${functionName}" to ${region}`
      );
      const { bucketName } = await getOrCreateBucket({ region });
      const { serveUrl } = await deploySite({
        siteName: SITE_ID,
        bucketName,
        entryPoint: path.join(process.cwd(), "remotion/index.tsx"),
        region,
      });
      console.log(
        `Deployed site to ${region} under ${serveUrl}`
      );
    }
};

execute()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
