import React, { useState } from 'react';
import styled from 'styled-components';
import {convertCsv, parseCsvString} from "../utils/csv-utils";

const exampleKeys1 = "key1,key2";
const exampleValue1 = "key1,key2,value1,value2\nhoge1,hoge2,hoge3,hoge4\nfuga1,fuga2,fuga3,fuga4\nfoo1,foo2,foo3,foo4\nbar1,bar2,bar3,bar4";
const exampleValue2 = "key1,key2,value1,value2\nhoge1,hoge2,hoge3,hoge4\nfuga1,fuga2d,fuga3,fuga4\nfoo1,foo2,foo3d,foo4\nbar1,bar2,bar3,bar4";

type State = {
  keyColumns: string;
  value1: string;
  value2: string;
  markedTable?: MarkedTable;
  showOnlyDiff: boolean;
  separator: string;
  quote: string;
};

interface MarkedCell {
  text: string;
  oldText?: string;
  color?: string;
  isKey?: boolean;
}

interface MarkedRow {
  cells: MarkedCell[];
  color?: string;
  hasDiff: boolean;
}

interface MarkedTable {
  header: MarkedRow;
  rows: MarkedRow[];
}

export default () => {
  const [ state, dispatchState ] = useState({
    keyColumns: exampleKeys1,
    value1: exampleValue1,
    value2: exampleValue2,
    markedTable: undefined,
    showOnlyDiff: false,
    separator: ",",
    quote: '"'
  } as State);

  const onChangeSeparator = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatchState({
      ...state,
      separator: e.target.value,
      keyColumns: convertCsv(state.keyColumns, state.separator, state.quote, e.target.value, state.quote),
      value1: convertCsv(state.value1, state.separator, state.quote, e.target.value, state.quote),
      value2: convertCsv(state.value2, state.separator, state.quote, e.target.value, state.quote)
    });
  };
  const onChangeQuote = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatchState({
      ...state,
      quote: e.target.value,
      keyColumns: convertCsv(state.keyColumns, state.separator, state.quote, state.separator, e.target.value),
      value1: convertCsv(state.value1, state.separator, state.quote, state.separator, e.target.value),
      value2: convertCsv(state.value2, state.separator, state.quote, state.separator, e.target.value)
    });
  };
  const onChangeKeysText1 = (e: React.ChangeEvent<HTMLInputElement>) => { dispatchState({ ...state, keyColumns: e.target.value }); };
  const onChangeValue1Text = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value1: e.target.value }); };
  const onChangeValue2Text = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value2: e.target.value }); };

  const onClickCalculateDiff = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const diffTable = calculateDiff(
      state.separator,
      state.quote,
      state.keyColumns,
      state.value1,
      state.value2
    );
    dispatchState({ ...state, markedTable: diffTable });
  };

  const onChangeShowOnlyDiff = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchState({
      ...state,
      showOnlyDiff: e.target.checked
    });
  };

  return <div>
    <label htmlFor="separator">Separator of input:</label>
    <select name={"separator"} defaultValue={state.separator} onChange={onChangeSeparator}>
      <option value={","}>,</option>
      <option value={"\t"}>TAB</option>
    </select>
    <div style={{display: "none"}}> {/* Not supported yet */}
      <label htmlFor="quote">Quote:</label>
      <select defaultValue={state.quote} onChange={onChangeQuote}>
        <option value={'"'}>"</option>
        <option value={"'"}>'</option>
      </select>
    </div>
    <div>
      <label htmlFor="keyColumns">Key columns:</label>
      <input name={"keyColumns"} type="text" value={state.keyColumns} onChange={onChangeKeysText1} />
    </div>
    <div>
      <ValuesTextArea onChange={onChangeValue1Text} value={state.value1} />
      <ValuesTextArea onChange={onChangeValue2Text} value={state.value2} />
    </div>
    <ExecButton onClick={onClickCalculateDiff}>Calc diff</ExecButton>
    <div>
      <input type="checkbox" onChange={onChangeShowOnlyDiff} />
      Show only diffs
    </div>
    <div>
      { state.markedTable ? genMarkedTable(state.markedTable, state.showOnlyDiff) : undefined }
    </div>
  </div>;
}

const calculateDiff = (
  separator: string,
  quote: string,
  keyColumnsStr: string,
  input1Str: string,
  input2Str: string
): MarkedTable => {
  const keyColumns = parseCsvString(keyColumnsStr, separator, quote)[0];
  const input1 = parseCsvString(input1Str, separator, quote);
  const input2 = parseCsvString(input2Str, separator, quote);

  const columns1 = input1[0];
  const columns2 = input2[0];
  const columns: string[] = [];
  columns1.forEach((i) => { if (!columns.includes(i)) { columns.push(i); } })
  columns2.forEach((i) => { if (!columns.includes(i)) { columns.push(i); } })

  const values1 = input1.slice(1).map(orig => {
    const r: Map<string, string> = new Map();
    columns1.forEach((c, index) => { r.set(c, orig[index]) });
    return r;
  });
  const values2 = input2.slice(1).map(orig => {
    const r: Map<string, string> = new Map();
    columns2.forEach((c, index) => { r.set(c, orig[index]) });
    return r;
  });

  return makeDiffTable(
    columns,
    keyColumns,
    values1,
    values2,
    'lightpink',
    'yellow',
    'lightgreen'
  );
};

const makeDiffTable = (
  columns: string[],
  keyColumns: string[],
  prevValuesList: Map<string, string>[],
  currValuesList: Map<string, string>[],
  colorDeleted: string,
  colorDidChanged: string,
  colorAdded: string
): MarkedTable => {
  const header: MarkedRow = {
    cells: columns.map(column => ({
      text: column,
      isKey: keyColumns.includes(column)
    })),
    hasDiff: false
  };
  const deletedValues: Map<string, string>[] = [];
  const currKeys2Values: Map<string, Map<string, string>> = new Map();
  currValuesList.forEach(vs => {
    const keys = JSON.stringify(keyColumns.map(k => vs.get(k)));
    currKeys2Values.set(keys, vs);
  });
  const prevKeys2Values: Map<string, Map<string, string>> = new Map();
  prevValuesList.forEach(vs => {
    const keys = JSON.stringify(keyColumns.map(k => vs.get(k)));
    prevKeys2Values.set(keys, vs);
    if (!currKeys2Values.get(keys)) {
      deletedValues.push(vs);
    }
  });

  const deletedRows: MarkedRow[] = deletedValues.map(vs => {
    return {
      cells: columns.map(c => ({ text: vs.get(c), color: colorDeleted } as MarkedCell)),
      color: undefined,
      hasDiff: true
    } as MarkedRow;
  });

  const rows: MarkedRow[] = currValuesList.map(currValues => {
    const keys = JSON.stringify(keyColumns.map(k => currValues.get(k)));
    const prevValues = prevKeys2Values.get(keys);
    return makeDiffRow(columns, prevValues, currValues, colorAdded, colorDidChanged);
  });

  rows.push(...deletedRows);
  return {
    header,
    rows
  };
};

const makeDiffRow = (
  columns: string[],
  prevValues: Map<string, string> | undefined,
  currValues: Map<string, string>,
  colorAdded: string,
  colorDidChanged: string
): MarkedRow => {
  let hasDiff = false;
  const cells: MarkedCell[] = columns.map(k => {
    const v2 = currValues.get(k);

    let color: string | undefined;
    let oldText: string | undefined;
    if (prevValues) {
      const v1 = prevValues && prevValues.get(k);
      if (v2 !== v1) {
        color = colorDidChanged;
        oldText = v1;
        hasDiff = hasDiff || true;
      }
    } else {
      hasDiff = hasDiff || true;
      color = colorAdded;
    }
    return {
      text: v2,
      oldText: oldText,
      color
    } as MarkedCell;
  });
  return {
    cells,
    hasDiff
  };
};

const genMarkedTable = (markedTable: MarkedTable, showOnlyDiff: boolean) => {
  return (
    <div>
      <table>
        <thead>
          <StyledTr>
            {markedTable.header.cells.map((cell, cindex) => (
              <StyledTh key={cindex} style={{ backgroundColor: cell.color, color: cell.isKey ? 'red' : undefined }}>
                {cell.text}
              </StyledTh>
            ))}
          </StyledTr>
        </thead>
        <tbody>
          {markedTable.rows.map(
            (row, rindex) =>
              (!showOnlyDiff || row.hasDiff) && (
                <StyledTr key={rindex}>
                  {row.cells.map((cell, cindex) => (
                    <StyledTd key={cindex} style={{ backgroundColor: cell.color }} title={cell.oldText}>{cell.text}</StyledTd>
                  ))}
                </StyledTr>
              )
          )}
        </tbody>
      </table>
    </div>
  );
};

const ValuesTextArea = styled.textarea`
  width: 45%;
  height: 30em;
`;

const ExecButton = styled.button`
  width: 90%;
`;

const StyledTr = styled.tr``;

const StyledTh = styled.th`
  border-style: solid;
  border-width: 1px;
  border-color: gray;
  white-space: nowrap;
`;

const StyledTd = styled.td`
  border-style: solid;
  border-width: 1px;
  border-color: gray;
  white-space: nowrap;
`;
