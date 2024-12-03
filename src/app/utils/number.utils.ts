export const formatNumber = (num: number, digits: number): string => {
    return num.toLocaleString('en-US', {
      minimumIntegerDigits: digits,
      useGrouping: false
    });
  }