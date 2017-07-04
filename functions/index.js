/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// [START all]
// [START import]

// firebase stuff
const functions = require('firebase-functions');
const admin = require('firebase-admin');
var auth = require('basic-auth')
var request = require('request');
var Octokat = require('octokat')
var atob = require('atob')
var btoa = require('btoa')



admin.initializeApp(functions.config().firebase);


exports.addMessage = functions.https.onRequest((req, res) => {
  var credentials = auth(req);

  if (!credentials || credentials.name !== functions.config().auth.name || credentials.pass !== functions.config().auth.pass) {
    return Promise.reject('bad auth');
  }
  admin.database().ref('/users').once('value')
  .then(total_snapshot => {
    var snaps = [];

    total_snapshot.forEach(function(snap) {
      var octo = new Octokat({
        token: snap.child('access_token').val()
      })
      var repo = octo.repos('jasongornall', 'always-green');
      var config = {
        message: 'always green'
      }
      var promise = repo.issues.create({
        title: 'Always Green',
        body: 'Always Green!!!'
      })
      .then(function(info) {
        return repo.issues(info.number).update({
          state: 'closed'
        })
      })
      .then(function(info) {
        console.log(info, 'good');
        return Promise.resolve('good', info);
      })
      .catch(function(error) {
         console.log(error, 'error');
        return Promise.resolve('error', error);
      })
      snaps.push(promise);
    })

    return Promise.all(snaps)
  })
  .then(function () {
    res.status(200).send('ok');
  });
});


