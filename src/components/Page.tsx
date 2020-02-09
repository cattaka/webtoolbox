import React, {useEffect} from 'react'
import firebase from 'firebase';

type Props = {
  title?: string,
  trackName: string,
  children: React.ReactElement
};

export default (props: Props) => {
  useEffect(
    () => {
      if (props.title) {
        document.title = props.title;
        firebase.analytics().setCurrentScreen(props.trackName);
      }
    },
    [props.title]
  );

  return <React.Fragment>{props.children}</React.Fragment>
};
