import { NextApiRequest, NextApiResponse } from "next";

type RequestData = {
  username: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{}>
) {
  const body = JSON.parse(req.body) as RequestData;
  res.status(200).json({});
}
