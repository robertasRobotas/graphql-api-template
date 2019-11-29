const express = require('express');
const graphqlSchema = require('./schema');
const graphqlResolver = require('./resolver');
const graphqlHttp = require('express-graphql');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const initializeEnvVariables = require('./env');
const app = express();
initializeEnvVariables();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
		schema :graphqlSchema,
		rootValue :graphqlResolver,
		graphiql :true
	}
  ));

  mongoose.connect( process.env.MONGO_LINK,{ useUnifiedTopology: true }).then(()=>{
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