import React from 'react';
import {
  StyleSheet,
  ScrollView
} from 'react-native'
import Spinner from 'react-native-loading-spinner-overlay'

export class LeaguesHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leagues: [],
      loading: false
    }
  }

  setLeagues() {
    this.setState({ loading: true })
    const url = new URL(global.server + '/leagues'),
      params = { userId: global.userId }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url, { method: 'GET' }).then(response => {
      return response.json();
    }).then(obj => {
      this.setState({ leagues: obj });
      this.setState({ loading: false })
    }).catch(err => {
      console.error('GET leagues error: ' + err);
      this.setState({ loading: false });
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner visible={this.state.loading} textContent={'Loading'} textStyle={styles.spinnerTextStyle} />
        <ScrollView>

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 300,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCDCDC',
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
