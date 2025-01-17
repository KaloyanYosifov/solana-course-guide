import 'dotenv/config';
import { getKeypairFromEnvironment, getExplorerLink  } from '@solana-developers/helpers';
import { Connection, PublicKey, Transaction, clusterApiUrl, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';

const connection = new Connection(clusterApiUrl('devnet'));
const payer = getKeypairFromEnvironment('SECRET_KEY');
const owner = getKeypairFromEnvironment('SECRET_KEY_2');

console.log('Prepared connection and initiator!');

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);
// const tokenMintAccount = new PublicKey('Z8sBGJDhKbQAvai9CTRCEaKi6Q8pcyaRzZKEVZE4vE4'); // first token
const tokenMintAccount = new PublicKey('CVLFjVaHrH5Ue8sBkS4y5iaoUm8EdGvtsjpQ6MJiM5ve');
const metadata = {
    name: 'Another Account Another Token',
    symbol: "AAAT",
    uri: 'https://tokenexplorer.com',
    sellerFeeBasisPoints: 1000,
    creators: null,
    collection: null,
    uses: null,
};
const [metadataHolderPDA] = PublicKey.findProgramAddressSync(
    [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        tokenMintAccount.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
);
const transaction = new Transaction();
const createMetadataAccountInstruction = createCreateMetadataAccountV3Instruction(
    {
        metadata: metadataHolderPDA,
        mint: tokenMintAccount,
        payer: payer.publicKey,
        mintAuthority: owner.publicKey,
        updateAuthority: owner.publicKey,
    },
    {
        createMetadataAccountArgsV3: {
            collectionDetails: null,
            data: metadata,
            isMutable: true,
        }
    }
);

transaction.add(createMetadataAccountInstruction);
const latestBlockhash = await connection._blockhashWithExpiryBlockHeight(true);
transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
transaction.recentBlockhash = latestBlockhash.blockhash;

transaction.sign(payer);
transaction.partialSign(owner);
console.log(transaction.toJSON())
const transactionSignature = await sendAndConfirmRawTransaction(
    connection,
    transaction.serialize(),
);
const link = getExplorerLink(
    'transaction',
    transactionSignature,
    'devnet',
);

console.log(`Transaction confirmed: ${link}`);

const tokenMintLink = getExplorerLink(
    'address',
    tokenMintAccount.toString(),
    'devnet',
);

console.log(`Token mint: ${tokenMintLink}`);
