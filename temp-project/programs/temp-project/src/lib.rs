use anchor_lang::prelude::*;

declare_id!("31atqobwFHuj5f3ygzwsec5wcSFTKC3wyJda132yM37Y");

#[program]
pub mod temp_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
