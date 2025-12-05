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

    pub fn toggle_event_active(ctx: Context<ToggleEventActive>) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let creator = ctx.accounts.creator.key();

        require!(
            event.creator == creator || ctx.accounts.authority.key() == creator,
            ErrorCode::Unauthorized
        );

        event.is_active = !event.is_active;
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, quantity: u64) -> Result<()> {
        let event = &mut ctx.accounts.event;
        let buyer = &ctx.accounts.buyer;

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

        // Transfer SOL from buyer to event creator
        **ctx
            .accounts
            .buyer
            .to_account_info()
            .try_borrow_mut_lamports()? -= total_cost;
        **ctx
            .accounts
            .creator_ata
            .to_account_info()
            .try_borrow_mut_lamports()? += total_cost;

        // Update tickets sold
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
pub struct ToggleEventActive<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,

    pub creator: Signer<'info>,

    /// CHECK: Authority can be program or creator
    pub authority: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Creator's account to receive payment
    #[account(mut)]
    pub creator_ata: UncheckedAccount<'info>,

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
    pub const LEN: usize = 32 + // creator
        4 + 200 + // name (String)
        4 + 1000 + // description (String)
        8 + // price
        8 + // max_tickets
        8 + // tickets_sold
        8 + // event_date
        1 + // is_active
        4 + 100 + // location (String)
        4 + 50 + // category (String)
        4 + 200 + // image_cid (String)
        4 + 200 + // metadata_cid (String)
        8; // created_at
}

#[error_code]
pub enum ErrorCode {
    #[msg("Event is not active")]
    EventNotActive,
    #[msg("Invalid quantity")]
    InvalidQuantity,
    #[msg("Not enough tickets available")]
    NotEnoughTickets,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Math overflow")]
    MathOverflow,
}
