const fp = require("fastify-plugin");

module.exports = fp(function(fastify, opts, next) {
  console.log("registering auth plugin");

  fastify
    .register(require("fastify-jwt"), {
      secret: opts.auth ? opts.auth.secret : fastify.config["APP_KEY"]
    })
    .decorate("authenticate", async function(request, reply) {
      try {
        // const tokenFromRequest = request.cookies.jwt
        await request.jwtVerify();

        console.log("authenticating", request.jwtVerify());
      } catch (err) {
        console.error("jwtVerify Error: ", err);
        reply.send(err);
      }
    });
  next();
});
