import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorStudentIntroProgram } from "../target/types/anchor_student_intro_program";
import { expect } from "chai";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

describe("anchor-student-intro-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const student = {
    name: "Testing",
    introduction: "Hello there! I am a new student here! ",
  };
  const student2 = {
    name: "Tester man",
    introduction: "Another test for the tester man!",
  };
  const program = anchor.workspace
    .AnchorStudentIntroProgram as Program<AnchorStudentIntroProgram>;
  const [studentPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("student_introduction"),
      Buffer.from(student.name),
      provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  );
  const [student2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("student_introduction"),
      Buffer.from(student2.name),
      provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  );
  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("student_mint")],
    program.programId
  );

  it("initializes the token", async () => {
    await program.methods.initMint().rpc();
  });

  it("creates a student account with an introduction", async () => {
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey
    );

    // Add your test here.
    await program.methods.introduce(student.name, student.introduction).rpc();

    let userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal(30 * 10 ** 6);

    await program.methods.introduce(student2.name, student2.introduction).rpc();

    userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal(60 * 10 ** 6);

    const studentAccount = await program.account.studentAccountState.fetch(
      studentPda
    );

    expect(studentAccount.name).to.equal(student.name);
    expect(studentAccount.introduction).to.equal(student.introduction);

    const student2Account = await program.account.studentAccountState.fetch(
      student2Pda
    );

    expect(student2Account.name).to.equal(student2.name);
    expect(student2Account.introduction).to.equal(student2.introduction);
  });

  it("updates a student account with an introduction", async () => {
    // Add your test here.
    await program.methods.updateIntro(student2.name, "new intro bro").rpc();

    const studentAccount = await program.account.studentAccountState.fetch(
      studentPda
    );

    expect(studentAccount.name).to.equal(student.name);
    expect(studentAccount.introduction).to.equal(student.introduction);

    const student2Account = await program.account.studentAccountState.fetch(
      student2Pda
    );

    expect(student2Account.name).to.equal(student2.name);
    expect(student2Account.introduction).not.to.equal(student2.introduction);
    expect(student2Account.introduction).to.equal("new intro bro");
  });

  it("closes a student account", async () => {
    // Add your test here.
    await program.methods.close(student2.name).rpc();

    // First account should still be here
    await program.account.studentAccountState.fetch(studentPda);

    try {
      await program.account.studentAccountState.fetch(student2Pda);

      expect(false).to.be.true;
    } catch {
      expect(true).to.be.true;
    }
  });
});
