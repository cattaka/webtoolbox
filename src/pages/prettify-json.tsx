import React, { useState } from 'react';
import styled from 'styled-components';
import csvString from 'csv-string';
import {isString} from "util";

const exampleValue = '{"a":1,"b":2,"c":{"d":3,"e":4}}';

type State = {
  value: string;
  result: string;
  indent: number;
  error?: string;
};

export default () => {
  const [ state, dispatchState ] = useState({
    value: exampleValue,
    result: '',
    indent: 2
  } as State);

  const onChangeIndent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatchState({
      ...state,
      indent: parseInt(e.target.value, 10)
    });
  };
  const onChangeValueText = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value: e.target.value }); };

  const onClickExecute = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      const obj = JSON.parse(state.value);
      const json = JSON.stringify(obj, null, state.indent);
      dispatchState({ ...state, result: json, error: undefined });
    } catch (e) {
      const errorStr = (e.message) ? e.message.toString() : JSON.stringify(e);
      dispatchState({ ...state, result: '', error: errorStr });
    }
  };

  return <div>
    <div>
      {
        (state.error) ? <span>{state.error}</span> : undefined
      }
    </div>
    <label htmlFor="indent">Indent:</label>
    <select name={"indent"} defaultValue={state.indent} onChange={onChangeIndent}>
      <option value={"1"}>1</option>
      <option value={"2"}>2</option>
      <option value={"3"}>3</option>
      <option value={"4"}>4</option>
      <option value={"5"}>5</option>
      <option value={"6"}>6</option>
      <option value={"7"}>7</option>
      <option value={"8"}>8</option>
    </select>
    <div>
      <ValueTextArea onChange={onChangeValueText} value={state.value} />
      <ExecButton onClick={onClickExecute}>Execute</ExecButton>
      <ResultTextArea value={state.result} />
    </div>
  </div>;
}

const ValueTextArea = styled.textarea`
  width: 90%;
  height: 20em;
`;

const ResultTextArea = styled.textarea`
  width: 90%;
  height: 40em;
`;

const ExecButton = styled.button`
  width: 90%;
`;
