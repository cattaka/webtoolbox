import React, { useState } from 'react';
import styled from 'styled-components';
import csvString from 'csv-string';

const exampleRegex = '<div><img src="([^"]+)".*>(.+)</div>';
const exampleValue = '<html>\n' +
  '<body>\n' +
  '<div><img src="http://localhost/hoge.png" alt="hoge">hogehoge</div>\n' +
  '<div><img src="http://localhost/fuga.png" alt="hoge">fugafuga</div>\n' +
  '</body>\n' +
  '</html>\n';

type State = {
  regex: string;
  value: string;
  result: string;
  indent: number;
  error?: string;
  separator: string;
  quote: string;
};

export default () => {
  const [ state, dispatchState ] = useState({
    regex: exampleRegex,
    value: exampleValue,
    result: '',
    indent: 2,
    separator: ",",
    quote: '"'
  } as State);

  const onChangeIndent = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatchState({
      ...state,
      indent: parseInt(e.target.value, 10)
    });
  };
  const onChangeRegexText = (e: React.ChangeEvent<HTMLInputElement>) => { dispatchState({ ...state, regex: e.target.value }); };
  const onChangeValueText = (e: React.ChangeEvent<HTMLTextAreaElement>) => { dispatchState({ ...state, value: e.target.value }); };
  const onChangeSeparator = (e: React.ChangeEvent<HTMLSelectElement>) => { dispatchState({...state, separator: e.target.value}); };
  const onChangeQuote = (e: React.ChangeEvent<HTMLSelectElement>) => { dispatchState({...state, quote: e.target.value}); };

  const onClickExecute = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      const resultsArray: string[][] = [];
      const regex = new RegExp(state.regex,'g');
      let lastPos = -1;
      let execArray: RegExpExecArray | null = null;
      while ((execArray = regex.exec(state.value)) !== null) {
        if (lastPos === execArray.index) {
          break;
        }
        resultsArray.push(execArray.slice(1));
      }
      const result = csvString.stringify(resultsArray, state.separator, state.quote);
      dispatchState({ ...state, result: result, error: undefined });
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

    <div>
      <label htmlFor="regex">Regex:</label>
      <input name={"regex"} type="text" value={state.regex} onChange={onChangeRegexText} />
    </div>
    <label htmlFor="separator">Separator of output:</label>
    <select name={"separator"} defaultValue={state.separator} onChange={onChangeSeparator}>
      <option value={","}>,</option>
      <option value={"\t"}>TAB</option>
    </select>
    <div style={{display: "none"}}> {/* Not supported yet */}
      <label htmlFor="quote">Output quote:</label>
      <select defaultValue={state.quote} onChange={onChangeQuote}>
        <option value={'"'}>"</option>
        <option value={"'"}>'</option>
      </select>
    </div>
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
