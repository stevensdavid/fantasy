import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text
} from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'
import { LeagueList } from './LeagueList'

export class LeaguesHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leagues: [],
      loading: true
    }
    this.fetchLeagues = this.fetchLeagues.bind(this);
  }

  componentDidMount() {
    this.fetchLeagues();

    this.subs = [
      this.props.navigation.addListener('didFocus', () => {this.props.navigation.getParam("newData", false) ? this.fetchLeagues() : {}}),
    ]; 
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.remove());
  }

  fetchLeagues() {
    this.props.navigation.setParams({newData:false})
    this.setState({ loading: true })
    // apparently this isn't supported yet
    // const url = new URL(global.server + '/leagues'),
    //   params = { userId: global.userId }
    // Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(global.server + '/leagues?userId=' + global.userID, { method: 'GET' }).then(response => {
      return response.json();
    }).then(obj => {
      console.log('Mounted LeaguesHome leagues: ' + JSON.stringify(obj));
      this.setState({ leagues: obj, loading: false });
    }).catch(err => {
      console.error('GET leagues error: ' + err);
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner visible={this.state.loading} textContent={'Loading'} textStyle={styles.spinnerTextStyle} />
        <LeagueList navigation={this.props.navigation} leagues={this.state.leagues}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: "#b3002d",
  },
  loginText: {
    color: 'white',
  }
});
