// hooks/useCreateNFT.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getNFTAddressId } from "../utils/nftUtils"; // Ensure the correct path
import { user } from "../user";

interface NFT {
  address: string;
  id: string;
  name: string;
  description: string;
}

export const useCreateNFT = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<any, Error, NFT>({
    mutationFn: async (nft: NFT) => {
      const addressId = getNFTAddressId(nft);
      // Await the asynchronous put operation and handle callbacks within the put function
      return user.get("nfts").get(addressId).put(nft);
    },
    onSuccess: () => {
      // Invalidate the 'nfts' cache to update the list on successful mutation
      const userPub = user.is.pub;
      queryClient.invalidateQueries({ queryKey: [userPub, "nfts"] });
    },
    onError: (error) => {
      // Log or handle error
      console.error("Error in mutation:", error);
    },
  });

  const createNFT = (nft: NFT) => {
    mutation.mutate(nft);
  };

  return { createNFT };
};
