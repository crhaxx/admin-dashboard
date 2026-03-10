import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function formatCurrency(price: number, currency: string) {
  return price.toLocaleString(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
}

export const priceInCurrencyFunc = async (price: number) => {
  const priceRef = doc(db, "settings", "store");
  const priceSnap = await getDoc(priceRef);

  const currencyData = await priceSnap.data()!.currency;

  if (!priceSnap.exists() || currencyData == "CZK") {
    // price = formatCurrency(price, currencyData);
    return price.toLocaleString('cs-CZ') + " CZK";
  }


  if (currencyData == "USD") {
    price = price / 20.9;
    }
  if (currencyData == "EUR") {
    price = (price / 24.3);
  }

  return price.toLocaleString(undefined, {
    style: "currency",
    currency: currencyData,
    minimumFractionDigits: 2,
  });
};


"use client";

import { useEffect, useState } from "react";

export default function PriceInCurrency({ priceForCurrency, component }: { priceForCurrency: number, component: string }) {
  const [price, setPrice] = useState<string>("...");

  useEffect(() => {
    async function load() {
      const result = await priceInCurrencyFunc(priceForCurrency);
      setPrice(result);
    }
    load();
  }, [priceForCurrency]);

  if (component == "h2") {
    return (
    <h2 className="text-2xl font-bold mt-1">{price}</h2>
  );
  }

  if (component == "p") {
    return (
        <p className="font-medium text-black">{price}</p>
    );
  }
  
  if (component == "td p4") {
    return (
        <td className="p-4 text-black">{price}</td>
    );
  }

  if (component == "td p3") {
    return (
        <td className="p-3 text-black">{price}</td>
    );
  }

  if (component == "td-semi") {
    return (
        <td className="p-3 font-semibold text-black">{price}</td>
    );
  }

  if (component == "value") {
    return <>{price}</>;
  }
}
