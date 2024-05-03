import createDBClient from "./utils/createtDBClient";

/**
 * Instance of the OrbitDB client, created using the backend URL.
 */
let dbClient = createDBClient(process.env.NEXT_PUBLIC_BACKEND_URL || "");

/**
 * Updates the OrbitDB client with a new instance created using the provided user public key.
 *
 * @param {string} userPubKey - The user's public key.
 */
export const updateDbClient = (userPubKey: string) => {
  dbClient = createDBClient(
    process.env.NEXT_PUBLIC_BACKEND_URL || "",
    userPubKey
  );
};

/**
 * Resets the OrbitDB client with a new instance created using the backend URL.
 */
export const resetDbClient = () => {
  dbClient = createDBClient(process.env.NEXT_PUBLIC_BACKEND_URL || "");
};

export { dbClient };
