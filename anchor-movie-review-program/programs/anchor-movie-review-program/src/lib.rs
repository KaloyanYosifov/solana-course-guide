use anchor_lang::prelude::*;

declare_id!("2MyPbbXVMtjji7jdAzNzfitjHUeKEq8JXeDcyT4jKepL");

const MAX_TITLE_LENGTH: usize = 20;
const MAX_DESCRIPTION_LENGTH: usize = 50;

fn validate_movie_review(title: &str, description: &str, rating: u8) -> Result<()> {
    require!(rating >= 1 && rating <= 5, MovieReviewError::InvalidRating);
    require!(
        title.len() <= MAX_TITLE_LENGTH,
        MovieReviewError::TitleTooLong
    );
    require!(
        description.len() <= MAX_DESCRIPTION_LENGTH,
        MovieReviewError::DescriptionTooLong
    );

    Ok(())
}

#[program]
pub mod anchor_movie_review_program {
    use super::*;

    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        validate_movie_review(&title, &description, rating)?;

        msg!("Creating an account with a review for movie");
        msg!("Title: {title}");
        msg!("Title: {description}");
        msg!("Rating: {rating}");

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.description = description;
        movie_review.rating = rating;

        Ok(())
    }

    pub fn update_movie_review(
        ctx: Context<UpdateMovieReview>,
        title: String,
        description: String,
        rating: u8,
    ) -> Result<()> {
        validate_movie_review(&title, &description, rating)?;

        msg!("Updating an account with a review for movie");
        msg!("Title: {title}");
        msg!("Title: {description}");
        msg!("Rating: {rating}");

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.rating = rating;
        movie_review.description = description;

        Ok(())
    }

    pub fn delete_movie_review(_ctx: Context<DeleteMovieReview>, title: String) -> Result<()> {
        msg!("Deleing movie review: {}", title);

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct AddMovieReview<'a> {
    #[account(
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = DISCRIMINATOR + MovieAccountState::INIT_SPACE
    )]
    pub movie_review: Account<'a, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'a>,
    pub system_program: Program<'a, System>,
}

#[account]
#[derive(InitSpace)]
pub struct MovieAccountState {
    pub reviewer: Pubkey,
    pub rating: u8,
    #[max_len(MAX_TITLE_LENGTH)]
    pub title: String,
    #[max_len(MAX_DESCRIPTION_LENGTH)]
    pub description: String,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateMovieReview<'a> {
    #[account(
        mut,
        seeds = [title.as_bytes(), user.key().as_ref()],
        bump,
        realloc = DISCRIMINATOR + MovieAccountState::INIT_SPACE,
        realloc::payer = user,
        realloc::zero = true
    )]
    pub movie_review: Account<'a, MovieAccountState>,
    #[account(mut)]
    pub user: Signer<'a>,
    pub system_program: Program<'a, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteMovieReview<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), user.key().as_ref()],
        bump,
        close = user
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
enum MovieReviewError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
    #[msg("Movie Title is too long")]
    TitleTooLong,
    #[msg("Movie Description is too long")]
    DescriptionTooLong,
}

const DISCRIMINATOR: usize = 8;
