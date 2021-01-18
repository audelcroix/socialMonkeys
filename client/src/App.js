import React, { Fragment } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import "./App.css";

// Components
import PrivateRoute from "./components/routing/PrivateRoute";

import ColorGate from "./components/parts/ColorGate";

import Navbar from "./components/parts/Navbar";
import AlertBar from "./components/parts/AlertBar";
import Footer from "./components/parts/Footer";

import Home from "./components/pages/Home";
import Profile from "./components/pages/Profile";

import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import CreatePost from "./components/pages/CreatePost";
import CreateImage from "./components/pages/CreateImage";
import ImageDetail from "./components/pages/ImageDetail";
import About from "./components/pages/About";
import SearchResults from "./components/pages/SearchResults";
import pageNotFound from "./components/pages/pageNotFound";

// REDUX
import { Provider } from "react-redux";
import { store, persistor } from "./store";

import setAuthToken from "./utils/setAuthToken";

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <PersistGate persistor={persistor}>
          <Fragment>
            <ColorGate>
              {/* ColorGate works as a page-container and enables adaptive styling for the whole app  */}
              <Navbar />

              <div className='container'>
                <AlertBar />

                <Switch>
                  <PrivateRoute exact path='/' component={Home} />

                  <PrivateRoute exact path='/post' component={CreatePost} />
                  <PrivateRoute exact path='/image' component={CreateImage} />

                  <Route exact path='/about' component={About} />
                  <Route exact path='/login' component={Login} />
                  <Route exact path='/register' component={Register} />

                  <PrivateRoute
                    exact
                    path='/user/:slugUsername'
                    component={Profile}
                  />

                  <PrivateRoute
                    exact
                    path='/search/:query'
                    component={SearchResults}
                  />

                  <PrivateRoute
                    exact
                    path='/image/:imageId'
                    component={ImageDetail}
                  />

                  <Route path='/404' component={pageNotFound} />
                  <Redirect to='/404' />
                </Switch>
              </div>

              <Footer />
            </ColorGate>
          </Fragment>
        </PersistGate>
      </Router>
    </Provider>
  );
};

export default App;
