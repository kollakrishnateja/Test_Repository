const express = require('express')
const cookieSession = require('cookie-session')
const fetch = require('node-fetch')
const axios = require('axios');
require('dotenv').config()

const app = express();
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
  })
);
var access_token = "";
const clientsid = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

app.get("/", (req, res) => {
  res.send("Hello GitHub auth");
});

app.get("/login/github", (req, res) => {
  console.log(process.env.GITHUB_CLIENT_ID);
  console.log(process.env.GITHUB_CLIENT_SECRET);
  const redirect_uri = "https://immense-plateau-98003.herokuapp.com/login/github/callback";
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}`
  );
});

async function getAccessToken({ coder, client_id, client_secret }) {
//   const request = await fetch("https://github.com/login/oauth/access_token", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       clientsid,
//       client_secret,
//       code
//     })
//   });
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientsid}&client_secret=${client_secret}&code=${coder}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
         accept: 'application/json'
    }
  }).then((response) => {
    console.log("response: "+response);
    access_token = response.data.access_token;
    console.log("access 1: "+access_token);
    return access_token;
  })
//   console.log("request: "+request);
//   const text = await request.text();
//   console.log("text: "+text);
//   const params = new URLSearchParams(text);
//   console.log("params: "+params);
//   return params.get("access_token");
}

async function fetchGitHubUser(token) {
  const request = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: "token " + token
    }
  });
  console.log("request2: "+request);
  return await request.json();
}

app.get("/login/github/callback", async (req, res) => {
  const code = req.query.code;
  console.log("code1: "+code);
  
  const response = await axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${clientsid}&client_secret=${client_secret}&code=${code}`,
    // Set the content type header, so that we get the response in JSON
    headers: {
         accept: 'application/json'
    }
  })
    console.log("response: "+response);
    access_token = response.data.access_token;
    console.log("access 1: "+access_token);
  
  
  console.log("access out: "+access_token);
  const user = await fetchGitHubUser(access_token);
  if (user) {
    req.session.access_token = access_token;
    req.session.githubId = user.id;
    console.log("access: "+access_token);
    console.log("userid: "+user.id);
    res.redirect("/admin");
  } else {
    res.send("Login did not succeed!");
  }
});

app.get("/admin", async (req, res) => {
  if (req.session) {
    res.send("Hello Kevin <pre>" + JSON.stringify(req.session, null, 2));
    // Possible use "fetchGitHubUser" with the access_token
  } else {
    res.redirect("/login/github");
  }
});

app.get("/logout", (req, res) => {
  if (req.session) req.session = null;
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on localhost:" + PORT));
