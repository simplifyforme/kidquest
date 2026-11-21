import type {CatalogEntry} from "./catalog";

/**
 * Opt-out visibility. A missing preference always means VISIBLE.
 * Every new local or remotely downloaded course therefore appears by default.
 */
export function isActivityVisible(activityId:string,hiddenIds:readonly string[]):boolean{
 return !hiddenIds.includes(activityId);
}
export function filterVisibleActivities(entries:readonly CatalogEntry[],hiddenIds:readonly string[]):CatalogEntry[]{
 return entries.filter(entry=>isActivityVisible(entry.id,hiddenIds));
}
