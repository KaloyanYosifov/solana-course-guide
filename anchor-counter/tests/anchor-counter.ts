import { expect } from "chai";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorCounter } from "../target/types/anchor_counter";

describe("anchor-counter", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider)

    const program = anchor.workspace.AnchorCounter as Program<AnchorCounter>;
    const counter = anchor.web3.Keypair.generate();

    it('is initialized', async () => {
        await program.methods
            .initialize()
            .accounts({ counter: counter.publicKey })
            .signers([counter])
            .rpc();

        const account = await program.account.counter.fetch(counter.publicKey);
        expect(account.count.toNumber()).to.equal(0);
    });

    it('increments counter', async () => {
         await program.methods
            .increment()
            .accounts({ counter: counter.publicKey, user: provider.wallet.publicKey })
            .rpc();

        const account = await program.account.counter.fetch(counter.publicKey);
        expect(account.count.toNumber()).to.equal(1);
    });

    it('decrements counter', async () => {
         await program.methods
            .increment()
            .accounts({ counter: counter.publicKey, user: provider.wallet.publicKey })
            .rpc();

        let account = await program.account.counter.fetch(counter.publicKey);
        // 2 due to previous increments test incrementing the counter
        // need to figure out how we could isolate tests in a single file
        expect(account.count.toNumber()).to.equal(2);

         await program.methods
            .decrement()
            .accounts({ counter: counter.publicKey, user: provider.wallet.publicKey })
            .rpc();

        account = await program.account.counter.fetch(counter.publicKey);
        expect(account.count.toNumber()).to.equal(1);
    });
});
