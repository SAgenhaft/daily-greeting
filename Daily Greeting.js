// Variables used by Scriptable.
// icon-color: yellow; icon-glyph: sun;

// PERSONALISATION GUIDE
// Search for "EDIT:" to find settings and wording you can personalise.
// For ordinary messages, change the text inside quotes and keep the quotes.
// Event templates use backticks (`) and ${...} placeholders: keep those intact
// and edit the surrounding words. The placeholders insert real event details.
// Keep messages short. Event templates are checked against maxCharacters;
// the fixed greetings below are displayed as written and may be clipped by iOS.
const settings = {
  // EDIT: Calendar names must match exactly. [] includes all calendars.
  calendarNames: [],
  // EDIT: true counts all-day events; false ignores them.
  includeAllDayEvents: true,
  // EDIT: Approximate text budget, excluding the date supplied by iOS.
  // Reduce this if your Lock Screen cuts off messages; try 30–38 characters.
  maxCharacters: 38,
  // EDIT: false gives "1pm" / "1:30pm"; true gives "13:00" / "13:30".
  use24HourTime: false,
  // EDIT: App to open after a widget tap runs this script.
  // "calshow://" opens Apple Calendar. Use another app's URL scheme to change it.
  calendarURL: "calshow://",
  messages: {
    // EDIT: No events today, from 05:00 until 10:59.
    morning: "Morning! Enjoy your free day",
    // EDIT: No events today, from 11:00 until 17:59.
    day: "Have a good day!",
    // EDIT: No events today, from 18:00 until 21:59.
    evening: "Enjoy your evening!",
    // EDIT: No events today, from 22:00 until 04:59.
    night: "Rest well. Sleep tight!",
    // EDIT: There were events today, but all of them have ended.
    finished: "All done! Time to unwind",
    // EDIT: Calendar lookup failed. Keep this an access/error message.
    unavailable: "Open Scriptable: check calendar access",
  },
};

function freeDayMessage(now) {
  const hour = now.getHours();
  // EDIT: Greeting changeover hours in local 24-hour time: 5, 11, 18, 22.
  // If you change them here, also update the refresh boundary list below.
  if (hour < 5 || hour >= 22) return settings.messages.night;
  if (hour < 11) return settings.messages.morning;
  if (hour < 18) return settings.messages.day;
  return settings.messages.evening;
}

function timeLabel(date) {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const mm = String(minutes).padStart(2, "0");
  if (settings.use24HourTime) return `${String(hour).padStart(2, "0")}:${mm}`;
  return `${hour % 12 || 12}${minutes ? `:${mm}` : ""}${hour < 12 ? "am" : "pm"}`;
}

function titleOf(event) {
  // EDIT: "Untitled event" is the fallback name for a blank event title.
  // Change BOTH occurrences together.
  return String(event.title || "Untitled event").replace(/\s+/g, " ").trim() || "Untitled event";
}

function shorten(text, limit) {
  const characters = Array.from(text);
  return characters.length <= limit ? text : characters.slice(0, Math.max(0, limit - 1)).join("") + "…";
}

function fits(text) {
  return Array.from(text).length <= settings.maxCharacters;
}

// Rotate wording by day, keeping it stable across refreshes on the same day.
function choose(now, candidates) {
  const fitting = candidates.filter(fits);
  if (!fitting.length) return null;
  return fitting[(now.getFullYear() + now.getMonth() * 31 + now.getDate()) % fitting.length];
}

function eventLabel(event, now) {
  const title = titleOf(event);
  // EDIT: Compact labels used when two events share the line.
  // Keep ${title} and ${timeLabel(event.startDate)} intact.
  if (event.isAllDay) return `${title} all day`;
  if (event.startDate <= now) return `${title} now`;
  return `${title} ${timeLabel(event.startDate)}`;
}

function greeting(now, events) {
  if (events.length === 0) return freeDayMessage(now);
  // Timed events take priority over all-day context. Ongoing events come first.
  const remaining = events.filter(event => event.endDate > now).sort((a, b) =>
    Number(a.isAllDay) - Number(b.isAllDay) || a.startDate - b.startDate ||
    titleOf(a).localeCompare(titleOf(b))
  );
  if (remaining.length === 0) return settings.messages.finished;
  const first = remaining[0];
  const title = titleOf(first);
  const count = remaining.length;
  const active = !first.isAllDay && first.startDate <= now;

  if (count === 1) {
    let candidates;
    if (first.isAllDay) {
      // EDIT: ONE ALL-DAY EVENT. ${title} inserts its name.
      // These are alternatives, not priority order. A fitting one is selected
      // each day. You can add/remove alternatives; retain one short option.
      candidates = [`Today you have ${title} all day`, `${title} all day today`, `All day: ${title}`];
    } else if (active) {
      // An event spanning midnight should not imply its end is today.
      const sameDay = first.endDate.toDateString() === now.toDateString();
      // EDIT: ONE EVENT HAPPENING NOW. ${timeLabel(first.endDate)} is its end
      // time. The last line is used when the event ends on a different day.
      candidates = sameDay
        ? [`${title} until ${timeLabel(first.endDate)}`, `Now: ${title}`]
        : [`Now: ${title}`];
    } else {
      const time = timeLabel(first.startDate);
      // EDIT: ONE UPCOMING EVENT. ${title} is its name; ${time} is its start.
      candidates = [`Today you have ${title} at ${time}`, `${title} at ${time}`, `Next: ${title} at ${time}`];
    }
    const message = choose(now, candidates);
    if (message) return message;
  } else if (count === 2) {
    const second = remaining[1];
    let candidates;
    if (first.isAllDay && second.isAllDay) {
      // EDIT: TWO ALL-DAY EVENTS. ${title} and ${titleOf(second)} are the names.
      candidates = [`${title} and ${titleOf(second)} all day`, `All day: ${title} & ${titleOf(second)}`];
    } else {
      // Both labels retain their time or all-day/ongoing status.
      // EDIT: TWO EVENTS, AT LEAST ONE TIMED. Change " & " to " and " if you
      // prefer. Each ${eventLabel(...)} inserts a compact label defined above.
      candidates = [`${eventLabel(first, now)} & ${eventLabel(second, now)}`];
    }
    const message = choose(now, candidates);
    if (message) return message;
  }

  // Preserve timing and the number of other events, trimming only the title.
  // EDIT: SHORT FALLBACK for 3+ events, or when longer templates do not fit.
  // Prefix words are "All day: " / "Now: "; upcoming events start with a time.
  // Suffix " +${count - 1} more" counts the OTHER events. Keep it very short
  // so there is still room for the event's name within maxCharacters.
  const prefix = first.isAllDay ? "All day: " : active ? "Now: " : `${timeLabel(first.startDate)}: `;
  const suffix = count > 1 ? ` +${count - 1} more` : "";
  const budget = settings.maxCharacters - Array.from(prefix + suffix).length;
  return prefix + shorten(title, budget) + suffix;
}

const now = new Date();
let message;
let events = [];
try {
  // Reads only; this script never creates or changes calendar events.
  const today = await CalendarEvent.today();
  events = today.filter(event =>
    (settings.includeAllDayEvents || !event.isAllDay) &&
    (settings.calendarNames.length === 0 ||
      settings.calendarNames.includes(event.calendar.title))
  );
  message = greeting(now, events);
} catch (error) {
  // Do not claim the day is free when calendar access fails.
  console.error(String(error));
  message = settings.messages.unavailable;
}

const widget = new ListWidget();
widget.addText(message);
// Route a tap back through this script, with a flag to open Calendar at the end.
// Using Scriptable's generated URL also works if you rename the script.
const runURL = URLScheme.forRunningScript();
widget.url = runURL + (runURL.includes("?") ? "&" : "?") + "action=openCalendar";

// Request a refresh in 15 minutes, or at an earlier message boundary.
// iOS decides when the refresh actually happens.
// EDIT: Optional refresh interval in minutes (15). This is only a request.
const refreshDates = [new Date(now.getTime() + 15 * 60 * 1000)];
// EDIT: Match the greeting changeover hours in freeDayMessage above.
// Keep 24 in this list so a refresh is requested at midnight too.
for (const hour of [5, 11, 18, 22, 24]) {
  const boundary = new Date(now);
  boundary.setHours(hour, 0, 0, 0);
  if (boundary > now) refreshDates.push(boundary);
}
for (const event of events) {
  if (event.startDate > now) refreshDates.push(event.startDate);
  if (event.endDate > now) refreshDates.push(event.endDate);
}
widget.refreshAfterDate = new Date(Math.min(...refreshDates.map(date => date.getTime())));
Script.setWidget(widget);
if (config.runsInApp) {
  if (args.queryParameters.action === "openCalendar") {
    // Only a deliberate tap opens Calendar; background refreshes never do.
    // This run recalculates the message, but iOS controls widget refresh timing.
    Safari.open(settings.calendarURL);
  } else {
    // Running directly in Scriptable is still useful for previewing edits.
    await widget.presentAccessoryInline();
  }
}
Script.complete();
