import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import Home from './pages/home'
import DiffCsv from './pages/diff-csv'
import FormatJson from './pages/format-json'
import PullByRegex from './pages/pull-by-regex'
import About from './pages/about'
import Page from "./components/Page";

const App: React.FC = () => {
  return (
    <Router>
      <div className={'App-root'}>
        <nav className={'App-header'}>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/diff-csv">Diff CSV</Link>
            </li>
            <li>
              <Link to="/format-json">Format JSON</Link>
            </li>
            <li>
              <Link to="/pull-by-regex">Pull by regex</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>
        <div className={'App-content'}>
          <Switch>
            <Route path="/diff-csv">
              <Page title={'Diff CSV - WebToolbox'}><DiffCsv /></Page>
            </Route>
            <Route path="/format-json">
              <Page title={'Format JSON - WebToolbox'}><FormatJson /></Page>
            </Route>
            <Route path="/pull-by-regex">
              <Page title={'Pull by regex - WebToolbox'}><PullByRegex /></Page>
            </Route>
            <Route path="/about">
              <Page title={'About - WebToolbox'}><About /></Page>
            </Route>
            <Route path="/">
              <Page title={'WebToolbox'}><Home /></Page>
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
