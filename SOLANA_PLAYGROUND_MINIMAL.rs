use anchor_lang::prelude::*;

declare_id!("wEeoKNhaFsCPYLsscNUy5PpXxNs81vF6CfEArCxLmmr");

#[program]
pub mod event_tickets {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        name: String,
        description: String,
        price: u64,
        max_tickets: u64,
        event_date: i64,
        location: String,
        category: String,
        image_cid: String,
        metadata_cid: String,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let clock = Clock::get()?;

        event.creator = ctx.accounts.creator.key();
        event.name = name;
        event.description = description;
        event.price = price;
        event.max_tickets = max_tickets;
        event.tickets_sold = 0;
        event.event_date = event_date;
        event.is_active = true;
        event.location = location;
        event.category = category;
        event.image_cid = image_cid;
        event.metadata_cid = metadata_cid;
        event.created_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, quantity: u64) -> Result<()> {
        let event = &mut ctx.accounts.event;

        require!(event.is_active, ErrorCode::EventNotActive);
        require!(quantity > 0, ErrorCode::InvalidQuantity);
        require!(
            event.tickets_sold + quantity <= event.max_tickets,
            ErrorCode::NotEnoughTickets
        );

        let total_cost = event
            .price
            .checked_mul(quantity)
            .ok_or(ErrorCode::MathOverflow)?;

        // Transfer SOL
        **ctx
            .accounts
            .buyer
            .to_account_info()
            .try_borrow_mut_lamports()? -= total_cost;
        **ctx
            .accounts
            .creator
            .to_account_info()
            .try_borrow_mut_lamports()? += total_cost;

        event.tickets_sold = event
            .tickets_sold
            .checked_add(quantity)
            .ok_or(ErrorCode::MathOverflow)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Event::LEN,
        seeds = [b"event", creator.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub creator: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Event {
    pub creator: Pubkey,
    pub name: String,
    pub description: String,
    pub price: u64,
    pub max_tickets: u64,
    pub tickets_sold: u64,
    pub event_date: i64,
    pub is_active: bool,
    pub location: String,
    pub category: String,
    pub image_cid: String,
    pub metadata_cid: String,
    pub created_at: i64,
}

impl Event {
    pub const LEN: usize =
        32 + 4 + 200 + 4 + 1000 + 8 + 8 + 8 + 8 + 1 + 4 + 100 + 4 + 50 + 4 + 200 + 4 + 200 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Event is not active")]
    EventNotActive,
    #[msg("Invalid quantity")]
    InvalidQuantity,
    #[msg("Not enough tickets available")]
    NotEnoughTickets,
    #[msg("Math overflow")]
    MathOverflow,
}
