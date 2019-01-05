// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { getFriendRepos } from './lib/friend-repos';
import * as actions from './redux/actions';
import { ipcRenderer } from './webpack-electron';
import type { Repos, Dispatch } from './redux/type';
import * as screens from './redux/screens';
import Welcome from './components/Welcome';
import EditTask from './components/EditTask';
import Work from './components/Work';
import { values } from './components/utils';

type Props = {|
  screen: string,
  repos: Repos,
  receiveRepos: Dispatch,
  receiveFriend: Dispatch,
|};

class App extends React.Component<Props> {
  async componentDidMount() {
    const { repos, receiveRepos, receiveFriend } = this.props;
    ipcRenderer.on('RECEIVE_FRIEND', (_, friend, lang) => {
      receiveFriend({ friend, lang });
    });

    if (Object.values(repos).length === 0) {
      const received = await getFriendRepos();
      receiveRepos(received);
      ipcRenderer.send('receive:repos', received);
    }
  }

  renderScreen() {
    const { screen } = this.props;
    switch (screen) {
      case screens.TASKS:
        return <Welcome />;
      case screens.EDIT_TASK:
        return (<EditTask />);
      case screens.WORK:
        return (<Work />);
      default:
        return null;
    }
  }

  render() {
    return (
      <div>
        {this.renderScreen()}
        <span
          style={{
            position: 'absolute',
            bottom: 5,
            left: 5,
            cursor: 'pointer',
          }}
          onClick={() => {
            try {
              localStorage.removeItem('state');
              window.location.reload();
            } catch (e) {
              // ¯\_(ツ)_/¯
            }
          }}
        >RESET
        </span>
      </div>
    );
  }
}

const mapState = state => ({
  repos: values(state.repos),
  screen: state.screen,
});

const mapDispatch = {
  receiveRepos: actions.receiveRepos,
  receiveFriend: actions.receiveFriend,
};

export default connect(mapState, mapDispatch)(App);
