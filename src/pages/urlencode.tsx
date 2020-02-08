import React, { useState } from 'react';
import styled from 'styled-components';
import {
  binaryStringToUint8Array,
  downloadFile,
  formatYyyyMmDdHhMmSs,
  readFileAsBinaryString
} from "../utils/global-functions";

const exampleValue = 'Example text';

type State = {
  fileList: FileList | null;
  value: string;
  result: string;
  error?: string;
};

export default () => {
  const [ state, dispatchState ] = useState({
    fileList: null,
    value: exampleValue,
    result: '',
    indent: 2
  } as State);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchState({...state, fileList: e.target.files});
  };

  const onChangeValueText = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value: e.target.value }); };

  const onClickEncodeFromFile = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const file = state.fileList && state.fileList[0];
    if (!file) {
      return;
    }
    try {
      const src = await readFileAsBinaryString(file);
      const converted = encodeURIComponent(src);
      dispatchState({ ...state, value: 'Imported from file', result: converted, error: undefined });
    } catch (e) {
      const errorStr = (e.message) ? e.message.toString() : JSON.stringify(e);
      dispatchState({ ...state, result: '', error: errorStr });
    }
  };

  const onClickEncode = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      const converted = encodeURIComponent(state.value);
      dispatchState({ ...state, result: converted, error: undefined });
    } catch (e) {
      const errorStr = (e.message) ? e.message.toString() : JSON.stringify(e);
      dispatchState({ ...state, result: '', error: errorStr });
    }
  };

  const onClickDecode = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      const converted = decodeURIComponent(state.value);
      dispatchState({ ...state, result: converted, error: undefined });
    } catch (e) {
      const errorStr = (e.message) ? e.message.toString() : JSON.stringify(e);
      dispatchState({ ...state, result: '', error: errorStr });
    }
  };

  const onClickDecodeToFile = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      const binary = decodeURIComponent(state.value);
      const array = binaryStringToUint8Array(binary);
      const rawBlob = new Blob([array], { type: "application/octet-stream" });
      const filename = `decoded-base64-${formatYyyyMmDdHhMmSs(new Date())}.bin`
      dispatchState({ ...state, result: 'Exported to file', error: undefined });
      downloadFile(filename, rawBlob);
    } catch (e) {
      const errorStr = (e.message) ? e.message.toString() : JSON.stringify(e);
      dispatchState({ ...state, result: '', error: errorStr });
    }
  };

  const onClickSwap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const t = state.result;
    dispatchState({ ...state, value: t, result: state.value });
  };

  return <div>
    <h1>URL Encode converter</h1>
    <div>
      {
        (state.error) ? <span>{state.error}</span> : undefined
      }
    </div>
    <h2>Input</h2>
    <FromTextArea>
      <label htmlFor="inputFile">Input file:</label>
      <input name={"inputFile"} type={'file'} onChange={onChangeFile}/>
      <ExecButton onClick={onClickEncodeFromFile}>Encode from file</ExecButton>
    </FromTextArea>
    <FromTextArea>
      <ValueTextArea onChange={onChangeValueText} value={state.value} />
      <ButtonArea>
        <ExecButton onClick={onClickEncode}>Encode</ExecButton>
        <ExecButton onClick={onClickDecode}>Decode</ExecButton>
        <ExecButton onClick={onClickDecodeToFile}>Decode to file</ExecButton>
      </ButtonArea>
    </FromTextArea>
    <SwapButton onClick={onClickSwap}>↕Swap↕</SwapButton>
    <div>
      <h2>Output</h2>
      <ResultTextArea value={state.result} />
    </div>
  </div>;
}

const FromFileArea = styled.div`
  width: 100%;
`;

const FromTextArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const ValueTextArea = styled.textarea`
  width: 70%;
  height: 20em;
`;

const ResultTextArea = styled.textarea`
  width: 90%;
  height: 40em;
`;

const ButtonArea = styled.div`
  width: 20%;
`;

const ExecButton = styled.button`
  padding: 4pt;
  display: block;
  width: 12em;
`;

const SwapButton = styled.button`
  margin-right: 10%;
  padding: 4pt;
`;
