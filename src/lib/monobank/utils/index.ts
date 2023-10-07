export function makeSlicesFromTimeRange(from: number, to: number, range: number): { from: number; to: number }[] {
    const result: { from: number; to: number }[] = [];
    let currentFrom = from;
    while (currentFrom + range < to) {
        result.push({
            from: currentFrom,
            to: currentFrom + range,
        });
        currentFrom += range;
    }
    result.push({ from: currentFrom, to: to });
    return result;
}
