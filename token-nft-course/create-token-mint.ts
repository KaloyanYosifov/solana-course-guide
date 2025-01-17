import 'dotenv/config';
import { getKeypairFromEnvironment, getExplorerLink  } from '@solana-developers/helpers';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { createMint } from '@solana/spl-token';

const connection = new Connection(clusterApiUrl('devnet'));
const payer = getKeypairFromEnvironment('SECRET_KEY');
const owner = getKeypairFromEnvironment('SECRET_KEY_2');

console.log('Prepared connection and initiator!');

const tokenMint = await createMint(
    connection,
    payer,
    owner.publicKey,
    null,
    2,
);
const link = getExplorerLink('address', tokenMint.toString(), 'devnet');

console.log(`Created a token mint account: ${link}`);
