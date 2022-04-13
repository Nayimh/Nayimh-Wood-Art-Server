const express = require("express");

const app = express();

const cors = require("cors");

const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const res = require("express/lib/response");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cetyr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('WoodArt');

        const furnitureCollection = database.collection('furniture');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // Furnitures section
        // post 
        app.post('/furniture', async (req, res) => {
            const cursor = req.body;
            const result = await furnitureCollection.insertOne(cursor);
            res.send(result);
        })

        // get 
        app.get('/furniture', async (req, res) => {
            const cursor = furnitureCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // get by id
        app.get('/furniture/:id', async (req, res) => {
            const furnitureId = req.params.id;
            const query = { _id: ObjectId(furnitureId) };
            const furniture = await furnitureCollection.findOne(query);
            res.send(furniture);
        })

        // update 
        app.put('/furniture/:id', async (req, res) => {
            const id = req.params.id;
            const updateFurniture = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateDoc = {
                $set: {
                    furnitureName: updateFurniture?.name,
                    description: updateFurniture?.desc,
                    furnitureImage: updateFurniture?.img,
                    madeBy: updateFurniture?.by,
                    furniturePrice: updateFurniture?.price

                },
            };
            const result = await furnitureCollection.updateOne(filter, option, updateDoc);
            res.json(result);
        })

        // delete
        app.delete('/furniture/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteFurniture = await furnitureCollection.deleteOne(query);
            res.json(deleteFurniture);
        })

        // Order section
        // post order
        app.post('/orders', async (req, res) => {
            const cursor = req.body;
            const result = await orderCollection.insertOne(cursor);
            res.json(result);
        })

        // get order
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // get by email
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const singleOrder = orderCollection.find({});
            const order = await singleOrder.toArray();
            const customerOrder =  order.filter(
                (mail) = (mail?.email === email)
            );
            res.json(customerOrder);
        });

        // get by id
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await orderCollection.findOne(query);
            res.json(product);
        })

        // delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
            
        })

        // update Order
        app.put('/orders/:id', async (req, res) => {
            const statusId = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(statusId) };
            const option = { upsert: true };
            const updateOrder = {
                $set: {
                    status: updateStatus.status
                },
            };
            const accepOrder = await orderCollection.updateOne(filter, updateOrder, option);
            res.json(accepOrder);
        })


        // reviews section
        // post ratings
        
        app.post('/ratings', async (req, res) =>{
            const cursor = req.body;
            const result = await reviewCollection.insertOne(cursor);
            res.json(result);
        })

        // get rating

        app.get('/ratings', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        //get by email 
        app.get('/ratings/:email', async (req, res) => {
            const email = req.params.email;
            const personRating = reviewCollection.find({});
            const ratings = await personRating.toArray();
            const userRatings = ratings.filter(mail => (mail?.email === email));
            res.json(userRatings);
        })

        //get by id
        app.get('/ratings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const ratings = await reviewCollection.findOne(query);
            res.json(ratings);
        })


        //delete ratings
        app.delete('/ratings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id : ObjectId(id) };
            const deleteRating = await reviewCollection.deleteOne(query);
            res.json(deleteRating);
        })


        // userSection
        // post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // get user 
        app.get('/users', async (req, res) => {
            const cursor = await usersCollection.find({}).toArray();
            res.json(cursor);
        })

        // upsert user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user?.email };
            const option = { upsert: true };
            const updateUser = { $set: user };
            const result = await usersCollection.updateOne(filter, updateUser, option);
            res.json(result);
        })

        // make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user?.email };
            const updateUser = {
                $set: {
                    role: "admin"
                }
            };
            const result = await usersCollection.updateOne(filter, updateUser);
            res.json(result);
        })

        //admin filter by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })





    }

    finally {
        // await client.close();
    }
    
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send("Wood-Art server running successfully..");
})


app.listen(port, () => {
    console.log('listning to port', port)
})

