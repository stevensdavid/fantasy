import React from 'react';
import { View } from 'react-native'
import { ScrollableListContainer } from '../Container/ScrollableListContainer'

export class LeagueList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false
        }
        this.setLeagues = this.setLeagues.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.render = this.render.bind(this);
    }

    /*componentDidMount() {
        this.setLeagues();
    }*/

    componentDidUpdate(prevProps) {
        if (this.props.leagues !== prevProps.leagues) {
            this.setState({loading: true})
            this.setLeagues().then(newData => {
                this.setState({ data: newData });
                this.setState({loading: false})
                console.log('LeagueList.componentDidUpdate is done: ' + JSON.stringify(this.state.data))
            }).catch(err => console.log(err));
        }
    }

    async setLeagues() {
        console.log('LeagueList setting data: ' + JSON.stringify(this.props.leagues))

        const newData = await Promise.all(this.props.leagues.map(async league => {
            console.log('Handling league ' + league.league_id)
            try {
                let res = await fetch(global.server + '/events/' + league.event, { method: 'GET' });
                let event = await res.json();
                res = await fetch(global.server + '/tournaments/' + event.tournament, { method: 'GET' });
                let tournament = await res.json();
                return {
                    key: league.league_id.toString(),
                    title: league.name,
                    description: tournament.name + ': ' + event.name,
                    img_uri: tournament.ext_icon_url
                }
            } catch (err){
                console.log(err);
                return
            }
        }))
        console.log('LeagueList.setLeagues done setting data, newData is ' + JSON.stringify(newData))
        return this.state.data.concat(newData);
    }

    render() {
        return (
            <View>
                <ScrollableListContainer
                    data={this.state.data}
                    onItemClick={key => { }}
                    //style={null}
                    loading={this.state.loading}
                />
            </View>
        );
    }
}