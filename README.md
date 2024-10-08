# Timer
[![NPM Version](https://img.shields.io/npm/v/@hubbit86/timer?color=blue)](https://www.npmjs.com/package/@hubbit86/timer)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://raw.githubusercontent.com/elmeunick9/timer/refs/heads/main/LICENSE)

Write and manipulate time expressions.

## Install

```
npm i @hubbit86/timer
```

## Usage

Create one or more timers:

```js
const t  = createTimer()
const t1 = createTimer()
const t2 = createTimer()
```

Whenever you have a function requiring time in seconds, you can specify the time using a common format, e.g:

```js
move({
    distance: 11,           // In meters
    duration: t("1m 2s")    // In seconds
})
```

You can also use the digital clock format `01:01:01.001`.

Every timer stores the last used time, you can use it to keep count with the add/subtract operators:

```js
play({ start: t("01:00"), end: t("+33s") })     // 01:00 -> 01:33
play({ start: t("-1:30"), end: t("+03s") })     // 00:03 -> 00:06
play({ start: t("02:00"), end: t("+00:03") })   // 02:00 -> 02:03
```

You can access the current stored time without modification by not passing a parameter, use "null" to reset the timer or any value not starting with an operator to set it.

```js
play({ start: t1("01:00"), end: t2("01:33") })  // 01:00 -> 01:33
play({ start: t1() - t("10s"), end: t2() })     // 00:50 -> 01:33
```

These timers also accept a number directly, such that `t(x) = x`. This can be used to copy a timer:

```js
play({ start: t2(t1("01:00")), end: t1("+33s") })   // 01:00 -> 01:33
play({ start: t2("-10s"), end: t1() })              // 00:50 -> 01:33
```

You can combine multiple expressions in a single timer:

```js
t("1m3s -00:03 +5h") === t(t("1m 3s") - t("00:03") + t("5h"))
```

## Options
You can configure some options on your `createTimer(...)` function to change the default behavior.

```ts
export interface TimerOptions {
    /** Specify the unit to use for returning the time. Default: `"s"` */
    unit: TimerUnit

    /** Specify a map of units to their values (from milliseconds). */
    unitMap: Record<TimerUnit, number>

    /** If enabled when using a (+/-) operator on front of the time it will add or subtract from the last calculated time. Default: `true` */
    carry: boolean

    /** If specified, marks the minimum allowed time in seconds. Default: `undefined` */
    min?: number

    /** If specified, marks the maximum allowed time in seconds. Default: `undefined` */
    max?: number

    /** What to do if the time is out of bounds. Default: `clamp` */
    minmaxBehavior: 'error' | 'clamp' | ((seconds: number) => number)
}
```

## Implementation details

* If you pass a malformed time, it will throw an exception, e.g: `t("6k")`.
* If you only specify two places on the digital clock format, they will be `mm:ss`, not `hh:mm`.
* When using the digital clock format, you can go beyond 60 or add extra leading zeros without errors, e.g: `000:120`.
* You can get negative times, e.g: `t("0 - 12:58")`
* You can copy timers configured with different units by passing the function directly, e.g `t2(t1)`.

## License

*MIT License - Copyright (c) 2024 Robert Planas Jimenez*
