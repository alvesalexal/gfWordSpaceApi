const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export function toBrazilTimezone(date: Date): Date {
  const brasilTime = new Date(
    date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE })
  );
  return brasilTime;
}

export function getBrazilDate(): Date {
  return toBrazilTimezone(new Date());
}
