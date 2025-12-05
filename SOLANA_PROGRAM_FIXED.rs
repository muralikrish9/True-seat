use anchor_lang::prelude::*;

declare_id!("J6KqCUoCbR48LMqgLGGy5JCwRUQ8UN4pdco1ypjb6tDc");

#[program]
pub mod event_tickets {
    use super::*;

    pub fn create_event(
        ctx: Context<CreateEvent>,
        event_id: String,  // New: unique identifier passed from client
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
        event.event_id = event_id;
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

        let total_cost = event.price
            .checked_mul(quantity)
            .ok_or(ErrorCode::MathOverflow)?;

        // Transfer SOL
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? -= total_cost;
        **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += total_cost;

        event.tickets_sold = event.tickets_sold
            .checked_add(quantity)
            .ok_or(ErrorCode::MathOverflow)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(event_id: String)]  // Access event_id parameter
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Event::LEN,
        seeds = [b"event", creator.key().as_ref(), event_id.as_bytes()],  // Use event_id instead of Clock
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
    pub creator: Pubkey,          // 32
    pub event_id: String,         // 4 + max 32 = 36
    pub name: String,             // 4 + max 50 = 54
    pub description: String,      // 4 + max 200 = 204
    pub price: u64,               // 8
    pub max_tickets: u64,         // 8
    pub tickets_sold: u64,        // 8
    pub event_date: i64,          // 8
    pub is_active: bool,          // 1
    pub location: String,         // 4 + max 100 = 104
    pub category: String,         // 4 + max 50 = 54
    pub image_cid: String,        // 4 + max 64 = 68
    pub metadata_cid: String,     // 4 + max 64 = 68
    pub created_at: i64,          // 8
}

impl Event {
    pub const LEN: usize = 32 + 36 + 54 + 204 + 8 + 8 + 8 + 8 + 1 + 104 + 54 + 68 + 68 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Event is not active")]
    EventNotActive,
    #[msg("Invalid ticket quantity")]
    InvalidQuantity,
    #[msg("Not enough tickets available")]
    NotEnoughTickets,
    #[msg("Math overflow")]
    MathOverflow,
}

