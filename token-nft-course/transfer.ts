import 'dotenv/config';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import { getKeypairFromEnvironment  } from '@solana-developers/helpers';

const publicKeyToSendTo = process.argv?.[2];

if (!publicKeyToSendTo) {
    console.log('Please provide a public key to send 1.5 SOL to.');
    process.exit(1);
}

const senderKeypair = getKeypairFromEnvironment('SECRET_KEY');

console.log(`Sender Public key: ${senderKeypair}`);

const toPubkey = new PublicKey(publicKeyToSendTo);
const connection = new Connection(clusterApiUrl('devnet'));

console.log('Initiating transfer...');

const LAMPORTS_TO_SEND = 1.5 * LAMPORTS_PER_SOL;
const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: senderKeypair.publicKey,
    toPubkey: toPubkey,
    lamports: LAMPORTS_TO_SEND,
});
const transaction = (new Transaction())
    .add(sendSolInstruction);
const signature = await sendAndConfirmTransaction(connection, transaction, [
    senderKeypair
]);

console.log(`Successfully sent ${LAMPORTS_TO_SEND} to address ${publicKeyToSendTo}`);
console.log(`Transaction signature is: ${signature}`)
