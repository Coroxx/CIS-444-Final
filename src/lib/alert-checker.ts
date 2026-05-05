import { prisma } from "./prisma";
import { getStockQuote } from "./api/yahoo-finance";
import { getCryptoPrice } from "./api/coingecko";

export async function checkAlerts(userId: string): Promise<number> {
  const alerts = await prisma.priceAlert.findMany({
    where: { userId, triggered: false },
  });
  if (alerts.length === 0) return 0;

  let triggeredCount = 0;
  const priceCache = new Map<string, number>();

  for (const alert of alerts) {
    try {
      const key = `${alert.type}:${alert.symbol}`;
      let price = priceCache.get(key);
      if (price === undefined) {
        const quote =
          alert.type === "crypto"
            ? await getCryptoPrice(alert.symbol)
            : await getStockQuote(alert.symbol);
        price = quote.price;
        priceCache.set(key, price);
      }

      const hit =
        (alert.direction === "above" && price >= alert.targetPrice) ||
        (alert.direction === "below" && price <= alert.targetPrice);

      if (hit) {
        await prisma.$transaction([
          prisma.priceAlert.update({
            where: { id: alert.id },
            data: { triggered: true },
          }),
          prisma.notification.create({
            data: {
              userId,
              type: "price_alert",
              symbol: alert.symbol,
              message: `${alert.symbol} is now ${alert.direction} $${alert.targetPrice.toFixed(
                2
              )} (current: $${price.toFixed(2)})`,
            },
          }),
        ]);
        triggeredCount += 1;
      }
    } catch {}
  }

  return triggeredCount;
}
