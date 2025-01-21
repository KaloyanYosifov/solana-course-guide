import 'dotenv/config';
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";

const connection = new Connection(clusterApiUrl('devnet'));
const user = getKeypairFromEnvironment('SECRET_KEY');

console.log('Loaded user: ', user.publicKey.toString());

const umi = createUmi(connection);
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi
    .use(keypairIdentity(umiKeypair))
    .use(mplTokenMetadata())
    .use(irysUploader());

const collectionImagePath = path.resolve(__dirname, 'nft-collection.jpeg');
const collectionFile = createGenericFile(await fs.readFile(collectionImagePath), collectionImagePath, {
    contentType: 'image/jpg',
});
const [collectionImageUrl] = await umi.uploader.upload([collectionFile]);
console.log(`Collection image uri: ${collectionImageUrl}`);

// offchain json, to Arweave using irys
const collectionMetadataUri = await umi.uploader.uploadJson({
    name: 'Damn Carmen',
    symbol: 'DC',
    description: 'Damn Carmen collection for OGs only!',
    image: collectionImageUrl,
});
console.log(`NFT Collection metadata URI: ${collectionMetadataUri}`);

const collectionMint = generateSigner(umi);
const transaction = createNft(umi, {
    mint: collectionMint,
    name: 'Damn Carmen',
    uri: collectionMetadataUri,
    updateAuthority: umi.identity.publicKey,
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});
transaction.sendAndConfirm(umi);

const explorerLink = getExplorerLink('address', collectionMint.publicKey, 'devnet');;
console.log(`NFT Collection explorer link:  ${explorerLink}`);
console.log(`NFT Colleciton address is:`, collectionMint.publicKey);
console.log("✅ Finished successfully!");
