const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql')
const mongoose = require('mongoose');

const Event = require('./models/event')
const app = express();
app.use(bodyParser.json())

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String! 
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }

    `),

    rootValue: {
        events: () => {
            return Event.find({title: 'Sumanth'}).then(events => {
                return events.map(event => {
                    return {...event._doc, _id: event._doc._id.toString()};
                });
            }).catch(err => {
                console.log(err);
                throw err;
            })
        },
        createEvent: args => {
            // const event = {
            //     _id: Math.random().toString(),
            //     title: args.eventInput.title,
            //     description: args.eventInput.description,
            //     price: +args.eventInput.price,
            //     date: args.eventInput.date
            // };

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: args.eventInput.date
            });
            return event.save().then(result => {console.log(result);
            return {...result._doc};
            })
            .catch(err => {console.log("Error is " + err);
            throw err;
            });
        }
    },

    graphiql: true
}));

mongoose.connect('mongodb://localhost:27017/EventsDataBase')

app.listen(7000, () => {
    console.log("Server is listening on port 7000")
});

