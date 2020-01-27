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
import PrettifyJson from './pages/prettify-json'
import About from './pages/about'

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
              <Link to="/diff-csv">diff-csv</Link>
            </li>
            <li>
              <Link to="/prettify-json">prettify-json</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>
        <div className={'App-content'}>
          <Switch>
            <Route path="/diff-csv">
              <DiffCsv />
            </Route>
            <Route path="/prettify-json">
              <PrettifyJson />
            </Route>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
