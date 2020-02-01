import csvString from "csv-string";

export const convertCsv = (str: string, oldSeparator: string, oldQuote: string, newSeparator: string, newQuote: string) => {
  const v = csvString.parse(str, oldSeparator, oldQuote);
  return csvString.stringify(v, newSeparator, newQuote);
};
