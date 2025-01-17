import 'dotenv/config';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getKeypairFromEnvironment  } from '@solana-developers/helpers';

const PING_PROGRAM_ADDRESS = "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa";
const PING_PROGRAM_DATA_ADDRESS = "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod";

const initiator = getKeypairFromEnvironment('SECRET_KEY');

console.log(`Sender Public key: ${initiator}`);

const connection = new Connection(clusterApiUrl('devnet'));
const programId = new PublicKey(PING_PROGRAM_ADDRESS);
const pingProgramDataId = new PublicKey(PING_PROGRAM_DATA_ADDRESS);
const instruction = new TransactionInstruction({
    programId,
    keys: [
        {
            pubkey: pingProgramDataId,
            isSigner: false,
            isWritable: true,
        }
    ],
});
const transaction = new Transaction().add(instruction);
const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [initiator]
);

console.log(`Successful: ${signature}`);
