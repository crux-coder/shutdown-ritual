// Parts of the day, by local hour. The sky and the greeting both follow these.
export const DAYPARTS = [
  { id: "night", from: 0 },
  { id: "morning", from: 5 },
  { id: "afternoon", from: 12 },
  { id: "evening", from: 17 },
  { id: "night", from: 22 },
] as const;

export type Daypart = (typeof DAYPARTS)[number]["id"];

export function daypartAt(hour: number): Daypart {
  return DAYPARTS.findLast((d) => hour >= d.from)!.id;
}

export function currentDaypart(timeZone: string | null): Daypart {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone ?? "UTC",
    hour: "numeric",
    hourCycle: "h23",
  }).format(new Date());
  return daypartAt(Number(hour));
}

// Sets <html data-daypart> from the browser's clock. Runs inline before the
// first paint, so the sky never flashes from a default.
export const DAYPART_SCRIPT = `{var h=new Date().getHours(),d=${JSON.stringify(
  DAYPARTS,
)},p;for(var i=0;i<d.length;i++)if(h>=d[i].from)p=d[i].id;document.documentElement.dataset.daypart=p}`;
