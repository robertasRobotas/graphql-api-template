const express = require('express');
const {buildSchema} = require('graphql');
const graphqlHttp = require('express-graphql');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const initializeEnvVariables = require('./env');
const Event = require('./models/event');
const User = require('./models/user');
const bcryptjs = require('bcryptjs');
const app = express();
initializeEnvVariables();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
	schema : buildSchema(`

		type Event {
			_id:ID!
			title:String!
			description:String!
			price:Float!
			date: String
		}

		type User {
			_id:ID!
			name: String!
			email: String!
			password: String!
		}

		input EventInput {
			title:String!
			description:String!
			price:Float!
			date: String
		}

		input UserInput {
			name: String!
			email: String!
			password: String!
		}

		type RootQuery {
			events: [Event]!
			users: [User]!
		}

		type RootMutation {
			createEvent(eventInput: EventInput): Event
			createUser(userInput : UserInput): User
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
			users : ()=>{
				return User.find();
			},
			createEvent : (args)=>{
				let createdEvent;

				const event = new Event({
					title: args.eventInput.title,
					description: args.eventInput.description,
					price: args.eventInput.price,
					date: new Date().toISOString(),
					creator: '5ddf09479890456ef6173723'
				});

				return event.save().then(result =>{
					createdEvent = result;
					return User.findById('5ddf09479890456ef6173723').then((user)=>{
						if(!user){
							throw new Error('User not found');
						}
						user.createdEvents.push(event);
						return user.save();
					}).then(()=>{
						return createdEvent
					});
				})
			},
			createUser : (args)=>{

				return User.findOne({email: args.userInput.email}).then((user)=>{
					if(user){
						throw new Error("This user already exist");
					}
					return bcryptjs.hash(args.userInput.password, 12);
				}).then((hashedPassword)=>{
					const user = new User({
						name: args.userInput.name,
						email: args.userInput.email,
						password: hashedPassword
					});
					return user.save().then(result =>{
						return result
					}).catch(err=>{
						console.log(err);
					});
				}).catch(err=>{
					throw err
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





// mutation{
// 	createUser(userInput:{name: "Robertas", email: "r.ankudovicius@gmail.com", password: "myPassword"}){
// 	  name
// 	  email
// 	}
//   }