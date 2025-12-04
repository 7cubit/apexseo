import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export const dateUtils = {
    formatDate: (date: Date | string | number, pattern: string = 'yyyy-MM-dd'): string => {
        return format(new Date(date), pattern);
    },

    subDays: (date: Date, amount: number): Date => {
        return subDays(date, amount);
    },

    startOfDay: (date: Date): Date => {
        return startOfDay(date);
    },

    endOfDay: (date: Date): Date => {
        return endOfDay(date);
    },

    toISO: (date: Date): string => {
        return date.toISOString();
    }
};
