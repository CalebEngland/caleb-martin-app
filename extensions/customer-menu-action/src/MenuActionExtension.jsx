import {
  Button,
  reactExtension,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useState, useEffect } from "react";

export default reactExtension(
  "customer-account.order.action.menu-item.render",
  () => <MenuActionWrapper />,
);

function MenuActionWrapper() {
  const { orderId, authenticatedAccount } = useApi();
  const [hasFulfillments, setHasFulfillments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("MenuActionWrapper mounted", {
      orderId,
      isAuthenticated: !!authenticatedAccount,
    });

    async function checkFulfillments() {
      setIsLoading(true);
      try {
        const orderQuery = {
          query: `query {
            order(id: "${orderId}") {
              fulfillments(first: 1) {
                nodes {
                  latestShipmentStatus
                }
              }
              displayFulfillmentStatus
              canceledAt
            }
          }`,
        };
        const result = await fetch(
          "shopify://customer-account/api/2024-10/graphql.json",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderQuery),
          },
        );
        if (!result.ok) {
          throw new Error(`GraphQL query failed: ${result.status}`);
        }
        const { data } = await result.json();

        // Show action if order is fulfilled or partially fulfilled
        // and not canceled
        const canShowAction =
          !data.order.canceledAt &&
          (data.order.displayFulfillmentStatus === "FULFILLED" ||
            data.order.displayFulfillmentStatus === "PARTIALLY_FULFILLED");

        setHasFulfillments(canShowAction);
      } catch (error) {
        console.error(error);
        setHasFulfillments(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      checkFulfillments();
    }

    return () => {
      console.log("MenuActionWrapper unmounted");
    };
  }, []);

  // Don't render anything while loading
  if (isLoading) return null;

  return (
    <MenuActionExtension showAction={hasFulfillments} isLoading={isLoading} />
  );
}

function MenuActionExtension({ showAction, isLoading }) {
  const { authenticatedAccount, navigation } = useApi();

  if (!authenticatedAccount || !showAction || isLoading) {
    return null;
  }

  const handlePress = () => {
    // Navigate to the modal extension
    navigation.navigate("modal");
  };

  return (
    <Button
      onPress={handlePress}
      accessibilityLabel="Report a problem with this order"
      appearance="critical"
    >
      Report a problem
    </Button>
  );
}
