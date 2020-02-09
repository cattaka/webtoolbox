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
import ForceDirectedGraph from './pages/force-directed-graph'
import UrlEncode from './pages/urlencode'
import Base64 from './pages/base64'
import DataUri from './pages/data-uri'
import About from './pages/about'
import Page from "./components/Page";
import firebase from "firebase";
import { firebase_settings } from "./settings";

firebase.initializeApp(firebase_settings);

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
              <Link to="/force-directed-graph">Force directed graph</Link>
            </li>
            <li>
              <Link to="/urlencode">URLEncode</Link>
            </li>
            <li>
              <Link to="/base64">Base64</Link>
            </li>
            <li>
              <Link to="/data-uri">Data URI</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>
        <div className={'App-content'}>
          <Switch>
            <Route path="/diff-csv">
              <Page title={'Diff CSV - WebToolbox'} trackName={'DiffCsv'}><DiffCsv /></Page>
            </Route>
            <Route path="/format-json">
              <Page title={'Format JSON - WebToolbox'} trackName={'FormatJson'}><FormatJson /></Page>
            </Route>
            <Route path="/pull-by-regex">
              <Page title={'Pull by regex - WebToolbox'} trackName={'PullByRegex'}><PullByRegex /></Page>
            </Route>
            <Route path="/force-directed-graph">
              <Page title={'Force directed graph - WebToolbox'} trackName={'ForceDirectedGraph'}><ForceDirectedGraph /></Page>
            </Route>
            <Route path="/urlencode">
              <Page title={'Url encode - WebToolbox'} trackName={'UrlEncode'}><UrlEncode /></Page>
            </Route>
            <Route path="/base64">
              <Page title={'Base64 - WebToolbox'} trackName={'Base64'}><Base64 /></Page>
            </Route>
            <Route path="/data-uri">
              <Page title={'Data URI - WebToolbox'} trackName={'DataUri'}><DataUri /></Page>
            </Route>
            <Route path="/about">
              <Page title={'About - WebToolbox'} trackName={'About'}><About /></Page>
            </Route>
            <Route path="/">
              <Page title={'WebToolbox'} trackName={'Home'}><Home /></Page>
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
