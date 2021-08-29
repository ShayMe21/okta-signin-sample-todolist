/*
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { useOktaAuth } from '@okta/okta-react';
import React, { useEffect, useState } from 'react';
import { Header } from 'semantic-ui-react';

const Home = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!authState || !authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      });
    }
  }, [authState, oktaAuth]); // Update if authState changes

  // const login = async () => {
  //   oktaAuth.signInWithRedirect({ originalUri: '/' });
  // };

  if (!authState) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div>
      <div>
        <Header as="h1">Best To Do list App using PKCE Flow w/ Okta Hosted Login Page</Header>

        { authState.isAuthenticated && !userInfo
        && <div>Loading user information...</div>}

        {authState.isAuthenticated && userInfo
        && (
        <div>
          <p>
            Welcome, &nbsp;
            {userInfo.name}
            !
          </p>
          <p>
            You have successfully logged in!
            You can visit your Profile:
            {' '}
            <a href="/profile">My Profile</a>
            {' '}
          </p>
          <h3>Manage your To Do List:</h3>
          <p>
            Visit your To Do List here
            {' '}
            <a href="/list"> My To Do List</a>
            {' '}
          </p>
        </div>
        )}

        {!authState.isAuthenticated
        && (() => {
          oktaAuth.signInWithRedirect({ originalUri: '/' });
        })()}
      </div>
    </div>
  );
};
export default Home;
