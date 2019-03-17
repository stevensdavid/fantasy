import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Alert
} from 'react-native'
import { LeagueList } from './LeagueList'

export class LeaguesHome extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      leagues: [],
      loading: true,
      token: global.token
    }
    this.fetchLeagues = this.fetchLeagues.bind(this);
    this.leagueRemoved = this.leagueRemoved.bind(this);
    this.newLeague = this.newLeague.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this.navigationWillFocusListener = this.props.navigation.addListener('willFocus', () => {
        this.props.navigation.getParam("newData", false) ? 
        this.createdLeague(this.props.navigation.getParam("leagueID", -1)) 
        : {}
    })
    global.webSocket.on('league-removed', this.leagueRemoved);
    global.webSocket.on('removed-from-league', this.leagueRemoved);
    global.webSocket.on('new-league', this.newLeague);
    this.fetchLeagues();
  }

  componentDidUpdate() {
    if (!this._isMounted) return;
    if(this.state.token != global.token) {
      this.setState({token: global.token});
      this.fetchLeagues();
    }
  }

  leagueRemoved(league) {
    if (!this._isMounted) return;
    console.log('league-removed handled in LeaguesHome');
    if (this.state.leagues.find(x => x.league_id == league.league_id)) {
      Alert.alert(`The league "${league.name}" has been deleted.`);
      this.setState({ leagues: this.state.leagues.filter(x => x.league_id != league.league_id) });
    }
  }

  newLeague(league) {
    if (!this._isMounted) return;
    this.setState({ leagues: this.state.leagues.concat(league) });
  }

  createdLeague(newLeagueID) {
    if (!this._isMounted) return;
    this.fetchLeagues();
    if(this.props.navigation.getParam("isSnake", false)) {
      this.props.navigation.navigate("SnakeLeague", { leagueID: newLeagueID })
    } else {
      this.props.navigation.navigate("League", { leagueID: newLeagueID })
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.navigationWillFocusListener.remove();
    global.webSocket.off('league-removed', this.leagueRemoved);
    global.webSocket.off('removed-from-league', this.leagueRemoved);
    global.webSocket.off('new-league', this.newLeague);
  }

  fetchLeagues() {
    if (!this._isMounted) return;
    this.props.navigation.setParams({newData:false})
    this.setState({ loading: true })
    // apparently this isn't supported yet
    // const url = new URL(global.server + '/leagues'),
    //   params = { userId: global.userId }
    // Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(global.server + '/leagues?userId=' + global.userID, { method: 'GET' }).then(response => {
      return response.json();
    }).then(obj => {
      if (!this._isMounted) return;
      this.setState({ leagues: obj, loading: false});
    }).catch(err => {
      if (!this._isMounted) return;
      console.log(err);
      this.setState({ loading: false});
    });
  }

  render() {
    return (
      <View style={styles.container}>
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
