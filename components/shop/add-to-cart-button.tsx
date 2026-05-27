"use client";

import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

interface AddToCartButtonProps {
  productId: string;
  stripePriceId?: string;
  title: string;
  price: number;
}

export function AddToCartButton({
  productId,
  stripePriceId,
  title,
  price,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!stripePriceId) {
      alert("Оплата временно недоступна. Свяжитесь с нами.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: stripePriceId,
          productId,
          productName: title,
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (stripeKey) {
          window.location.href = data.url;
        }
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch {
      alert("Ошибка при оформлении заказа. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="inline-flex h-12 items-center justify-center gap-2 bg-foreground text-primary-foreground px-8 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
      aria-label={`Купить ${title} за ${price.toLocaleString("ru-RU")} ₽`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <ShoppingBag size={14} />
      )}
      {loading ? "Оформление…" : "Купить сейчас"}
    </button>
  );
}
