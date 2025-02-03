import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";

import db from "../db.server";
import { getQRCodeImage } from "../models/QRCode.server";
import { useEffect } from "react";

import styles from "../styles/qrcode.module.css";

export const loader = async ({ params }) => {
  invariant(params.id, "Could not find QR code destination");

  const id = Number(params.id);
  const qrCode = await db.qRCode.findFirst({ where: { id } });

  invariant(qrCode, "Could not find QR code destination");

  return json({
    title: qrCode.title,
    image: await getQRCodeImage(id),
    descriptionHtml: qrCode.description,
  });
};

export default function QRCode() {
  const { image, title, descriptionHtml } = useLoaderData();

  useEffect(() => {
    const descriptionContainer = document.querySelector(
      "#product__description",
    );
    descriptionContainer.innerHTML = descriptionHtml;
  });

  return (
    <>
      <div className={styles.qrcode}>
        <img src={image} alt={`QR Code for product`} />
        <div className="qrcode__content">
          <h1 className={styles.description}>{title}</h1>
          <div className={styles.description} id="product__description"></div>
        </div>
      </div>
    </>
  );
}
