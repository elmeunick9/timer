function formatOut(dt: number, opt: TimerOptions): number {
    const is_smaller = opt.min !== undefined && dt < opt.min * opt.unitMap.s
    const is_bigger  = opt.max !== undefined && dt > opt.max * opt.unitMap.s
    if (is_smaller || is_bigger) {
        if (opt.minmaxBehavior === 'error') {
            if (is_smaller) throw new Error(`Time cannot be less than ${opt.min}s`)
            if (is_bigger)  throw new Error(`Time cannot be greater than ${opt.max}s`)
        }
        if (opt.minmaxBehavior === 'clamp') {
            return (is_smaller ? opt.min! : opt.max!) * opt.unitMap.s
        }
        if (typeof opt.minmaxBehavior === 'function') {
            return opt.minmaxBehavior(dt / opt.unitMap.s) * opt.unitMap.s
        }
    }
    return dt
}

function parseTimeWithUnits(str: string, unitMap: Record<TimerUnit, number>): number {
    const regex = /(\d+(\.\d+)?)(ms|h|m|s|d)/g
    const isDigit = /^\d+(\.\d+)?$/
    const fullRegex = /^((\d+(\.\d+)?)(ms|h|m|s|d))+$/
    const matches = Array.from(str.matchAll(regex))
    let dt = 0

    if (isDigit.test(str)) return parseFloat(str) * unitMap.s
    if (matches.length === 0 || !fullRegex.test(str)) {
        throw new Error('Invalid time format!')
    }

    for (const match of matches) {
        const value = parseFloat(match[1])
        const unit = match[3]
        switch (unit) {
            case 'h': dt += value * unitMap.h; break;
            case 'm': dt += value * unitMap.m; break;
            case 's': dt += value * unitMap.s; break;
            case 'ms': dt += value * unitMap.ms; break;
            case 'd': dt += value * unitMap.d; break;

            /* istanbul ignore next */
            default: throw new Error(`Invalid unit: ${unit}`);
        }
    }

    return dt
}

export type TimerUnit = 'd' | 'ms' | 's' | 'm' | 'h'

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

export const defaultOptions: TimerOptions = {
    unit: 's',
    unitMap: {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    },
    carry: true,
    minmaxBehavior: 'clamp'
} as const;

/**
 * Creates a timer function that can be used to convert time expressions into seconds.
 * 
 * The timer supports the following formats:
 *  - `"1h 1m 1s 1ms"`
 *  - `"01:01:01.100"`
 * 
 * It supports the following operators:
 *  - `+`: add time (if used as the first character add to last calculated time)
 *  - `-`: subtract time (if used as the first character subtract from last calculated time) 
 */
export function createTimer(options: Partial<TimerOptions> = {}) {
    const opt: TimerOptions = { ...defaultOptions, ...options }
    let dt = 0
    const t = (time?: number|string|null|TimerOptions|Function): number => { 
        if (!opt.carry) dt = 0

        if (time === null)                  return dt = formatOut(0, opt), dt / opt.unitMap[opt.unit]
        if (typeof time === 'number')       return dt = formatOut(time * opt.unitMap[opt.unit], opt), dt / opt.unitMap[opt.unit]
        if (typeof time === 'undefined')    return formatOut(dt, opt) / opt.unitMap[opt.unit]
        if (typeof time === 'function')     {
            const x = time({ __get_time_in_ms: true }) as number
            return dt = formatOut(x, opt), dt / opt.unitMap[opt.unit]
        }
        
        if (typeof time === 'object') {
            // @ts-ignore
             if (time.__get_time_in_ms != null) return dt
             throw new Error('Invalid time format!')
        }

        let m = 1 // Multiply dt (1 or -1)
        time.trim()
            .split(' ')
            .flatMap(x => x.split(/(\+)/))
            .flatMap(x => x.split(/(\-)/))
            .map(x => x.trim())
            .filter(x => x.length > 0)
            .forEach((chunk, i) => {
                const is_positive = chunk === "+"
                const is_negative = chunk === "-"
                if (is_positive || is_negative) return m = is_positive ? 1 : -1
                if (i === 0)                    dt = 0

                const parts = chunk.split(':').reverse()
                if (parts.length === 1)         dt += m * parseTimeWithUnits(chunk, opt.unitMap)
                else if (parts.length === 2)    dt += m * (parseInt(parts[1]) * opt.unitMap.m + parseFloat(parts[0]) * opt.unitMap.s)
                else if (parts.length === 3)    dt += m * (parseInt(parts[2]) * opt.unitMap.h + parseInt(parts[1]) * opt.unitMap.m + parseFloat(parts[0]) * opt.unitMap.s)
                else if (parts.length > 3)      throw new Error('Invalid time format')
            }
        )
    
        dt = formatOut(dt, opt)
        return dt / opt.unitMap[opt.unit]
    }

    return t
}