import { useOktaAuth } from '@okta/okta-react';
/* eslint-disable camelcase, no-console */
import jwt_decode from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Header, Icon, Table } from 'semantic-ui-react';
import config from './config';

const List = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [items, setList] = useState(null);
  const [newTodo, setNewTodo] = useState(null);
  const [newListUpdate, setNewList] = useState('');
  const [messageFetchFailed, setMessageFetchFailed] = useState(false);
  const accessToken = oktaAuth.getAccessToken();
  const idToken = oktaAuth.getIdToken();
  const decodedIdToken = jwt_decode(idToken);
  const userEmail = decodedIdToken.email;

  // delete an item from list
  const deleteToDoItem = (id) => {
    fetch((`${config.resourceServer.listUrl}/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }
        setMessageFetchFailed(false);
        const responseJson = response.json();
        return responseJson;
      }).then((data) => {
        console.log(data);
        setNewList(`${id}-delete`);
      })
      .catch((err) => {
        setMessageFetchFailed(true);
        console.error(err);
      });
  };

  // add new to do item - used by Add button onClick
  const insertToDoItem = () => {
    fetch((`${config.resourceServer.listUrl}`), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newTodo, userEmail }),
    })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }
        setMessageFetchFailed(false);
        const responseJson = response.json();
        return responseJson;
      }).then((data) => {
        console.log(data);
        setNewList(data.insertedId);
        setNewTodo('');
      })
      .catch((err) => {
        setMessageFetchFailed(true);
        console.error(err);
      });
  };

  // fetch list of items
  useEffect(() => {
    console.log('useEffect is called');
    if (authState && authState.isAuthenticated) {
      fetch((`${config.resourceServer.listUrl}/${userEmail}`), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            return Promise.reject();
          }
          return response.json();
        })
        .then((data) => {
          setList(data.items);
          setMessageFetchFailed(false);
        })
        .catch((err) => {
          setMessageFetchFailed(true);
          console.error(err);
        });
    }
  }, [authState, newListUpdate]);

  return (
    <div>
      <Header as="h1">
        <Icon name="mail outline" />
        My List
      </Header>
      {!items && !messageFetchFailed && <p>Fetching list..</p>}
      {items
        && (
          <div>
            <Table>
              <thead>
                <tr>
                  <th>My To Do List</th>
                </tr>
                <tr>
                  <td>
                    <input name="new-todo" value={newTodo} onChange={(e) => { setNewTodo(e.target.value); }} placeholder="Enter a to do item here..." style={{ width: '100%' }} />
                  </td>
                  <td>
                    <button type="submit" name="new-todo-submit" onClick={insertToDoItem}>Add</button>
                  </td>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  /* eslint no-underscore-dangle: 0 */
                  <tr id={item._id} key={item._id}>
                    <td>{item.text}</td>
                    <td>
                      <button type="submit" name="delete-todo" onClick={() => deleteToDoItem(item._id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
    </div>
  );
};

export default List;
