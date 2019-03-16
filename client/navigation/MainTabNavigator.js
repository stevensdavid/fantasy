import React from 'react';
import {
  Platform
} from 'react-native';
import {
  createStackNavigator,
  createBottomTabNavigator
} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeaguesScreen from '../screens/LeaguesScreen';
import SearchScreen from '../screens/SearchScreen';
import TournamentView from '../components/Tournament/TournamentView';
import EventView from '../components/Event/EventView';
import RegisterView from '../components/Profile/RegisterForm';
import EditProfileView from '../components/Profile/EditProfile';
import LeagueView from '../components/League/LeagueView';
import CreateLeagueForm from '../components/League/CreateLeagueForm';
import EditDraftView from '../components/League/EditDraftView';
import FollowingView from '../components/Profile/FollowingView';
import FriendView from '../components/Profile/FriendView';
import FollowView from '../components/Profile/FollowView';
import FollowersView from '../components/Profile/FollowersView';
import LeagueParticipantsView from '../components/League/LeagueParticipantsView';
import SnakeLeagueView from '../components/League/SnakeLeagueView';

let localToken = global.token;

const HomeStack = createStackNavigator({
  Home: HomeScreen,
  Tournament: TournamentView,
  Event: EventView,
  CreateLeague: CreateLeagueForm
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ?
      `ios-information-circle${focused ? '' : '-outline'}` : 'md-information-circle'
    }
    />
  ),
};

const ProfileStack = createStackNavigator({
  Profile: ProfileScreen,
  Register: RegisterView,
  EditProfile: EditProfileView,
  Following: FollowingView,
  Followers: FollowersView,
  Friend: FriendView,
  Follow: FollowView
});

ProfileStack.navigationOptions = {
  tabBarLabel: 'Profile',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ? 'ios-person' : 'md-person'
    }
    />
  ),
};

const LeaguesStack = createStackNavigator({
  Leagues: LeaguesScreen,
  League: LeagueView,
  EditDraft: EditDraftView,
  Friend: FriendView,
  LeagueParticipants: LeagueParticipantsView,
  SnakeLeague: SnakeLeagueView
});

LeaguesStack.navigationOptions = {
  tabBarLabel: 'Leagues',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ?
      `ios-list${focused ? '-box' : ''}` : 'md-list'
    }
    />
  ),
  tabBarOnPress({ navigation, defaultHandler }) {
    // perform your logic here
    if(localToken != global.token) {
      localToken= global.token;
      navigation.navigate("Leagues");
    }
    // this is mandatory to perform the actual switch
    // don't call this if you want to prevent focus
    defaultHandler();
  }
};

const SearchStack = createStackNavigator({
  Search: SearchScreen,
  Tournament: TournamentView,
  Event: EventView,
  CreateLeague: CreateLeagueForm
})

SearchStack.navigationOptions = {
  tabBarLabel: 'Search',
  tabBarIcon: ({
    focused
  }) => ( <
    TabBarIcon focused = {
      focused
    }
    name = {
      Platform.OS === 'ios' ? `ios-search` : 'md-search'
    }
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  SearchStack,
  ProfileStack,
  LeaguesStack,
}, {
  tabBarOptions: {
    labelStyle: {
      fontSize: 12,
      color: '#fff',
    },
    style: {
      backgroundColor: '#800020',
    },
  }
});