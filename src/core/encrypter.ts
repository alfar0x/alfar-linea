// export const encodeStringWithSecret = (secret: string, decoded: string) => {
//   const enc = [];

//   for (let i = 0; i < decoded.length; i += 1) {
//     const keyC = secret[i % secret.length];
//     const encC = `${String.fromCharCode(
//       (decoded[i].charCodeAt(0) + keyC.charCodeAt(0)) % 256
//     )}`;
//     enc.push(encC);
//   }

//   const str = enc.join("");

//   return Buffer.from(str, "binary").toString("base64");
// };

// export const decodeStringWithSecret = (secret: string, encoded: string) => {
//   const dec = [];
//   const enc = Buffer.from(encoded, "base64").toString("binary");

//   for (let i = 0; i < enc.length; i += 1) {
//     const keyC = secret[i % secret.length];
//     const decC = `${String.fromCharCode(
//       (256 + enc[i].charCodeAt(0) - keyC.charCodeAt(0)) % 256
//     )}`;
//     dec.push(decC);
//   }

//   return dec.join("");
// };

import crypto from "crypto";

export class Encrypter {
  algorithm = "aes256";
  salt = "salt";

  private getKey(secret: string) {
    return crypto.scryptSync(secret, this.salt, 32);
  }

  encrypt(secret: string, decoded: string) {
    const iv = crypto.randomBytes(16);
    const key = this.getKey(secret);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = cipher.update(decoded, "utf8", "hex");
    return [
      encrypted + cipher.final("hex"),
      Buffer.from(iv).toString("hex"),
    ].join("|");
  }

  decrypt(secret: string, encoded: string) {
    const [encrypted, iv] = encoded.split("|");
    if (!iv) throw new Error("IV not found");
    const key = this.getKey(secret);
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(iv, "hex"),
    );
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  }
}

export default Encrypter;
