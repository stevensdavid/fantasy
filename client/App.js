import React from 'react';
import { Platform, StatusBar, StyleSheet, View, YellowBox } from 'react-native';
import { AppLoading } from 'expo';
import * as Icon from '@expo/vector-icons';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import AppNavigator from './navigation/AppNavigator';
import SocketIOClient from "socket.io-client";
import DropdownAlert from 'react-native-dropdownalert';


global.token = null;
global.server = "https://dstevens.se:5000";
global.userID = null;
global.newUserInfo = false;
global.newDraft = false;
global.newParticipantsInfo = false;
global.webSocket = SocketIOClient(global.server + "/", {
  secure: true,
  reconnect: true,
  transports: ["websocket"]
});

// Socket.IO has a harmless warning on react native which can safely be ignored
console.ignoredYellowBox = ['Remote debugger'];
YellowBox.ignoreWarnings([
  'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);


export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  constructor(props) {
    super(props);
    this.routineUpdate = this.routineUpdate.bind(this);
    this.newLeague = this.newLeague.bind(this);
    this.leagueRemoved = this.leagueRemoved.bind(this);
    this.removedFromLeague = this.removedFromLeague.bind(this);
  }

  componentDidMount() {
    global.webSocket.on('routine-update', this.routineUpdate);
    global.webSocket.on('league-removed', this.leagueRemoved);
    global.webSocket.on('removed-from-league', this.removedFromLeague);
    global.webSocket.on('new-league', this.newLeague)
  }

  routineUpdate() {

  }

  removedFromLeague(league) {
    this.dropdown.alertWithType('warn', 'Removed from league',
      `You have been removed from "${league.name}".`)
  }

  newLeague(league) {
    this.dropdown.alertWithType('success', 'New league',
      `You have been added to the league "${league.name}" for ${league.event.name} at ${league.event.tournament.name}`)
  }

  leagueRemoved(league) {
    this.dropdown.alertWithType('warn', 'League removed',
      `The league "${league.name}" has been deleted.`)
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <AppNavigator />
          <DropdownAlert ref={ref => this.dropdown = ref} />
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});
