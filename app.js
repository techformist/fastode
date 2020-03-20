"use strict";

const Autoload = require("fastify-autoload");
const path = require("path");

module.exports = function(fastify, opts, next) {
  /*
  | Your custom boot-time code goes in `app/my-boot.js`.
  | You can use that to do custom plugin registrations, or 
  | whatever catches your fancy.
  | 
  */

  /*
  | Load a bunch of pre-decided plugins from plugins directory.
  | Plugins can be used throughout your app.
  |
  |
  */

  // Load Dotenv - preferably at the very beginning
  const fastifyEnv = require("fastify-env");
  const schema = {
    type: "object",
    required: ["PORT"],
    properties: {
      PORT: {
        type: "string",
        default: 3000
      }
    }
  };

  fastify
    .register(fastifyEnv, {
      schema: schema,
      dotenv: true
    })
    .ready(err => {
      if (err) console.error(err);
    });

  // Standard errors and other useful utilities
  fastify.register(require("fastify-sensible"));

  /*
  | Register custom plugins.
  | Just drop your plugins in <root>/plugins folder.
  | Set DISABLE_PLUGIN env parameter if you want to disable any fastode provided plugin
  */
  fastify.register(Autoload, {
    dir: path.join(__dirname, "/../", "plugins"),
    options: Object.assign({}, opts)
  });

  /*
  | Register ORM.
  | knex is used by default. You can disable knex through DISABLE_PLUGIN env parameter
  | and use any ORM through the fastify plugin framework
  */
  const dbOptions = require(path.join(__dirname, "/../config/db.js"))();
  fastify.register(
    require("fastify-knexjs"),
    dbOptions[process.env.DB_CONNECTION],
    err => fastify.log.error(err)
  );

  /*
  | Serve static files
  |
  */

  fastify.register(require("fastify-static"), {
    root: path.join(__dirname, "public"),
    prefix: "/public/"
  });

  /*
  | Enable CORS
  |
  */
  const corsOptions = require(path.join(__dirname, "/../config/cors.js"))();
  fastify.register(require("fastify-cors"), corsOptions);

  /*
  | Load services - register fastify plugins that make up your app.
  */
  fastify.register(Autoload, {
    dir: path.join(__dirname, "/../app/", "services"),
    options: Object.assign({}, opts)
  });

  /*
  | Access URL data (incl. queries)
  */

  fastify.register(require("fastify-url-data"), err => {
    if (err) fastify.log.error(err);
  });

  /*
  | Call next at the last
  */
  next();
};
