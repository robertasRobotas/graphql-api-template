const express = require('express');
const {buildSchema} = require('graphql');
const graphqlHttp = require('express-graphql');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const initializeEnvVariables = require('./env');
const Event = require('./models/event');

const app = express();
initializeEnvVariables();

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
				return Event.find();
			},
			createEvent : (args)=>{
				const event = new Event({
					title: args.eventInput.title,
					description: args.eventInput.description,
					price: args.eventInput.price,
					date: new Date().toISOString()
				});
				return event.save().then(result =>{
					return result
				}).catch(err=>{
					console.log(err);
				});
			}
		},
		graphiql : true
	}
  ));

  mongoose.connect( process.env.MONGO_LINK).then(()=>{
	app.listen(process.env.PORT,()=>{console.log(`---STARTED ON ${process.env.PORT}---`)})
  });







// mutation{
// 	createEvent(eventInput:{title: "Sky Park PArty", description: "Cool pae\rtyyy", price: 12.32}) {
// 	  date
// 	  title
// 	}
//   }