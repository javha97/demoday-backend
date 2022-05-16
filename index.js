import express from 'express'
import { collection, addDoc, getDocs } from "firebase/firestore";
import bodyParser from 'body-parser'
import { db } from './firebase.js'
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
const port = 3000

app.get('/', async (req, res) => {
    const docs = await getDocs(collection(db, "users"));
    docs.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
    res.send('Hello World!')
})
app.post('/', async (req, res) => {
    const { image, title, description } = req.body
    const docRef = await addDoc(collection(db, "users"), {
        image: image,
        title: title,
        description: description
    });
    res.send("Document written with ID: ");
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})