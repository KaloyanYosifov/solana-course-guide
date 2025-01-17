import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';

let publicKey = process.argv[2];
if (!publicKey) {
  throw new Error("Provide an address to check the balance of!");
}

let address: PublicKey;

try {
    address = new PublicKey(publicKey);
} catch(e) {
    throw new Error(`${publicKey} is invalid!`);
}

const url = clusterApiUrl('devnet');
const connection = new Connection(url);

console.log(`Connected to ${url}`);

// const address = new PublicKey('5oNnQ2QNzXexTLa3XiTtBcYpDqmTwBfW8QE6sWxP5kVM');
const balance = await connection.getBalance(address);
const balanceInSol = balance / LAMPORTS_PER_SOL;

console.log(`Balance of address ${publicKey}: ${balanceInSol}`);
