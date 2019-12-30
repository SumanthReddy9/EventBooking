const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const user = async userId => {
    try{
        const user = await User.findById(userId)
        return {
            ...user._doc,
            _id: userId,
            createdEvents: events.bind(this, user._doc.createdEvents)
        } 
    }
    catch(err) {
        throw err;
    }
}

const events = async eventIds => {
    try{
        const events  =  await Event.find({_id: {$in: eventIds}});
        events.map(event => {
            return {...event._doc, 
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event.creator)};
        });
        //console.log(events);
        return events;
    }
    catch(err){
        throw err;
    }
}

module.exports = {
    events: async () => {
        try{
            const events = await Event.find()

            return events.map(event => {
                return {...event._doc,
                            _id: event._doc._id.toString(),
                            date: new Date(event._doc.date).toISOString(), 
                            creator: user.bind(this,event._doc.creator)};
            });
            //console.log(events);
            //return events;
        }
        catch(err){
            console.log(err);
            throw err;
        }
    },
    createEvent: args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: args.eventInput.date,
            creator: '5e05f1fe2c387783041b28a3'
        });
        let createdEvent;
        return event.save()
        .then(result => {
            createdEvent =  {...result._doc, 
                            _id: result._doc._id.toString(),
                            creator: user.bind(this, result._doc.creator)};
            return User.findById('5e05f1fe2c387783041b28a3');
            console.log(result);
        })
        .then(user => {
            if(!user){
                throw new Error("User doesn't exist");
            }
            user.createdEvents.push(event);
            return user.save();
        })
        .then(result => {
            return createdEvent;
        })
        .catch(err => {
            console.log("Error is " + err);
            throw err;
        })
    },
    createUser: args => {
        return User.findOne({email: args.userInput.email}).then(user => {
            if(user){
                throw new Error('User exists already');
            }
            return bcrypt.hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
            const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            return {...result._doc, password: null, _id: result.id}
        })
        .catch(err => {
            throw err
        });
    }
}