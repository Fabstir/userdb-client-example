// hooks/useNFT.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { dbClient } from "../GlobalOrbit"; // Assuming this is the correct import path
import { queryClient } from "../queryClient";
import { getNFTAddressId } from "../utils/nftUtils";

interface NFT {
  address: string;
  id: string;
  name: string;
  description: string;
}

const fetchNFT = async (
  userPub: string,
  nftAddressId: string
): Promise<NFT | null> => {
  if (!nftAddressId) return null;

  const nft = await dbClient.user(userPub).get("nfts").get(nftAddressId).load();
  return nft;
};

export default function useNFT(
  userPub: string,
  nftAddressId: string
): UseQueryResult<NFT | null, Error> {
  return useQuery<NFT | null, Error>({
    queryKey: [userPub, "nft", nftAddressId],
    queryFn: () => fetchNFT(userPub, nftAddressId),
    staleTime: 10000, // Data is considered fresh for 10 seconds
    gcTime: 600000,
    enabled: !!nftAddressId, // The query will not run until nftAddressId is truthy
    placeholderData: () => {
      const cache = queryClient.getQueryData<NFT[]>(["userPub, nfts"]);
      return (
        cache?.find((nft: any) => getNFTAddressId(nft) === nftAddressId) || null
      );
    },
  });
}
