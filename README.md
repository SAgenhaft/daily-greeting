# Daily Greeting

**A friendlier glance at your day, by RunX Studios.**

Daily Greeting is a small Scriptable widget for the line above your iPhone's Lock Screen clock. It checks your calendar and displays a short greeting or a summary of your plans. The system's day and date stay alongside it.

| Your day | Example message |
| --- | --- |
| A free morning | Morning! Enjoy your free day |
| No plans after 11am | Have a good day! |
| One all-day event | Holiday all day today |
| An upcoming appointment | Lunch at 1pm |
| An event underway | Workshop until 12pm |
| Two appointments | Lunch 1pm & Yoga 6pm |
| A busy schedule | 11am: Call +2 more |
| Everything finished | All done! Time to unwind |

Some phrases vary by day. Long event names shorten to leave room for the time and other-event count.

## Download

[Download Daily Greeting.js](https://github.com/SAgenhaft/daily-greeting/releases/latest/download/Daily.Greeting.js)

[View the script](./Daily%20Greeting.js) to copy its contents, or see [releases](https://github.com/SAgenhaft/daily-greeting/releases) for version details.

## Get started

You need an iPhone running iOS 16 or later, [Scriptable](https://scriptable.app/), and calendars available to that app on your phone.

1. Open `Daily Greeting.js` and copy its full contents.
2. In Scriptable, create a new script named **Daily Greeting**, then paste the code.
3. Run it once and allow calendar access. If iOS offers access levels, grant full access so Scriptable can read events. The script itself only reads events.
4. Touch and hold your Lock Screen, choose **Customise**, then **Lock Screen**.
5. Tap the row above the clock and choose Scriptable's inline widget.
6. Tap the added widget, select **Daily Greeting** as its script, and save your Lock Screen.

## Make it yours

Search the script for `EDIT:` to find commented personalisation points.

The shared version includes every calendar by default. To choose particular calendars, replace just the `calendarNames` line with your exact calendar names, for example:

```js
calendarNames: ["Personal", "Work"],
```

Set `includeAllDayEvents` to `false` to ignore all-day events. Change `use24HourTime` to `true` for times such as “13:30”. Edit the greetings near the top, and the event-message templates further down. Keep template backticks and `${...}` placeholders intact.

The default greeting boundaries are 5am, 11am, 6pm, and 10pm, using your phone's local time. Comments explain how to change them and the corresponding refresh boundaries.

## Tapping the widget

The tap action is set up to open Scriptable, run the script, then open Apple Calendar. You may need to unlock your phone. Running the script directly inside Scriptable shows a preview instead. Automatic background runs do not open Calendar.

After installing an update, run it once and allow the Lock Screen widget to refresh. If it retains its old tap action, remove and re-add the widget and select the script again.

## Calendar data and privacy

The script reads events through Scriptable's calendar access and processes them on your device. It contains no network requests, analytics, account system, or file storage. It does not create, change, or delete events.

Event names can appear on your Lock Screen. The script's calendar selection controls its messages; it does not change which calendars are visible inside Apple Calendar. Calendar-account syncing and Scriptable's own behaviour are separate from this script.

## Current limits

- iOS controls refresh timing. Changes at 11am or at event boundaries may appear later, and tapping cannot force an immediate redraw.
- The character budget is approximate. If text clips, reduce `maxCharacters` or shorten your wording. Fixed greetings display as written.
- Calendar names must match exactly. A typo can exclude events and make a day look free.
- Birthdays and holidays count when they are all-day events in included calendars.
- A failed calendar lookup shows an access message. If Scriptable returns an empty result instead, verify access and selected names if the day looks incorrectly free.
- Logic has been checked with mocked Scriptable APIs. The latest tap-to-Calendar change still needs an iPhone check; device layout and refresh behaviour vary.

Built with [Scriptable's inline widgets](https://docs.scriptable.app/listwidget/), [calendar API](https://docs.scriptable.app/calendarevent/), and [script URL support](https://docs.scriptable.app/urlscheme/).
