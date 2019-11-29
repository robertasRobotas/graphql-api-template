const Event = require('../models/event');
const User = require('../models/user');
const bcryptjs = require('bcryptjs');

	const findUser = async(userId) =>{
        const user = await User.findOne({_id: userId});
                const createdEvents = await findEvents(user.createdEvents);
                const response = {...user._doc, createdEvents: createdEvents};
                return response
    }
    
    const findEvents = async(eventsId) =>{
        const events = await Event.find({_id : {$in : eventsId}});
            return events.map((event)=>{
                return event 
            });
    }


const resolver = {
    events : async()=>{
        const events = await Event.find();
        return events.map(async(event)=>{
            let creator = await findUser(event.creator);
            let response = {...event._doc, creator: creator};
            return response
            })
        return eventsArray;
    },
    users : ()=>{
        return User.find().populate('createdEvents');
    },
    createEvent : (args)=>{
        let createdEvent;

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date().toISOString(),
            creator: '5de04a8e43a81a0c7a3e3d5c'
        });

        return event.save().then(result =>{
            createdEvent = result;
            return User.findById('5de04a8e43a81a0c7a3e3d5c').then((user)=>{
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
}

module.exports = resolver;