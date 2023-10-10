export function fromSecondsToDate(seconds: number): Date {
    return new Date(seconds * 1000);
}

export function fromDateToSeconds(date: Date): number {
    return Math.floor(date.getTime() / 1000);
}
