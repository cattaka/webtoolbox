import React, {useState} from 'react';
import styled from 'styled-components';

const exampleValue = 'Example text';

type State = {
  fileList: FileList | null;
  result: string;
  error?: string;
};

export default () => {
  const [state, dispatchState] = useState({
    result: ''
  } as State);

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchState({...state, fileList: e.target.files});
  };

  const onClickEncode = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const file = state.fileList && state.fileList[0];
    console.log(file);
    if (!file) {
      return;
    }
    try {
      const dataUri = await promiseFileReader(file);
      dispatchState({ ...state, result: dataUri, error: undefined });
    } catch (e) {
      const errorStr = (e.message) ? e.message.toString() : JSON.stringify(e);
      dispatchState({...state, result: '', error: errorStr});
    }
  };

  return <div>
    <h2>Convert file to Data URI</h2>
    <div>
      {
        (state.error) ? <span>{state.error}</span> : undefined
      }
    </div>
    <div>
      <label htmlFor="inputFile">Input file:</label>
      <input name={"inputFile"} type={'file'} onChange={onChangeFile}/>
    </div>
    <div>
      <ButtonArea>
        <ExecButton onClick={onClickEncode}>Convert</ExecButton>
      </ButtonArea>
      <ResultTextArea value={state.result}/>
    </div>
  </div>;
}


const promiseFileReader = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result;
      if (result && typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error("Loading of the file failed."));
      }
    };
    reader.readAsDataURL(file);
  });
};

const ResultTextArea = styled.textarea`
  width: 90%;
  height: 10em;
`;

const InputTextArea = styled.textarea`
  width: 90%;
  height: 10em;
`;

const ButtonArea = styled.div`
  display: inline;
`;

const ExecButton = styled.button`
  width: 30%;
  padding: 4pt;
`;

