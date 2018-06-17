const express 		= require("express");
const helmet 		= require("helmet");
const session		= require("express-session");
const app 			= express();
const bodyParser 	= require("body-parser");
const config 		= require("./config");

app.set("trust proxy", true);

const knex = require("knex")({
	client: 'mysql',
	connection: config.db
});

const knexSession = require("connect-session-knex")(session);
const knexSessionStore = new knexSession({ knex: knex });

// USED TO PARSE JSON
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(helmet());

app.use(session({
	secret: config.session.secret,
	name: config.session.name,
	resave: false,
	saveUninitialized: true,
	store: knexSessionStore
}));


const { Model } = require("objection");
Model.knex(knex);



// Routes
const accountRoutes = require("./routes/accounts");
app.use("/account", accountRoutes);


app.listen(3000, () => {
	console.log("Listening on port 3000");
});
