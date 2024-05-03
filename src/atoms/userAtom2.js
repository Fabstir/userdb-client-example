import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
const { persistAtom } = recoilPersist();

export const userpubstate2 = atom({
  key: "userPubAtom2",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
