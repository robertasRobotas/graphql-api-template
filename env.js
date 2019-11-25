 

 const initializeEnvVariables = ()=>{
     process.env.PORT =  8080;
     process.env.MONGO_USER = "";
     process.env.MONGO_LINK = "mongodb://localhost:27017/graphql-template";
     process.env.MONGO_PASSWORD = "";
 }

module.exports = initializeEnvVariables;