import crypto from "crypto";

export class Encrypter {
  private algorithm = "aes256";
  private salt = "salt";

  private getKey(secret: string) {
    return crypto.scryptSync(secret, this.salt, 32);
  }

  public encrypt(secret: string, decoded: string) {
    const iv = crypto.randomBytes(16);
    const key = this.getKey(secret);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = cipher.update(decoded, "utf8", "hex");
    return [
      encrypted + cipher.final("hex"),
      Buffer.from(iv).toString("hex"),
    ].join("|");
  }

  public decrypt(secret: string, encoded: string) {
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
