import { createTimer } from '../src';

describe('Format', () => {
    const t = createTimer()

    test('Non-strings', () => {
        expect(t()).toBe(0)
        expect(t(0)).toBe(0)
        expect(t(0.5)).toBe(0.5)
        expect(t(1)).toBe(1)
        expect(t(2.5)).toBe(2.5)
        expect(t(null)).toBe(0)
        expect(t(undefined)).toBe(0)
    })

    test('Single unit', () => {
        expect(t('1')).toBe(1)
        expect(t('1.5')).toBe(1.5)
        expect(t('1s')).toBe(1)
        expect(t('1m')).toBe(60)
        expect(t('1h')).toBe(3600)
        expect(t('1ms')).toBe(0.001)
    })

    test('Colon', () => {
        expect(t('1:2')).toBe(62)
        expect(t('01:2')).toBe(62)
        expect(t('1:02')).toBe(62)
        expect(t('1:2:3')).toBe(3723)
        expect(t('1:2:3.004')).toBe(3723.004)
        expect(t('01:02:03')).toBe(3723)
    })

    test('Multiple expressions', () => {
        expect(t('1m2s')).toBe(62)
        expect(t('1h 2m 3s')).toBe(3723)
        expect(t(' 1h 1s 2s 2m ')).toBe(3723)
        expect(t('1:01:00 1:00 3ms')).toBe(3720.003)
    })

    test('Invalid', () => {
        expect(() => t('1:1:1:1')).toThrow()
        expect(() => t('abcd')).toThrow()
        expect(() => t('5k')).toThrow()
        expect(() => t('5m5k')).toThrow()
    })

    test('Add/Subtract', () => {
        expect(t('1s+1s')).toBe(2)
        expect(t('1s-1s')).toBe(0)
        expect(t('1s +2s')).toBe(3)
        expect(t('1s - 2s')).toBe(-1)
        expect(t('1s+2m')).toBe(121)
        expect(t('1m - 5s  5s')).toBe(50)
        expect(t('1m - 5s +5s')).toBe(60)
    })

    test('Carry', () => {
        expect(t('1m')).toBe(60)
        expect(t('+1s')).toBe(61)
        expect(t('-1s')).toBe(60)
        expect(t()).toBe(60)
    })
})