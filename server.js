const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'chips',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Lisa',
      email: 'lisa@gmail.com',
      password: 'icecream',
      entries: 0,
      joined: new Date()
    }
  ]
}

app.get('/', (req, res) => {
  res.send(database.users);
})

app.post('/signIn', (req, res) => {
  if (req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password) {
    res.json(database.users[0]);
  } else {
    res.status(400).json('error logging in');
  }
  res.send('Signing In');
})

app.post('/registration', (req, res) => {
  const { email, name, password } = req.body;
  database.users.push({
    id: '125',
    name: name,
    email: email,
/*     password: password, (We don't really want to expose the password)*/
    entries: 0,
    joined: new Date()
  })
  res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  })
  if (!found) {
    res.status(400).json('user not found');
  }
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.entries++
      return res.json(user.entries);
    }
  })
  if (!found) {
    res.status(400).json('user not found');
  }
})




app.listen(3000, () => {
  console.log('Listening on port 3000!')
})



/*
    <--- Starting Out --->
Always plan out your programs before doing more than a skeletal approach:
1) Need a route that responds with "this is working"
2) Need a signIn route that will be a POST, responds with success/fail
  The reason we're doing a POST for signIn is because we want to avoid unsecure transfer of sign-in details. We preferably want to pass it through the body, and over HTTPS so it's secure. For that we'll need a body POST.
3) Need a register that will be POST; return user object
4) At home screen need to be able to access the user's profile: profile/:userid
  GET request to receive the user object
5) Variable that counts how many times a user has submitted an image and increases a counter for them upon doing so, then checks their 'score' against other users to display a rank.
6) An image that updates the user (PUT)
7) Endpoints to create (basically directories/urls):
  /root --> res = 'Listening!'
  /signIn --> POST = success/fail
  /register --> POST = user
  /profile/:userid --> GET = user
  /image --> PUT --> user (updates their score)
7a) Creating a list of endpoints helps us (or the frontend devs) know what to expect and where to point data flows so that everything can be properly hooked up.
8) We'll test all these with POSTman
> Performing incremental steps and then checking them along the way provides feedback as to how the code is being built, and assures us that our code is working piece-by-piece, and when it doesn't we can diagnose just the piece that's most recently added and not working, rather than debugging an entire program.
*/


/*
Coding Notes:
    <--- Getting Sign-In Operational --->
1) Rather than use res.send() we'll use res.json() which comes with express, and has added functionality.
2) new Date() is a JS function that returns a date when it's executed, so it'll act like a Join Date, to let us know, that when the user first is created, they'll have a date specific for that.
3) We want:
  an id to keep track of,
  a name to display,
  email to login with,
  password to authenticate,
  and entries as our counter.
4) Need to use a JSON parser like body-parse, else express doesn't know what it's seeing, and it can't easily communicate things like our login details.
5) Since it's middleware, we need to call it after the app has been created:
  (express())
and what bodyParser() will do, is it will convert JSON for us without having to expressly stringify or convert back and forth.
6) REMEMBER: Each .post/get/put/delete has a req/res (request/response)
7) Using req.body.email === database.users[0].email && the same for password, we're requesting from the server that we want to match both email and password for their login attempt.
  7a) We're querying the database variable for the first user, however, normally we'd want to loop over the users to match any that try to sign in, not just the first. However, we'll be adding a database that does that later. As such it's not useful for us to create a JS loop when we won't use it later. We just want to make sure we have basic login functionality.
8) We use an if/else because: if it fails, we'll send a (response) res.status(400).json('error logging in')
  Which is a 400 error code, and spits out the JSON that we define.
9) However, if the login works, we'll send a res.json('success') to let us know the user was able to log in.
10) After ALL that, then we'll get a .send saying that we're signing in successfully.
11) Now that our sign-in works, we could do a for, or foreach loop that loops over our users and finds which password/email matches. That's totally fine for small lists, but with hundreds or thousands of entries that's not feasible. It's slow, unwieldy and uses too many resources. This is what we'd want a database for.


    <--- Registration --->
1) Registration, as mentioned in our outline will be a POST, so we start with:
app.post()
Place our directory and req/res: app.post('/registration', (req, res) => {})
2) This provides us with the beginnings of a registration.
3) Now, we want to get access to the users info and assign it to the body, namely the properties: name, email, and password.
4) To do this we destructure the object: const { email, name, password } = req.body
  4a) The reason this works is because it takes out the extra "drill-down" of dot notation. It tells JS that email, name, password belong to req.body, and we already have database.users that we're accessing. Which, when put together becomes:
    req.body.database.users.push.name/email/password. Rather than type all that out, we destructured it so that we can directly access the name, email, password as plain words. Our code is now cleaner and easier to read.
5) Now that it's destructured, we can create an outline to push new data into the array of users. While id is static below, we'd normally want to increment it with a loop or unique identifier.
6) To add data to the array we use .push, the array is saved in the variable database, under the object users. Using dot notation we access it like:
  database.users.push({}) - Braces are used b/c it's an object we're pushing.
Then we add in the properties of id, name, email, password, entries, and joined.
Entries & Joined don't need to be modified as they'll both be accurate on registration. Entries should be 0, and Joined will run new Date() to generate a signed-up date.
7) In order to respond, we'll use json to send the same information we just received back to postman so we can see what just was added:
  res.json(database.users[database.users.length-1])

>>> What's going on here? <<<
> We're trying to access the database.users array, and within the array we're returning the last object because .push() adds an object to the END of an array.
> Being that arrays count from 0, and .length counts from 1, doing length-1 will result in the last index in that array.
  EX: 9 items in an array = index 0 - 8 but .length = 9, so to access any of those appropriately we'd need -1 from .length so we get index = .length-1

    <--- Checking Our Work So Far --->
1) We'll change the GET request of the root to have a .send that shows us the database.users we have, so we can see all the people signed up. This will show us any new persons as well.
  On Postman we can do a GET request on the root and see the list of users!
  We can also see that by adding a new user with a POST thru Postman & submitting it, we can see the new addition as well!
2) However, we noticed that Ann wasn't there to start with. We had to do another POST to put her back. Why?
  > This is why we want to use a database. As a variable only things that are defined in the variable will be there when the server restarts. Nodemon restarts upon updates to the code to run it (like when we switched .send to look at our users). A database will store this information, and allow for updating.
> Now that we've got our checking done and understand the pain points of not using a database, we'll finish up with the last two endpoints: Profile/:id & /image.
>> Remember, an endpoint is just a location/directory/url where we tap into for data, or send it out.

    <--- Profile & Userid GET Request --->
1) All we want to do here is to get the User ID of the person logged in. This will be a GET request. We'll need to do stuff here on the frontend to populate things like their name, and stats but this will allow us an endpoint to pull that information from.
2) Because we're only exposing data to the frontend, we're looking to do a GET request, as we're only reading/looking for data.
3) Remember: using /:id for the URL allows us to put in any number there and get the ID it is associate with through the request params property. Setting it as profile/:id will allow us to type site.com/profile/72 and through the params property, we'll be able to get the ID associated (if one exists)
4) Let's first destructure id. As mentioned above, we're able to access the id through request.param shortened to req.param (we could name it blek.param if we wanted, but that's not very informative!)
5) We've been avoiding it up until now, but now we need to do a loop. We don't need to do a map, as we don't necessarily want to create a new array, we just need to check each user in the array/object user.
  > REMEMBER: forEach(param => {..}) the param stands for the item of each index. Again, we could name it whatever we want, but user is informative here.
6) database.users.forEach(user => { if (user.id === id) { res.json (user) }})
  For each item in users, we'll check if their id matches the /profile/:id in the URL. If so, we will give a response of the user.
7) Add in an else statement to handle when there is NOT a match:
else  {
        res.status(404).json('no such user');
      }
8) Now when we're checking, if there is no user, or the ID is wrong we'll have a 404 (not found code) and a json error message.
>>>ERROR FIX: Had a typo: app.get('profile/:id') was wrong. Forgot initial slash that represents the root directory. It was fixed to: app.get('/profile/:id')
9) When trying to get the last user in the list, there's an error that states 'no such user' Why?
>>> Answer: We keep looping through the ids. Using return will exit the loop upon running it. At the same time, we're submitting a header status code in the same loop. We should bring it out of the loop instead, and assign a variable to whether or not it's found.
10) Adding: let found = false; will make sure it is only triggered if the forEach loop locates an id taht matches.
11) We want it to be a let because we'll be reassigning it.
  11a) Change: found = true; if user.id === id, and return the json to stop the loop.
12) We'll need another if statement then outside of the forEach loop. This will focus on sending the status 400, and a JSON message that we can't find the user.
>> There are better ways of doing this, such as .map() or .filter() to see if we find a match, but this is used to illustrate a point.
13) Our if will be: if (!found) { res.status(400).json('not found'); }
  This states that if found (which is part of the .get but not part of the .forEach) equals to false (! meaning opposite of) then it will return a status of 400, and a json message that states 'not found'.
  The end result is that this is the same general functionality that we had before, except it's not throwing an error now. It's less performant and clean than if we were to use a .map() or .filter() method.

      <--- Last Endpoint: Image Updating the User's Count --->
1) For the most part we'll be able to copy the functionality of our last function, with some modifications. Usually, if there's repeatability we'd pull the function out, name it, and then use it therein. However, the modifications change how that code works, and I don't see how we'd be able to add that functionality without copy/paste and editing.

2) Since this is an update to existing data: (checking the user's ID, finding a match, and returning a count of entries, updating them as they add more) we make a PUT function:
app.put('/image', (req, res) => {
  const { id } = req.body;
  // NOTE: req.body is used because we can't get the params from the url!
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.entries++
  // NOTE: We want to add an iteration to the entries if the user is found.
      return res.json(user.entries);
    }
  })
  // NOTE: From here the rest of the code is the same.
})



      <--- Adding CORS, and connecting to the frontend --->
1) Firstly, we'll need to make sure both the react app and the server are on different ports. We can change the port manually, or just hit yes when we run create-react-app's npm start when it prompts us. Either works.

2) When trying to connect to each other, because we're doing a local environment and not HTTPS, the error we'll get is:
Failed to load http://localhost:3000/: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3001' is therefore not allowed access. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

  2a) This isn't an error so much as a security feature. Chrome has no idea if we're malicious or not, whether we own the webpage or not we're trying to access, so it limits our access. For this reason we'll be using npm cors to allow us to access the server. Googling the package brings us to: npmjs.com/package/cors where we can see the simple usage, as well as code snippets elsewhere to use. It's a middleware, so we'll start using it as we know how to use middleware, as app.use(cors()) once we import it. And again, as this is older JS syntax, we can't simply use import, we'll need to use const cors = require('cors')

3) Now that we've exposed the server to our frontend, we can see the database object with the contents of john and lisa inside as users.



      <--- Creating the Signin to the Frontend --->


*/
