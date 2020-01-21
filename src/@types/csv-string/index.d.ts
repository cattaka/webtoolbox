declare module "csv-string" {
  function parse(input: string, separator?: string, quote?: string): string[][];
  function stringify(input: string[][], separator?: string, quote?: string): string;
}
