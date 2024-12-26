use anchor_lang::prelude::*;

declare_id!("Ckq8b1Z1QwHNmJ9FmVLGwBxFAFALiaqvY3NrhHTFuePt");

const DISCRIMINATOR: usize = 8;
const MAX_NAME_LENGTH: usize = 30;
const MAX_INTRODUCTION_LENGTH: usize = 80;

fn validate(name: impl AsRef<str>, introduction: impl AsRef<str>) -> Result<()> {
    require!(
        name.as_ref().len() >= 3 && name.as_ref().len() <= MAX_NAME_LENGTH,
        ProgramError::NameInvalidLength
    );

    require!(
        introduction.as_ref().len() >= 10 && introduction.as_ref().len() <= MAX_INTRODUCTION_LENGTH,
        ProgramError::NameInvalidLength
    );

    Ok(())
}

#[program]
pub mod anchor_student_intro_program {
    use super::*;

    pub fn introduce(ctx: Context<Introduce>, name: String, introduction: String) -> Result<()> {
        msg!("Validating!...");

        validate(&name, &introduction)?;

        msg!("Creating student account");

        let student = &mut ctx.accounts.student;
        student.name = name;
        student.introduction = introduction;

        msg!("Student Account created!");

        Ok(())
    }

    pub fn update_intro(
        ctx: Context<UpdateIntro>,
        name: String,
        introduction: String,
    ) -> Result<()> {
        msg!("Validating!...");

        validate(&name, &introduction)?;

        msg!("Updating student account");

        let student = &mut ctx.accounts.student;
        student.introduction = introduction;

        msg!("Student account updated");

        Ok(())
    }

    pub fn close(_ctx: Context<Close>, _name: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Introduce<'a> {
    #[account(
        init,
        seeds = [b"student_introduction", name.as_bytes(), initiator.key().as_ref()],
        bump,
        space = DISCRIMINATOR + StudentAccountState::INIT_SPACE,
        payer = initiator,
    )]
    pub student: Account<'a, StudentAccountState>,
    #[account(mut)]
    pub initiator: Signer<'a>,
    pub system_program: Program<'a, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateIntro<'a> {
    #[account(
        mut,
        seeds = [b"student_introduction", name.as_bytes(), initiator.key().as_ref()],
        bump,
        // we do not need to reallocate as we have already initialized the space in introduce and
        // our strings are not dynamic
    )]
    pub student: Account<'a, StudentAccountState>,
    #[account(mut)]
    pub initiator: Signer<'a>,
    pub system_program: Program<'a, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Close<'a> {
    #[account(
        mut,
        seeds = [b"student_introduction", name.as_bytes(), initiator.key().as_ref()],
        bump,
        close = initiator,
    )]
    pub student: Account<'a, StudentAccountState>,
    #[account(mut)]
    pub initiator: Signer<'a>,
    pub system_program: Program<'a, System>,
}

#[account]
#[derive(InitSpace)]
pub struct StudentAccountState {
    #[max_len(MAX_NAME_LENGTH)]
    pub name: String,

    #[max_len(MAX_INTRODUCTION_LENGTH)]
    pub introduction: String,
}
#[error_code]
pub enum ProgramError {
    #[msg("Name must be between 3 and 30 characters long")]
    NameInvalidLength,

    #[msg("Introduction must be between 10 and 80 characters long")]
    IntroductionInvalidLength,
}
