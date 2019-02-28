import React from 'react';
import { ExpoConfigView } from '@expo/samples';

export default class CreateLeagueScreen extends React.Component {
  static navigationOptions = {
    title: 'Create League',
  };

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return <ExpoConfigView />;
  }
}
