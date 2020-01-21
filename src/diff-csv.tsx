import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import csvString from 'csv-string';

const exampleKeys1 = "key1,key2";
const exampleValue1 = "key1,key2,value\nhoge1,hoge2,hoge3\nfuga1,fuga2,fuga3\nfoo1,foo2,foo3\nbar1,bar2,bar3";
const exampleValue2 = "key1,key2,value\nhoge1,hoge2,hoge3\nfuga1,fuga2d,fuga3\nfoo1,foo2,foo3d\nbar1,bar2,bar3";

type State = {
  keyColumns: string;
  value1: string;
  value2: string;
};

export default () => {
  const [ state, dispatchState ] = useState({
    keyColumns: exampleKeys1,
    value1: exampleValue1,
    value2: exampleValue2
  });

  const onChangeKeysText1 = (e: React.ChangeEvent<HTMLInputElement>) => { dispatchState({ ...state, keyColumns: e.target.value }); };
  const onChangeValue1Text = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value1: e.target.value }); };
  const onChangeValue2Text = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value2: e.target.value }); };

  const onClickCalculateDiff = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    calculateDiff(
      state.keyColumns,
      state.value1,
      state.value2
    );
  };

  return <div>
    <input type="text" value={state.keyColumns} onChange={onChangeKeysText1} />
    <div>
      <textarea style={{ width: '40%', height: '30em'}} onChange={onChangeValue1Text} value={state.value1} />
      <textarea style={{ width: '40%', height: '30em'}} onChange={onChangeValue2Text} value={state.value2} />
    </div>
    <button style={{width: '100%'}} onClick={onClickCalculateDiff}>Calc diff</button>
  </div>;
}

const calculateDiff = (keyColumnsStr: string, input1Str: string, input2Str: string) => {
  const keyColumns = csvString.parse(keyColumnsStr)[0];
  const value1 = csvString.parse(input1Str);
  const value2 = csvString.parse(input2Str);
  console.log(keyColumns);
  console.log(value1);
  console.log(value2);
};
