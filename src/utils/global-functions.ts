export function hashcode(str: string) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    let ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash;
}

export const downloadFile = (filename: string, blob: Blob) => {
  const element = document.createElement('a');
  element.setAttribute('href', window.URL.createObjectURL(blob));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const formatYyyyMmDdHhMmSs = (dt: Date): string  =>{
  const y = dt.getFullYear();
  const m = ("00" + (dt.getMonth()+1)).slice(-2);
  const d = ("00" + dt.getDate()).slice(-2);
  const h = ("00" + dt.getHours()).slice(-2);
  const min = ("00" + dt.getMinutes()).slice(-2);
  const s = ("00" + dt.getSeconds()).slice(-2);
  return y + m + d + h + min + s;
}

export const binaryStringToUint8Array = (binary: string): Uint8Array => {
  const array = new Uint8Array(binary.length)
  for(let i = 0; i < binary.length; i++ ) {
    array[i] = binary.charCodeAt(i);
  }
  return array;
}

export const readFileAsDataURL = (file: File): Promise<string> => {
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

export const readFileAsBinaryString = (file: File): Promise<string> => {
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
    reader.readAsBinaryString(file);
  });
};
