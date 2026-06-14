"use client";

import type { ShopItem } from "./types";

type Props = {
  points: number;
  items: ShopItem[];
  purchases: string[];
  onBuyItem: (item: ShopItem) => void;
};

export default function ShopPanel({
  points,
  items,
  purchases,
  onBuyItem,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Shop
        </h2>
        <span className="text-xs text-slate-400">{points} pts available</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const owned = purchases.includes(item.id);
          const canBuy = points >= item.cost && !owned;

          return (
            <article
              key={item.id}
              className="rounded-lg border border-slate-700 bg-slate-950/70 p-3"
            >
              <div className="flex min-h-20 flex-col">
                <h3 className="text-sm font-semibold text-slate-100">
                  {item.name}
                </h3>
                <p className="mt-1 flex-1 text-xs leading-5 text-slate-400">
                  {item.description}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-amber-200">
                  {item.cost} pts
                </span>
                <button
                  type="button"
                  onClick={() => onBuyItem(item)}
                  disabled={!canBuy}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    owned
                      ? "bg-emerald-500/20 text-emerald-100"
                      : canBuy
                      ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {owned ? "Owned" : "Buy"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
