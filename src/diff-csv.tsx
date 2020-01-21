import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import csvString from 'csv-string';

const exampleKeys1 = "key1,key2";
const exampleValue1 = "key1,key2,value\nhoge1,hoge2,hoge3\nfuga1,fuga2,fuga3\nfoo1,foo2,foo3\nbar1,bar2,bar3";
const exampleValue2 = "key1,key2,value\nhoge1,hoge2,hoge3\nfuga1,fuga2d,fuga3\nfoo1,foo2,foo3d\nbar1,bar2,bar3";

type State = {
  keyColumns: string;
  value1: string;
  value2: string;
  markedTable?: MarkedTable;
  showOnlyDiff: boolean;
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
    showOnlyDiff: false
  } as State);

  const onChangeKeysText1 = (e: React.ChangeEvent<HTMLInputElement>) => { dispatchState({ ...state, keyColumns: e.target.value }); };
  const onChangeValue1Text = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value1: e.target.value }); };
  const onChangeValue2Text = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value2: e.target.value }); };

  const onClickCalculateDiff = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const diffTable = calculateDiff(
      state.keyColumns,
      state.value1,
      state.value2
    );
    dispatchState({ ...state, markedTable: diffTable });
  };

  return <div>
    <input type="text" value={state.keyColumns} onChange={onChangeKeysText1} />
    <div>
      <textarea style={{ width: '40%', height: '30em'}} onChange={onChangeValue1Text} value={state.value1} />
      <textarea style={{ width: '40%', height: '30em'}} onChange={onChangeValue2Text} value={state.value2} />
    </div>
    <button style={{width: '100%'}} onClick={onClickCalculateDiff}>Calc diff</button>
    <div>
      { state.markedTable ? genMarkedTable(state.markedTable, state.showOnlyDiff) : undefined }
    </div>
  </div>;
}

const calculateDiff = (keyColumnsStr: string, input1Str: string, input2Str: string): MarkedTable => {
  const keyColumns = csvString.parse(keyColumnsStr)[0];
  const input1 = csvString.parse(input1Str);
  const input2 = csvString.parse(input2Str);

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
    console.log(keys);
  });
  const prevKeys2Values: Map<string, Map<string, string>> = new Map();
  prevValuesList.forEach(vs => {
    const keys = JSON.stringify(keyColumns.map(k => vs.get(k)));
    prevKeys2Values.set(keys, vs);
    console.log(keys);
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
      }
    } else {
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
      {/*<div>*/}
      {/*  <CheckBox onChange={onChangeShowOnlyDiff}>変更のあるもののみ表示</CheckBox>*/}
      {/*</div>*/}
          <table>
            <StyledTr>
              {markedTable.header.cells.map(cell => (
                <StyledTh style={{ backgroundColor: cell.color, color: cell.isKey ? 'red' : undefined }}>
                  {cell.text}
                </StyledTh>
              ))}
            </StyledTr>
            {markedTable.rows.map(
              row =>
                (!showOnlyDiff || row.hasDiff) && (
                  <StyledTr>
                    {row.cells.map(cell => (
                      <StyledTd style={{ backgroundColor: cell.color }} title={cell.oldText}>{cell.text}</StyledTd>
                    ))}
                  </StyledTr>
                )
            )}
          </table>
    </div>
  );
};

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
