
const express = require("express");
const bodyParser = require("body-parser");

const users = require("./routes/users");
const posts = require("./routes/posts");

const error = require("./utilities/error");

const app = express();
const port = 3000;

// Parsing Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// Logging Middlewaare
app.use((req, res, next) => {
  const time = new Date();

  console.log(
    `-----
${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
  );
  if (Object.keys(req.body).length > 0) {
    console.log("Containing the data:");
    console.log(`${JSON.stringify(req.body)}`);
  }
  next();
});

// Valid API Keys.
apiKeys = ["perscholas", "ps-example", "hJAsknw-L198sAJD-l3kasx"];

// New middleware to check for API keys!
// Note that if the key is not verified,
// we do not call next(); this is the end.
// This is why we attached the /api/ prefix
// to our routing at the beginning!
app.use("/api", function (req, res, next) {
  var key = req.query["api-key"];

  // Check for the absence of a key.
  if (!key) next(error(400, "API Key Required"));

  // Check for key validity.
  if (apiKeys.indexOf(key) === -1) next(error(401, "Invalid API Key"));

  // Valid key! Store it in req.key for route access.
  req.key = key;
  next();
});

// Use our Routes
app.use("/api/users", users);
app.use("/api/posts", posts);

// Adding some HATEOAS links.
app.get("/", (req, res) => {
  res.json({
    links: [
      {
        href: "/api",
        rel: "api",
        type: "GET",
      },
    ],
  });
});

// Adding some HATEOAS links.
app.get("/api", (req, res) => {
  res.json({
    links: [
      {
        href: "api/users",
        rel: "users",
        type: "GET",
      },
      {
        href: "api/users",
        rel: "users",
        type: "POST",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "GET",
      },
      {
        href: "api/posts",
        rel: "posts",
        type: "POST",
      },
    ],
  });
});

// 404 Middleware
app.use((req, res, next) => {
  next(error(404, "Resource Not Found"));
});

// Error-handling middleware.
// Any call to next() that includes an
// Error() will skip regular middleware and
// only be processed by error-handling middleware.
// This changes our error handling throughout the application,
// but allows us to change the processing of ALL errors
// at once in a single location, which is important for
// scalability and maintainability.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}.`);
});

// GET /api/users/:id/posts
app.get('/api/users/:id/posts', (req, res) => {
  const userId = parseInt(req.params.id);
  const userPosts = posts.filter(post => post.userId );
  res.json(userPosts);
});

// Get /api/posts?userId=<VALUE>
app.get('/api/posts', (req, res) => {
  const userId = parseInt(req.query.userId);
  if (isNAN(userId)) {
    return res.status(400).json({message: 'Invalid userId parameter '});
  }
  const userPosts = posts.filter(post => post.userId === userId);
  res.json(userPosts);
});

// Get / comments
app.get('/comments', (req, res) => {
  res.json(comments);
});

//POST /comments
// When creating a new comment object, it should have the following fields:
// id: a unique identifier.
// userId: the id of the user that created the comment.
// postId: the id of the post the comment was made on.
// body: the text of the comment.

//POST / comments
app.post('/comments', (req, res) => {
    const {userId, postId, body } = req.body ;

    // validate input
    if (!userId || !postId || !body) {
      return res.status(400).json({message: 'Missing require fields'});
    }

    // generate unique ID for comment
    const id = comment.length ? comments[comments.length - 1].id + 1 : 1;

    // create new comment object
    const newComment = {
      id,
      userId,
      postId,
      body,
    }

    // add the new comment to comments array
    comment.push(newComment);

    // return the server
    res.status(201).json(newComment);

});

// GET /comments/:id
app.get('/comments/:id', (req,res) => {
  const commentId = parseInt(req.params.id);
  const comment = comments.find(c => c.id === commentId);
  if (!comment) {
     return res.status(404).json({ message: 'Comment not found'});
  }
  res.json(comment);
});

//PATCH /comments/:id
//Used to update a comment with the specified id with a new body.

// PATCH / comments/:id
app.patch('/comments/:id', (req,res) => {
  const commentId = parseInt(req.params.id);
  const {body} = req.body;

  // validate input
  if (!body) {
    return res.status(400).json({message: 'Missing required fields' });
  }

  // find the comment
  const comment = comments.find(c => c.id === commentId);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  //update the comments body
  comment.body = body;

  // return the updated comment
  res.json(comment);
});

//DELETE /comments/:id
//Used to delete a comment with the specified id.
 app.delete('/comments/:id', (req,res) => {
  const commentId = parseInt(req.params.id);

  // find the index of the comment
  const commentIndex = comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  // remove the comment from the array
    comments.splice(commentIndex, 1);

  // return a success message
  res.json({ message: 'Comment deleted successfully'});
 });

 //GET /comments?userId=<VALUE>
//Retrieves comments by the user with the specified userId.
app.get('/comments', (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!isNAN(userId)) {
    const userComments = comments.filter(comment => comment.userId === userId);
    return res.json(userComments);
  }
  res.json(comments);
});

//GET /posts/:id/comments
//Retrieves all comments made on the post with the specified id.
app.get('/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNAN(postId)) {
    return res.status(400).json({ message: 'Invalid postId parameter' });
  }
  const postComments = comments.filter(comment => comment.postId === postId);
  res.json(postComments);
});

// GET /users/:id/comments
//Retrieves comments made by the user with the specified id.
app.get('/users/:id/comments', (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNAN(userId)) {
    return res.status(400).json({ message: 'Invalid useId parameter' });
  }
  const userComments = comments.filter(comment => comment.userId === userId);
  res.json(userComments);
});

//GET /posts/:id/comments?userId=<VALUE>
//Retrieves all comments made on the post with the specified id by a user with the specified userId.
app.get('/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = parseInt(req.query.userId);

  if(isNAN(postId)) {
    return res.status(400).json({ message: 'Invalid postId parameter' });
  }
  if(isNAN(userId)) {
    return res.status(400).json({ message: 'Invalid userId parameter'});
  }
  const postComments = comments.filter(comment => comment.postId === postId && comment.userId === userId);
  res.json(postComments);
});

// GET /users/:id/comments?postId=<VALUE>
//Retrieves comments made by the user with the specified id on the post with the specified postId.
app.get('/users/:id/comments', (req, res) => {
  const userId = parseInt(req.params.id);
  const postId = parseInt(req.query.postId);

  if (isNAN(userId)) {
    return res.status(400).json({ message: 'Invalid userId parameter'});
  }
  if (isNAN(postId)) {
    return res.status(400).json({ message: 'Invalid postId parameter'});
  }
  const userComments = comments.filter(comment => comment.userId === userId && comment.postId === postId);
  res.json(userComments);
})