import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorMovieReviewProgram } from "../target/types/anchor_movie_review_program";

describe("anchor-movie-review-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .AnchorMovieReviewProgram as Program<AnchorMovieReviewProgram>;

  const movie = {
    title: "Just a test movie",
    description: "Testing if this movie is real or not!",
    rating: 5,
  };

  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  it("Initializes the reward token", async () => {
    await program.methods.initializeTokenMint().rpc();
  });

  it("Movie review is added`", async () => {
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey
    );

    await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        tokenAccount,
      })
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);

    expect(account.title).to.equal(movie.title);
    expect(account.description).to.equal(movie.description);
    expect(account.rating).to.equal(movie.rating);
    expect(account.reviewer === provider.wallet.publicKey);

    const userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal((10 * 10) ^ 6);
  });

  it("Movie review is updated`", async () => {
    const newDescription = "testing this";
    const newRating = 3;

    await program.methods
      .updateMovieReview(movie.title, newDescription, newRating)
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);

    expect(account.title).to.equal(movie.title);
    expect(account.description).to.equal(newDescription);
    expect(account.rating).to.equal(newRating);
    expect(account.reviewer === provider.wallet.publicKey);
  });

  it("Deletes a movie review", async () => {
    await program.methods.deleteMovieReview(movie.title).rpc();

    try {
      await program.account.movieAccountState.fetch(moviePda);

      expect(false).to.be.true;
    } catch {
      expect(true).to.be.true;
    }
  });
});
