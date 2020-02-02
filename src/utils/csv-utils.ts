import csvString from "csv-string";

// TODO: Replace another library

export const convertCsv = (str: string, oldSeparator: string, oldQuote: string, newSeparator: string, newQuote: string) => {
  const v = csvString.parse(str, oldSeparator, oldQuote);
  return csvString.stringify(v, newSeparator, newQuote);
};

export const parseCsvString = (str: string, separator: string, quote: string) => {
  return csvString.parse(str, separator, quote);
}