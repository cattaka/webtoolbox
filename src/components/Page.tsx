import React, {useEffect} from 'react'

type Props = {
  title?: string,
  children: React.ReactElement
};

export default (props: Props) => {
  useEffect(
    () => {
      if (props.title) {
        document.title = props.title;
      }
    },
    [props.title]
  );

  return <React.Fragment>{props.children}</React.Fragment>
};
