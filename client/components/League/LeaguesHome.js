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
      loading: true,
      token: global.token
    }
    this.fetchLeagues = this.fetchLeagues.bind(this);
  }

  componentDidMount() {
    this.navigationWillFocusListener = this.props.navigation.addListener('willFocus', () => {
      console.log("will focus");
        this.props.navigation.getParam("newData", false) ? 
        this.newLeague(this.props.navigation.getParam("leagueID", -1)) 
        : {}
    })

    this.fetchLeagues();
  }

  componentDidUpdate() {
    console.log("DidUpdate");
    if(this.state.token != global.token) {
      this.setState({token: global.token});
      this.fetchLeagues();
    }
  }

  newLeague(newLeagueID) {
    this.fetchLeagues();
    if(this.props.navigation.getParam("isSnake", false)) {
      this.props.navigation.navigate("SnakeLeague", { leagueID: newLeagueID })
    } else {
      this.props.navigation.navigate("League", { leagueID: newLeagueID })
    }
  }

  componentWillUnmount () {
    this.navigationWillFocusListener.remove()
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
      this.setState({ leagues: obj, loading: false});
    }).catch(err => {
      this.setState({ loading: false});
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
