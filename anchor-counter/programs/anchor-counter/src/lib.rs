use anchor_lang::prelude::*;

declare_id!("2SwiAqQWDBhNiJW7pa446x6ShkoDekRoaomeyDaZdCec");

#[program]
pub mod anchor_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;

        msg!("Counter Account Created!");
        msg!("Current count is : {}", counter.count);

        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;

        msg!("Previous counter is: {}", counter.count);

        counter.count += 1;

        msg!("New counter is: {}", counter.count);

        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;

        if counter.count == 0 {
            msg!("Counter already at 0.");

            return Ok(())
        }

        msg!("Previous counter is: {}", counter.count);

        counter.count -= 1;

        msg!("New counter is: {}", counter.count);

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
}

// Size of an account in bytes
const DISCRIMINATOR: usize = 8;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = DISCRIMINATOR + Counter::INIT_SPACE
    )]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}
