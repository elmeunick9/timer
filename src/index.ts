const parseTimeWithUnits = (str: string): number => {
    const regex = /(\d+(\.\d+)?)(ms|h|m|s)/g
    const isDigit = /^\d+(\.\d+)?$/
    const fullRegex = /^((\d+(\.\d+)?)(ms|h|m|s))+$/
    const matches = Array.from(str.matchAll(regex))
    let dt = 0

    if (isDigit.test(str)) return parseFloat(str)
    if (matches.length === 0 || !fullRegex.test(str)) {
        throw new Error('Invalid time format!')
    }

    for (const match of matches) {
        const value = parseFloat(match[1])
        const unit = match[3]
        switch (unit) {
            case 'h': dt += value * 3600; break;
            case 'm': dt += value * 60; break;
            case 's': dt += value; break;
            case 'ms': dt += value / 1000; break;

            /* istanbul ignore next */
            default: throw new Error(`Invalid unit: ${unit}`);
        }
    }

    return dt
}

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
export function createTimer() {
    let dt = 0
    const t = (time?: number|string|null): number => {  
        if (time === null)                  return dt = 0, dt
        if (typeof time === 'number')       return dt = time, dt
        if (typeof time === 'undefined')    return dt
        
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
                if (parts.length === 1)         dt += m * parseTimeWithUnits(chunk)
                else if (parts.length === 2)    dt += m * parseInt(parts[1]) * 60 + parseFloat(parts[0])
                else if (parts.length === 3)    dt += m * parseInt(parts[2]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[0])
                else if (parts.length > 3)      throw new Error('Invalid time format')
            }
        )
    
        return dt
    }

    return t
}