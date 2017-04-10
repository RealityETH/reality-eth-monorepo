var DefaultBuilder = require("truffle-default-builder");

module.exports = {
  build: new DefaultBuilder({
    "index.html": "index.html",
    "index.js": [
      "javascripts/index.js"
    ],
    "app.js": [
      "javascripts/app.js"
    ],
    "ask.js": [
      "javascripts/ask.js"
    ],
    "answer.js": [
      "javascripts/answer.js"
    ],
    "question.js": [
      "javascripts/question.js"
    ],
    "jquery-3.1.1.min.js": [
      "javascripts/jquery-3.1.1.min.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
  }),
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    }
  }
};
