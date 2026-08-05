const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export function toBrazilTimezone(date: Date): Date {
  const brasilTime = new Date(
    date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE })
  );
  return brasilTime;
}

export function formatBrazilDate(date: Date): string {
  return date.toLocaleString("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getBrazilDate(): Date {
  return toBrazilTimezone(new Date());
}

export { BRAZIL_TIMEZONE };
