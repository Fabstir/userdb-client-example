import { useEffect, useState } from "react";
import { useCreateNFT } from "../src/hooks/useCreateNFT";
import { useNFTs } from "../src/hooks/useNFTs";
import { useRecoilState } from "recoil";

// Ensure this path is correct
import { useQueryClient } from "@tanstack/react-query";
import UserNFTs from "../src/components/userNFTs";
import { userpubstate1 } from "../src/atoms/userAtom1";
import { userpubstate2 } from "../src/atoms/userAtom2";
import { dbClient, getUser } from "../src/GlobalOrbit";

type UserKeys = {
  priv: string;
  pub: string;
  epriv?: string;
  epub?: string;
};

type UserSession = {
  alias: string;
  keys: UserKeys;
};

export default function Home() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const { createNFT } = useCreateNFT();
  const queryClient = useQueryClient();
  const [userPub1, setUserPub1] = useRecoilState(userpubstate1);
  const [userPub2, setUserPub2] = useRecoilState(userpubstate2);

  const user = getUser();
  console.log("index.tsx: user: ", user);

  useEffect(() => {
    // Check if user session exists
    console.log("index.tsx: useEffect: user: ", user);
    if (user?.session) {
      const session = user.session();
      if (session) {
        setUserSession(session);
      }
    }
  }, []);

  const handleLogin = async (alias: string, password: string) => {
    // const alias = "test2";
    // const password = "mypassword";
    // The ready check is no longer necessary here since libsodium is initialized at the app level

    if (!(await user?.exists(alias))) {
      user.create(alias, password, (error: Error, keys: any) => {
        if (error) {
          console.error("User creation failed:", error);
        } else {
          console.log("User created successfully, user keys:", keys);
          setUserSession(user.session());
        }
      });
    } else
      user.auth(alias, password, (error: Error, keys: any) => {
        if (error) {
          console.error("Login failed:", error);
        } else {
          console.log("Logged in successfully, user keys:", keys);
          setUserSession(user.session());
        }
      });

    // Clear the react-query cache
    queryClient.removeQueries();
  };

  const handleLogout = () => {
    // Clear the user session here
    setUserSession(null);
  };

  const handleLoadData = async (dataPath: string) => {
    if (userSession) {
      const response = await fetch(dataPath);
      const { nfts } = await response.json();
      nfts.forEach(async (nft: any) => {
        createNFT(nft as any);
      });
    }
  };

  const handleSaveUserPub1 = () => {
    // Clear the user session here
    const userPub = user.is.pub;

    setUserPub1(userPub);
    console.log("handleSaveUserPub1: Saved userPub1:", userPub);
  };

  const handleSaveUserPub2 = () => {
    // Clear the user session here
    const userPub = user.is.pub;

    setUserPub2(userPub);

    console.log(": Saved userPub2:", userPub);
  };

  const handleAddWriteAccess = async () => {
    const userPub = user.is.pub;

    await user.addWriteAcess(`users/${userPub}/nfts`, userPub1);
    console.log("handleAddWriteAccess: user1:", userPub1);
    console.log("handleAddWriteAccess: user2:", userPub2);
    console.log("handleAddWriteAccess: User2 gave write permission to user1");
  };

  const handleSaveTestData = async () => {
    // Clear the user session here
    await dbClient
      .user(userPub2)
      .get("nfts")
      .put(
        {
          address: "0x43500C0340ACfFeC80D44d0EF4eA96DcB7628398",
          id: "1000",
          name: "hello world",
        },
        undefined,
        (ack: any) => {
          if (!ack.err) {
            console.log("Put operation successful");
            console.log("handleSaveTestData: user1:", userPub1);
            console.log("handleSaveTestData: user2:", userPub2);
            console.log(
              "handleSaveTestData: Saved data for user1 to user2:",
              userPub1
            );
          } else {
            console.error("Put operation failed:", ack.err);
          }
        }
      );
  };

  const handleSaveTestData2 = async () => {
    // Clear the user session here
    await dbClient
      .user(userPub2)
      .get("hey")
      .put(
        {
          address: "0x53500C03409CfFeC90D44d0FF4eA96DcB7628398",
          id: "1001",
          name: "hello Mars",
        },
        undefined,
        (ack: any) => {
          if (!ack.err) {
            console.log("Put operation successful");
            console.log("handleSaveTestData: user1:", userPub1);
            console.log("handleSaveTestData: user2:", userPub2);
            console.log(
              "handleSaveTestData: Saved data for user1 to user2:",
              userPub1
            );
          } else {
            console.error("Put operation failed:", ack.err);
          }
        }
      );
  };

  if (!userSession) {
    return (
      <div>
        <div>
          <button onClick={() => handleLogin("test1", "mypassword1")}>
            Login
          </button>
        </div>
        <div>
          <button onClick={() => handleLogin("test2", "mypassword2")}>
            Login 2
          </button>
        </div>
        {/* <button onClick={() => handleDisplayData()}>Display</button> */}
      </div>
    );
  } else {
    return (
      <div>
        <div>
          <h1>Welcome, {(userSession as UserSession).alias}!</h1>
        </div>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div>
          <button onClick={() => handleSaveUserPub1()}>Save UserPub1</button>
        </div>

        <div>
          <button onClick={() => handleSaveUserPub2()}>Save UserPub2</button>
        </div>

        <div>
          <button onClick={() => handleAddWriteAccess()}>
            User2 Add Write Access for user1
          </button>
        </div>

        <div>
          <button onClick={() => handleSaveTestData()}>
            User 1 Save test data to User2
          </button>
        </div>

        <div>
          <button onClick={() => handleSaveTestData2()}>
            User 1 Save test data to another User2 path
          </button>
        </div>

        <div>
          <button onClick={() => handleLoadData("/nfts_data.json")}>
            Load1
          </button>
        </div>

        <div>
          <button onClick={() => handleLoadData("/nfts_data2.json")}>
            Load2
          </button>
        </div>

        <UserNFTs userPub={(userSession as UserSession).keys.pub} />
      </div>
    );
  }
  // if (isLoading) return <div>Loading...</div>;
}
