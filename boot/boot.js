"use strict";

const Autoload = require("fastify-autoload");
const path = require("path");

module.exports = function(fastify, opts, next) {
  /*
| Http server
| -----------
|
| Bootstrap fastify in Fastode - OOB plugins. 
|
*/

  // Standard errors and other useful utilities
  fastify
    .register(require("fastify-sensible"))
    .register(require("fastify-helmet"));
  // .register(require("fastify-jwt"), {
  //   secret: opts.auth ? opts.auth.secret : fastify.config["APP_KEY"]
  // })
  // .ready(err => console.log("HWTTT ", fastify.jwt));

  fastify
    .register(require("fastify-static"), {
      root: path.join(path.dirname(require.main.filename), "public"),
      prefix: "/public/"
    })
    .register(require("fastify-cors"), fastify["corsconfig"])
    .register(Autoload, {
      dir: path.join(__dirname, "../", "plugins"),
      options: Object.assign({}, opts)
    });

  /*
  
   * Register ORM.
   * knex is used by default. You can disable knex through DISABLE_PLUGIN env parameter
   * and use any ORM through the fastify plugin framework
   */
  // const dbOptions = fastify["dbconfig"];
  fastify.register(
    require("fastify-knexjs"),
    fastify["dbconfig"][process.env.DB_CONNECTION],
    err => fastify.log.error(err)
  );

  /*
   * Register custom plugins.
   * Just drop your plugins in <root>/plugins folder.
   * Set DISABLE_PLUGIN env parameter if you want to disable any fastode provided plugin
   */
  // console.log("registering plugins", path.join(__dirname, "../", "plugins"));
  // fastify.register(Autoload, {
  //   dir: path.join(__dirname, "../", "plugins"),
  //   options: Object.assign({}, opts)
  // });

  next();
};
