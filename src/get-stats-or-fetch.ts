import {
  CompactStats,
  mapResponseToStats,
} from "../remotion/map-response-to-stats";
import { getAll } from "./get-all";

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  throw new TypeError(`Expected GITHUB_TOKEN env variable`);
}

export const getStatsOrFetch = async (
  user: string
): Promise<CompactStats | null> => {
  const ast = await getAll(user, githubToken);
  if (!ast.data.user) {
    return null;
  }
  const compact = mapResponseToStats(ast);

  return compact;
};
