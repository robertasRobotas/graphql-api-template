const express = require('express');
const {buildSchema} = require('graphql');
const graphqlHttp = require('express-graphql');
const bodyParser = require('body-parser');
const initializeEnvVariables = require('./env');

const app = express();
initializeEnvVariables();
console.log(process.env.VARIABLE);

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
	schema : buildSchema(`
		type RootQuery {
			events: [String]!
		}

		type RootMutation {
			createEvent(name: String): String
		}

		schema {
			query: RootQuery
			mutation: RootMutation
		}

	`),
		rootValue :{
			events : ()=>{
				return ['asasas','sdsdsd','dfdfdf'];
			},
			createEvent : (args)=>{
				const eventName = args.name;
				return  eventName ;
			}
		},
		graphiql : true
	}
  ));

app.listen(process.env.PORT,()=>{console.log(`Started on ${process.env.PORT}`)});