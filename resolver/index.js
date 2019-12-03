const Event = require('../models/event');
const User = require('../models/user');
const Booking = require('../models/booking');
const bcryptjs = require('bcryptjs');

	const findUser = async(userId) =>{
                try{
                const user = await User.findOne({_id: userId});
                const createdEvents = await findEvents(user.createdEvents);
                const response = {...user._doc, createdEvents: createdEvents};
                return response
                }catch(err){
                    console.log(err);
                }
  
    }
    
    const findEvents = async(eventsId) =>{
        const events = await Event.find({_id : {$in : eventsId}});
            return events.map((event)=>{
                return event 
            });
    }

    const findOneEvent = async(eventId) =>{
        try{
        const event = await Event.findOne({_id : eventId});
        return {...event._doc,
                   creator : await findUser(event.creator)}
           } catch(err){
        throw err;
        }
    }


const resolver = {
    events : async()=>{
        const events = await Event.find();
        return events.map(async(event)=>{
            let creator = await findUser(event.creator);
            let response = {...event._doc, creator: creator};
            return response
            })
    },
    users : ()=>{
        return User.find().populate('createdEvents');
    },
    bookings : async()=>{
        try{
            const bookings = await Booking.find();
            return bookings.map( async booking =>{
                return {...booking._doc,
                        id: booking.id,
                        user: await findUser(booking.user),
                        event: await findOneEvent(booking.event),
                        createdAt: new Date(booking._doc.createdAt).toISOString(),
                        updatedAt: new Date(booking._doc.updatedAt).toISOString()
                    }
            });
        }catch(err){
            throw err;
        }
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
    },
    bookEvent: async (args)=>{
        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const fetchedUser = await findUser("5de04a8e43a81a0c7a3e3d5c");
        const booking = new Booking({
            user: fetchedUser,
            event : fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            user: fetchedUser,
            event: findOneEvent(result.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
             }
    },
    cancelBookEvent: async (args)=>{
        try{
            
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {...booking.event._doc, _id: booking.event._id, creator: await findUser(booking.event.creator) }
            await Booking.deleteOne({_id:args.bookingId});
            return event;
        }catch(err){
            throw(err);
        }
    }
}

module.exports = resolver;