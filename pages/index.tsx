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
let Gun, SEA;

// Check if the code is running on the client-side
if (typeof window !== "undefined") {
  Gun = require("gun/gun");
  SEA = require("gun/sea");
}

dbClient.on("auth", async (event) => {
  const user = getUser();
  console.log("index: auth event emitted, user.is = ", user?.is);
});

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
  const [userIs, setUserIs] = useState<boolean>(false);
  const { createNFT } = useCreateNFT();
  const queryClient = useQueryClient();
  const [userPub1, setUserPub1] = useRecoilState(userpubstate1);
  const [userPub2, setUserPub2] = useRecoilState(userpubstate2);
  const [message, setMessage] = useState<string>("");
  const [userAliases, setUserAliases] = useState({});

  const user = getUser();

  useEffect(() => {
    console.log("index: user: ", user);

    // Check if user session exists
    console.log("index.tsx: useEffect: user: ", user);
    if (user?.session) {
      const session = user.session();
      if (session) {
        setUserSession(session);
      }
    }
  }, []);

  const isUserExists = async (alias: string) => {
    return new Promise((resolve) => {
      dbClient.get(`~@${alias}`).once((data: any) => {
        resolve(data !== undefined);
      });
    });
  };

  useEffect(() => {
    console.log("index: user.session() =", user.session());
    console.log("index: user.is =", user.is);
    setUserIs(user.is);

    const checkUserExists = async () => {
      if (user.is) {
        const exists = await isUserExists(user.is.alias);
        console.log("index: isUserExists =", exists);
      }
    };

    checkUserExists();
  }, [user, userSession]);

  const handleLoginUser = async (alias: string, password: string) => {
    if (!(await isUserExists(alias))) {
      user.create(alias, password, (error: Error, keys: any) => {
        if (error) {
          console.error("User creation failed:", error);
        } else {
          console.log("User created successfully, user keys:", keys);
          setUserSession(user.session());
          setUserAliases((prev) => ({ ...prev, [alias]: true }));
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
    user.logout();
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

  const handleAddWriteAccessAll = async () => {
    const userPub = user.is.pub;

    await user.addWriteAcess(`users/${userPub}/nfts`, "*");
    console.log("handleAddWriteAccess: user1:", userPub1);
    console.log("handleAddWriteAccess: user2:", userPub2);
    console.log(
      `handleAddWriteAccess: user ${
        userPub === userPub1 ? "user1" : "user2"
      } gave write permission to all users`
    );
  };

  const handleLoadContentAddressed = async () => {
    const data = { message: "hello world" };

    const hash = await SEA.work(data, null, null, { name: "SHA-256" });

    const user = dbClient.user();

    try {
      await user
        .get("#")
        .get(hash)
        .put(data, undefined, (ackError: any) => {
          console.error(ackError);
        });

      const message = await new Promise((res) =>
        user
          .get("#")
          .get(hash)
          .once((final_value: any) => res(final_value))
      );

      console.log("handleLoadContentAddressed: message:", message);
      setMessage(message.message);
    } catch (error) {
      console.error(
        "Error occurred while loading content addressed data:",
        error
      );
    }
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
      .user(userPub1)
      .get("nfts")
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
              "handleSaveTestData: Saved data for user2 to user1:",
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
        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleLoginUser("test1", "mypassword1")}
          >
            {!userAliases["test1"] ? "Create user 1" : "Auth user 1"}
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleLoginUser("test2", "mypassword2")}
          >
            {!userAliases["test2"] ? "Create user 2" : "Auth user 2"}
          </button>
        </div>

        <div>user.is is {userIs ? "true" : "false"}</div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="mb-6">
          <h1>Welcome, {(userSession as UserSession).alias}!</h1>
        </div>
        <div className="mb-6">user.is is {userIs ? "true" : "false"}</div>
        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleSaveUserPub1()}
          >
            Save UserPub1
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleSaveUserPub2()}
          >
            Save UserPub2
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleAddWriteAccess()}
          >
            User2 Add Write Access for user1
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleAddWriteAccessAll()}
          >
            User Adds Write Access for all users
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleSaveTestData()}
          >
            User 1 Save test data to another User2 path
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleSaveTestData2()}
          >
            User 2 Save test data to another User1 path
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleLoadData("/nfts_data.json")}
          >
            Load1
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleLoadData("/nfts_data2.json")}
          >
            Load2
          </button>
        </div>

        <div className="mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-4"
            onClick={() => handleLoadContentAddressed()}
          >
            Test content addressed
          </button>
          <p className="italic">
            This will save a message `hello world` to the database and retrieve
            it using the hash
          </p>
          {message}
        </div>

        <UserNFTs userPub={(userSession as UserSession).keys.pub} />
      </div>
    );
  }
}
