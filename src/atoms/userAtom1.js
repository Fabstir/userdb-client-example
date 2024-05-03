import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
const { persistAtom } = recoilPersist();

export const userpubstate1 = atom({
  key: "userPubAtom1",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
