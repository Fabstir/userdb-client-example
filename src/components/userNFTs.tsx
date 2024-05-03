import { useNFTs } from "../hooks/useNFTs";

// Define a new component that displays the NFTs for a user
const UserNFTs = ({ userPub }: { userPub: string }) => {
  const { data: nfts, isLoading } = useNFTs(userPub);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-2">
      {userPub &&
        nfts &&
        nfts.map((nft, index) => (
          <div key={index}>
            <h1>{nft.name}</h1>
            <p>{nft.summary}</p>
          </div>
        ))}
    </div>
  );
};

export default UserNFTs;
