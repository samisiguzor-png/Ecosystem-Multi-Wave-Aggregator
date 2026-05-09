import { GraphQLClient, gql } from "graphql-request";

export const indexerClient = new GraphQLClient(
  process.env.INDEXER_URL ?? "https://api.thegraph.com/subgraphs/name/drips/waves"
);

export const GET_ACTIVE_WAVES = gql`
  query GetActiveWaves {
    waves(where: { status: "ACTIVE" }) {
      id
      ecosystem
      totalPointsAllocated
      rewardPool {
        amount
        tokenSymbol
      }
      endDate
    }
  }
`;

export const GET_LEADERBOARD = gql`
  query GetLeaderboard {
    contributors(orderBy: totalPoints, orderDirection: desc, first: 50) {
      id
      githubHandle
      totalPoints
      ecosystems
    }
  }
`;
