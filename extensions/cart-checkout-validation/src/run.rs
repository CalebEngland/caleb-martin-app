use shopify_function::prelude::*;
use shopify_function::Result;

// The configured entrypoint for the 'purchase.validation.run' extension target
#[shopify_function_target(query_path = "src/run.graphql", schema_path = "schema.graphql")]
fn run(input: input::ResponseData) -> Result<output::FunctionRunResult> {
    let mut errors = Vec::new();
    let error = output::FunctionError {
        localized_message:
            "There is an order maximum of $1,000 for customers without established order history"
                .to_owned(),
        target: "cart".to_owned(),
    };

    // Parse the decimal (serialized as a string) into a float.
    let order_subtotal: f64 = input.cart.cost.subtotal_amount.amount.into();

    // Orders with subtotals greater than $1,000 are available only to established customers.
    if order_subtotal > 1000.0 {
        if let Some(buyer_identity) = input.cart.buyer_identity {
            if let Some(customer) = buyer_identity.customer {
                // If the customer has ordered less than 5 times in the past,
                // then treat them as a new customer.
                if customer.number_of_orders < 5_i64 {
                    errors.push(error);
                }
            } else {
                errors.push(error);
            }
        // If there's no customer data, then treat them as a new customer.
        } else {
            errors.push(error);
        }
    }

    Ok(output::FunctionRunResult { errors })
}