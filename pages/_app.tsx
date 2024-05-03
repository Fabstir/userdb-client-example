// pages/_app.tsx
import { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { libsodium } from "../src/utils/libsodium";
import * as sodium from "libsodium-wrappers";
import { readlinkSync } from "fs";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [libsodiumReady, setLibsodiumReady] = useState(false);

  useEffect(() => {
    async function initializeLibsodium() {
      await libsodium.ensureReady();
      await sodium.ready;
      console.log("_app: sodium:", sodium);

      setLibsodiumReady(true);
    }

    initializeLibsodium();
  }, []);

  useEffect(() => {
    if (libsodiumReady) {
      // Test generating a key pair
      libsodium
        .pair()
        .then((keyPair) => {
          console.log("Key pair generated:", keyPair);
        })
        .catch((error) => {
          console.error("Failed to generate key pair:", error);
        });
    }
  }, [libsodiumReady]);

  if (!libsodiumReady) {
    return <div>Loading encryption module...</div>; // Or some other loading indicator
  }

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </RecoilRoot>
  );
}
