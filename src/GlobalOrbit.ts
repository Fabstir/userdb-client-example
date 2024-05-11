import createDBClient from "fabstirdb-lib";
/**
 * Instance of the OrbitDB client, created using the backend URL.
 */
const dbClient = createDBClient(process.env.NEXT_PUBLIC_BACKEND_URL || "", "");

const getUser = () => {
  if (!dbClient.user) return null;

  const user = dbClient.user();
  console.log("GlobalOrbit.ts: user: ", user);
  return user;
};

console.log(
  "GlobalOrbit.ts: process.env.NEXT_PUBLIC_BACKEND_URL: ",
  process.env.NEXT_PUBLIC_BACKEND_URL
);
console.log("GlobalOrbit.ts: dbClient: ", dbClient);

export { dbClient, getUser };
