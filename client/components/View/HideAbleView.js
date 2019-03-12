import React from 'react';
import { View } from 'react-native';

export class HideAbleView extends React.Component {
    constructor(props) {
        super(props)
    }
      
  render() {
    if (this.props.hide) {
        return null;
    }
      return (
        <View {...this.props} style={this.props.style}>
          {this.props.children}
        </View>
      );
  }
}
