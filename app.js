const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const app = express();

class Link {
    constructor(link, hash) {
        this.link = link;
        this.hash = hash;
    }
}

const getHash = (length = 10) => {
    const symbols = 'qwertyuiopaasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
    let hash = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * (symbols.length + 1));
        hash += symbols[randomIndex];
    }
    return hash;
}

const uri = "mongodb+srv://vlad:222333@cluster0.iuyri.mongodb.net/test-projects?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

(async () => {
    try {
        await mongoClient.connect();
        app.locals.collection = mongoClient.db("shorterLink").collection("links");
        await app.listen(3000);
        console.log("Сервер ожидает подключения...");
    } catch (err) {
        return console.log(err);
    }
})();

app.get("/api/generateLink", async (req, res) => {
    const collection = req.app.locals.collection;
    const linkUrl = req.query.link;
    const linkHash = getHash();
    const linkData = new Link(linkUrl, linkHash);
    try {
        await collection.insertOne(linkData);
        res.send({linkHash});
    } catch (err) {
        console.log(err);
        res.status(500).send({error: 'Something failed!'});
    }
});

app.get("/api/redirectLink", async (req, res) => {
    const collection = req.app.locals.collection;
    const linkHash = req.query.hash;
    try {
        const linkData = await collection.findOne({hash: linkHash});
        res.send({link: linkData.link});
    } catch (err) {
        console.log(err);
        res.status(500).send({error: 'Something failed!'});
    }
});
