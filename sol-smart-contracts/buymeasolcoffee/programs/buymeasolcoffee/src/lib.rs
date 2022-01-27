use anchor_lang::prelude::*;

declare_id!("HMJb3LsZb6NQUb1HkBSHMp1YgC8JDBwgSw1YAaMBdanr");

#[program]
pub mod buymeasolcoffee {
    use super::*;
    pub fn start_coffee_jar(ctx: Context<StartCoffeeJar>) -> ProgramResult {

        // Grab the NEW coffee jar account
        // &mut means its mutable, ie we can change it
        let coffee_jar_account = &mut ctx.accounts.coffee_jar;

        // Set counts to 0
        coffee_jar_account.coffee_count  = 0;
        coffee_jar_account.lamport_count = 0;

        // Set the barista!
        coffee_jar_account.barista = ctx.accounts.barista.key();

        Ok(())
    }

    pub fn buy_coffee(ctx: Context<BuyCoffee>, lamports: u64) -> ProgramResult {

        if &ctx.accounts.coffee_jar.barista == &ctx.accounts.to.key() {
            let instrcution = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.from.key(),
                &ctx.accounts.coffee_jar.barista,
                lamports,
            );
    
            let response = anchor_lang::solana_program::program::invoke(
                &instrcution,
                &[
                    ctx.accounts.from.to_account_info(),
                    ctx.accounts.to.to_account_info(),
                ],
            );

            if response.is_ok() {

                let coffee_jar_account = &mut ctx.accounts.coffee_jar;
                coffee_jar_account.coffee_count  = coffee_jar_account.coffee_count + 1;
                coffee_jar_account.lamport_count = coffee_jar_account.lamport_count + lamports;

                return Ok(());
                
            } else {
                return Err(ErrorCode::SomethingBad.into());
            }
        }

        return Err(ErrorCode::WrongBarista.into());
    }
}

// Constructor - Start a Coffee Jar
#[derive(Accounts)]
pub struct StartCoffeeJar<'info> {
    #[account(init, payer = barista, space = 8 + 8 + 40)] // see CoffeeJar for space calculation
    pub coffee_jar: Account<'info, CoffeeJar>,            // the actual coffee jar (Program)
    #[account(mut)]
    pub barista: Signer<'info>,                           // who to send the sol to when coffee is bought (User), they also pay to start the jar
    pub system_program: Program <'info, System>,          // literally solana itself
}

// Function - Buy Coffee
#[derive(Accounts)]
pub struct BuyCoffee<'info> {
    #[account(mut)]
    pub coffee_jar: Account<'info, CoffeeJar>,   // the coffee jar account!
    #[account(mut)]
    pub from: Signer<'info>,                     // who is sending the sol
    #[account(mut)]
    pub to: AccountInfo<'info>,                  // send account info for transfer, will fail if pubkey does not batch barista
    pub system_program: Program <'info, System>, // literally solana itself
}

// Struct - Coffee Jar
#[account]
pub struct CoffeeJar {
    pub coffee_count: u64,  // total donations                   - 8  bytes
    pub lamport_count: u64, // Total lamports (0.000000001 sol)  - 8  bytes
    pub barista: Pubkey,    // who this is sent to               - 40 bytes
}

// ENUM - Error Codes
#[error]
pub enum ErrorCode {
    #[msg("Tried sending to the wrong barista!")]
    WrongBarista,
    #[msg("Naughty")]
    SomethingBad,
}
