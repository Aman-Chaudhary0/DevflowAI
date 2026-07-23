import ImageKit from "imagekit";

//  The imagekit instance is configured with public and private keys, and a URL endpoint for image management.
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "missing_public_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "missing_private_key",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/missing"
});
