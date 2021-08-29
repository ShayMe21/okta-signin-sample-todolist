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

const express = require('express');
const OktaJwtVerifier = require('@okta/jwt-verifier');
var cors = require('cors');
const {
  MongoClient, ObjectId
} = require('mongodb');
// MongoDB Connection URL
const uri = 'mongodb+srv://todolist-db-admin-user:4GksN*-VABc%40KhK@cluster0.li5ma.mongodb.net/todolist-db?retryWrites=true&w=majority';
var client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sampleConfig = require('../config.js');

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: sampleConfig.resourceServer.oidc.clientId,
  issuer: sampleConfig.resourceServer.oidc.issuer,
  assertClaims: sampleConfig.resourceServer.assertClaims,
  testing: sampleConfig.resourceServer.oidc.testing
});

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
function authenticationRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (!match) {
    res.status(401);
    return next('Unauthorized');
  }

  const accessToken = match[1];
  const audience = sampleConfig.resourceServer.assertClaims.aud;
  return oktaJwtVerifier.verifyAccessToken(accessToken, audience)
    .then((jwt) => {
      req.jwt = jwt;
      next();
    })
    .catch((err) => {
      res.status(401).send(err.message);
    });
}

const app = express();

/**
 * For local testing only!  Enables CORS for all domains
 */
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Nothing to see here'
  });
});

app.get('/secure', authenticationRequired, (req, res) => {
  res.json(req.jwt);
});

app.get('/api/list/:email', authenticationRequired, (req, res) => {
  client.connect(err => {
    if (err) {
      console.log(err);
    }
    client.db('todolist-db').collection('todolists').find({
      userEmail: req.params.email
    }).toArray((err, results) => {
      if (err) {
        throw err;
      }
      res.json({
        items: results
      });
      client.close();
    });
  });
});

app.post('/api/list', authenticationRequired, (req, res) => {
  const userEmail = req.body.userEmail;
  const text = req.body.text;

  client.connect(err => {
    if (err) {
      console.log(err);
    }
    if (userEmail && text) {
      client.db('todolist-db').collection('todolists').insertOne({
        userEmail: userEmail,
        text: text
      }, (err, results) => {
        if (err) {
          throw err;
        }
        res.json(results);
        client.close();
      });
    } else {
      res.send(req.body);
    }
  });
});

app.delete('/api/list/:id', authenticationRequired, (req, res) => {
  const id = req.params.id;

  client.connect(err => {
    if (err) {
      console.log(err);
    }
    if (id) {
      client.db('todolist-db').collection('todolists').deleteOne({
        // eslint-disable-next-line new-cap
        _id: ObjectId(id)
      }, (err, results) => {
        if (err) {
          throw err;
        }
        res.json(results);
        client.close();
      });
    } else {
      res.send(req.params.id);
    }
  });
});

app.listen(sampleConfig.resourceServer.port, () => {
  console.log(`Resource Server Ready on port ${sampleConfig.resourceServer.port}`);
});
