import { createTimer } from '../src';

describe('Compose', () => {
    const t = createTimer()
    const t1 = createTimer()
    const t2 = createTimer()

    test('Copy time', () => {
        expect(t2(t1(t(80)))).toBe(80)
        expect(t1()).toBe(80)
        expect(t2()).toBe(80)
    })

    test('Add/Subtract', () => {
        expect(t('1s') + t('1s')).toBe(t("1s + 1s"))
        expect((t(1), t())).toBe(1)
        expect((t(5), t() + t(5))).toBe(10)
    })

    test('Distinct after copy', () => {
        expect((t1(80), t2(t1()))).toBe(80)
        expect(t1("+5")).toBe(85)
        expect(t2("+4")).toBe(84)
    })
})