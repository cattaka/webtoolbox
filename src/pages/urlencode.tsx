import React, { useState } from 'react';
import styled from 'styled-components';

const exampleValue = 'Example text';

type State = {
  value: string;
  result: string;
  error?: string;
};

export default () => {
  const [ state, dispatchState ] = useState({
    value: exampleValue,
    result: '',
    indent: 2
  } as State);

  const onChangeValueText = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value: e.target.value }); };

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
  const onClickSwap = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const t = state.result;
    dispatchState({ ...state, value: t, result: state.value });
  };

  return <div>
    <div>
      {
        (state.error) ? <span>{state.error}</span> : undefined
      }
    </div>
    <div>
      <ValueTextArea onChange={onChangeValueText} value={state.value} />
      <ButtonArea>
        <SwapButton onClick={onClickSwap}>↕Swap↕</SwapButton>
        <ExecButton onClick={onClickEncode}>Encode</ExecButton>
        <ExecButton onClick={onClickDecode}>Decode</ExecButton>
      </ButtonArea>
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

const ButtonArea = styled.div`
  display: inline;
`;

const ExecButton = styled.button`
  width: 30%;
  padding: 4pt;
`;

const SwapButton = styled.button`
  margin-right: 10%;
  padding: 4pt;
`;