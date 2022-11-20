import type { NextApiRequest, NextApiResponse } from "next";
import { Finality, getRenderOrMake } from "../../src/get-render-or-make";

type RequestData = {
  username: string;
};

type RenderIdAndBucket = {
  renderId: string,
  bucketName: string,
};

export type RenderProgressOrFinality =
  | {
      type: "progress";
      progress: {
        percent: number;
      };
      renderIdAndBucket: RenderIdAndBucket;
    }
  | {
      type: "finality";
      finality: Finality;
      renderIdAndBucket?: RenderIdAndBucket;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RenderProgressOrFinality>
) {
  const body = JSON.parse(req.body) as RequestData & RenderIdAndBucket;
  const prog = await getRenderOrMake(body.username, { renderId: body.renderId, bucketName: body.bucketName });

  res.status(200).json(prog);
  return;
}
