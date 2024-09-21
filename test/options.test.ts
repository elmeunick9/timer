import { createTimer } from '../src';

describe('Options', () => {
    const t = createTimer({ carry: false })
    const t1 = createTimer({ unit: 'ms' })
    const t2 = createTimer({ unit: 'ms', min: 1, max: 5 })
    const t3 = createTimer({ unit: 'm' })
    const t4 = createTimer({ unit: 's', min: 0, max: 10, minmaxBehavior: 'error' })

    test('Carry is false', () => {
        expect((t("1"), t("+1"))).toBe(1)
    })

    test('Unit conversion', () => {
        expect(t1("2s")).toBe(2000)
        expect(t3("5m")).toBe(5)
        expect(t1( (t3("2s"), t3 ) )).toBe(2000)
    })

    test('MinMax', () => {
        expect(t2("6s")).toBe(5000)
        expect(t2("-17s")).toBe(1000)
        expect(() => t4("-1ms")).toThrow()
        expect(() => t4("12s")).toThrow()

        let x = false
        const tx1 = createTimer({ unit: 's', min: 0, minmaxBehavior: (v) => (x = true, 0) })
        expect(tx1("-1s")).toBe(0)
        expect(x).toBe(true)
    })
})