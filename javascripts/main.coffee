$(window).load ->
  firebase.auth().onAuthStateChanged (user) ->
    window.logged_in_user = null
    $('html').removeClass 'logged-in'
    if user
      firebase.database().ref("users/#{user.uid}/access_token").once 'value', (profile_doc) ->
        if profile_doc.val()
          window.logged_in_user = user
          $('html').addClass 'logged-in'
        else
          firebase.auth().signOut()

  $('.github-login').on 'click', (e) ->
    provider = new firebase.auth.GithubAuthProvider();
    provider.addScope 'public_repo'
    firebase.auth().signInWithPopup(provider).then((data) ->
      firebase.database().ref("users/#{data.user.uid}/access_token").ref.set data.credential.accessToken
    ).catch (error) ->
      console.log error
