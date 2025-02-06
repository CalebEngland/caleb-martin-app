import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1>Better QR Codes Plus+++</h1>
        <p className={styles.summary}>The last QR Code app you'll ever need.</p>
        <h2>App Features</h2>
        <ul className={styles.list}>
          <li>Convert product URLs into working QR Codes</li>
          <li>Countdown timer - ( Theme App Extension )</li>
          <li>Several checkout UI extensions & more!</li>
        </ul>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <h3>Shop domain:</h3>
              <input className={styles.input} type="text" name="shop" />
              <button className={styles.button} type="submit">
                Log in
              </button>
              <p>e.g: my-shop-domain.myshopify.com</p>
            </label>
          </Form>
        )}
      </div>
    </div>
  );
}
