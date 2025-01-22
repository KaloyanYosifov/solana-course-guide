import 'dotenv/config';
import {
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  keypairIdentity,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection } from "@solana/web3.js";

const user = getKeypairFromEnvironment('SECRET_KEY');
console.log("Loaded user:", user.publicKey.toString());

const umi = createUmi(new Connection(clusterApiUrl("devnet")));
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());

const nftCollection = UMIPublicKey(process.env.COLLECTION_NFT_ADDRESS);
console.log(`NFT Collection address: ${process.env.COLLECTION_NFT_ADDRESS}`);

const nftToken = UMIPublicKey(process.env.NFT_TOKEN_ADDRESS);
console.log(`NFT Token address: ${process.env.COLLECTION_NFT_ADDRESS}`);

const metadata = findMetadataPda(umi, { mint: nftToken });
const transaction = verifyCollectionV1(umi, {
    metadata,
    collectionMint: nftCollection,
    authority: umi.identity,
});

await transaction.sendAndConfirm(umi);

const explorerLink = getExplorerLink("address", nftToken, "devnet");
console.log(`NFT Token verified:  ${explorerLink}`);
