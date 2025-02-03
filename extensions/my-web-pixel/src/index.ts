import { register } from "@shopify/web-pixels-extension";

register((api) => {
  api.analytics.subscribe("page_viewed", (event) => {
    console.log(`Event Name is: ${event.name}`);

    api.browser.cookie.set("my_user_id", "ABCX123");

    console.log(`Customer Name: ${api.init.data.customer?.firstName}`);
    // Customer Name: Bogus

    console.log(api.settings);
  });
});
