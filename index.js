const express = require('express');
const {buildSchema} = require('graphql');
const graphqlHttp = require('express-graphql');
const bodyParser = require('body-parser');
const initializeEnvVariables = require('./env');

const app = express();
initializeEnvVariables();
console.log(process.env.VARIABLE);

app.use(bodyParser.json());

const events = [];

app.use('/graphql', graphqlHttp({
	schema : buildSchema(`

		type Event {
			_id:ID!
			title:String!
			description:String!
			price:Float!
			date: String
		}

		input EventInput {
			title:String!
			description:String!
			price:Float!
			date: String
		}

		type RootQuery {
			events: [Event]!
		}

		type RootMutation {
			createEvent(eventInput: EventInput): Event
		}

		schema {
			query: RootQuery
			mutation: RootMutation
		}

	`),
		rootValue :{
			events : ()=>{
				return events;
			},
			createEvent : (args)=>{
				const event = {
					_id: Math.random().toString(),
					title: args.eventInput.title,
					name: args.eventInput.name,
					price: args.eventInput.price,
					date: new Date().toISOString()
				}
				console.log(args)
				events.push(event);
				return  event ;
			}
		},
		graphiql : true
	}
  ));

app.listen(process.env.PORT,()=>{console.log(`Started on ${process.env.PORT}`)});





// mutation{
// 	createEvent(eventInput:{title: "Sky Park PArty", description: "Cool pae\rtyyy", price: 12.32}) {
// 	  date
// 	  title
// 	}
//   }