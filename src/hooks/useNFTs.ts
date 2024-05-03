// hooks/useNFTs.ts
import { useQuery } from "@tanstack/react-query";
import { dbClient } from "../GlobalOrbit"; // Make sure the path is correct

export const useNFTs = (userPub: string) => {
  return useQuery({
    queryKey: [userPub, "nfts"],
    queryFn: async () => {
      // Using dbClient to load NFTs
      const nfts = await dbClient.user(userPub).get("nfts").load();

      console.log("useNFTs: userPub:", userPub);
      console.log("useNFTs: nfts:", nfts);
      return nfts; // Assuming 'nfts' leads to the collection of NFTs
    },
    staleTime: 5000,
  });
};
