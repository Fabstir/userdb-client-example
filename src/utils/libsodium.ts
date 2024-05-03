// libsodium.ts
import {
  ready,
  from_string,
  to_string,
  crypto_sign_keypair,
  crypto_sign,
  crypto_sign_open,
  crypto_secretbox_NONCEBYTES,
  crypto_secretbox_easy,
  crypto_secretbox_KEYBYTES,
  crypto_secretbox_open_easy,
  to_base64,
  from_base64,
  crypto_sign_seed_keypair,
  crypto_generichash,
} from "libsodium-wrappers";
import bcrypt from "bcryptjs";

const sodium_base64_VARIANT_URLSAFE_NO_PADDING = 7;

async function generateSeedFromPassword(username: string, password: string) {
  await ready;
  const seedInput = username + password; // Combine or use a more complex scheme
  const seed = crypto_generichash(32, from_string(seedInput)); // Hash to get a 32-byte seed
  return seed;
}

export const libsodium = {
  ready: false,

  async ensureReady() {
    if (!this.ready) {
      await ready;
      this.ready = true;
    }
  },

  async generateKeyPairFromSeed(username: string, password: string) {
    const seed = await generateSeedFromPassword(username, password);
    return crypto_sign_seed_keypair(seed);
  },

  async pair() {
    await this.ensureReady();
    const { publicKey, privateKey } = crypto_sign_keypair();
    return {
      pub: to_base64(publicKey, sodium_base64_VARIANT_URLSAFE_NO_PADDING),
      priv: to_base64(privateKey, sodium_base64_VARIANT_URLSAFE_NO_PADDING),
    };
  },

  async sign(message: string, keyPair: { priv: string }) {
    await this.ensureReady();
    const msgUint8 = from_string(message);
    const signedMsg = crypto_sign(msgUint8, from_string(keyPair.priv));
    return to_string(signedMsg);
  },

  async verify(signedMessage: string, pubKey: string) {
    await this.ensureReady();
    const signedMsgUint8 = from_string(signedMessage);
    const message = crypto_sign_open(signedMsgUint8, from_string(pubKey));
    if (message) {
      return to_string(message);
    }
    throw new Error("Invalid signature");
  },

  async encrypt(message: string, keyPair: { priv: string; pub: string }) {
    await this.ensureReady();
    const nonce = randombytes_buf(crypto_secretbox_NONCEBYTES);
    const key = from_string(keyPair.priv.substr(0, crypto_secretbox_KEYBYTES));
    const encryptedMsg = crypto_secretbox_easy(
      from_string(message),
      nonce,
      key
    );
    return { cipher: to_string(encryptedMsg), nonce: to_string(nonce) };
  },

  async decrypt(
    cipherData: { cipher: string; nonce: string },
    keyPair: { priv: string }
  ) {
    await this.ensureReady();
    const nonce = from_string(cipherData.nonce);
    const key = from_string(keyPair.priv.substr(0, crypto_secretbox_KEYBYTES));
    const decryptedMsg = crypto_secretbox_open_easy(
      from_string(cipherData.cipher),
      nonce,
      key
    );
    if (decryptedMsg) {
      return to_string(decryptedMsg);
    }
    throw new Error("Decryption failed");
  },

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  async verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },
};
