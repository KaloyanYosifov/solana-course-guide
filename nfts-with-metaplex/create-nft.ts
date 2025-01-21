import 'dotenv/config';
import {
  createNft,
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromEnvironment,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";

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

const nftData = {
    name: 'Damn Carmen #1',
    symbol: 'DC1',
    description: 'First nft token of Damn Carmen collection',
    sellerFeeBasisPoints: percentAmount(0),
};
const nftImagePath = path.resolve(__dirname, 'nft.jpeg');
const nftImageFile = createGenericFile(await fs.readFile(nftImagePath), nftImagePath, {
    contentType: 'image/jpeg',
});
const [nftImageUri] = await umi.uploader.upload([nftImageFile]);
console.log(`NFT Image Uri: ${nftImageUri}`);

const nftDataUri = await umi.uploader.uploadJson({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: nftImageUri,
});
console.log(`NFT JSON URI: ${nftDataUri}`);

const nftTokenMintKeypair = generateSigner(umi);

// create and mint NFT
const transaction = createNft(umi, {
  mint: nftTokenMintKeypair,
  name: nftData.name,
  symbol: nftData.symbol,
  uri: nftDataUri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
  collection: {
    key: nftCollection,
    verified: false,
  },
});

await transaction.sendAndConfirm(umi, { send: { commitment: "finalized" } })

const explorerLink = getExplorerLink("address", nftTokenMintKeypair.publicKey, "devnet");
console.log(`NFT Token explorer link:  ${explorerLink}`);
console.log(`NFT Token Address:  ${nftTokenMintKeypair.publicKey.toString()}`);
