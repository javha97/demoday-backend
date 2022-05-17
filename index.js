import express from 'express'
import { collection, doc, addDoc, getDocs, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import bodyParser from 'body-parser'
import { getStorage, ref, deleteObject, uploadString, getDownloadURL } from "firebase/storage";
import { db } from './firebase.js'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import crypto from 'crypto'
import cors from 'cors'
import { storage } from './firebase.js';
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
const port = 8080;
app.use(cors())

const errorHandler = (fn) => {
    return async (req, res, next) => {
        try {
            return await fn(req, res, next)
        } catch (e) {
            next()
        }
    }
}
const isAuthenticated = async (req, res, next) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log(user);
            next()
        } else {
            return res.send('lmao')
        }
    });

}
app.get('/', errorHandler(async (req, res) => {
    const docs = await getDocs(collection(db, "products"));
    let arr = []
    docs.forEach((doc) => {
        arr.push({ id: doc.id, ...doc.data() })
    });
    res.status(200).send(arr)
}))
app.post('/', errorHandler(async (req, res) => {
    const data = req.body
    const { img } = req.body.body
    let arr = []
    for (let i = 0; i < img.length; i++) {
        const id = crypto.randomBytes(16).toString("hex");
        const fixedbase64 = img[i].split(/,(.+)/)[1]
        const storageRef = ref(storage, id);
        uploadString(storageRef, fixedbase64, 'base64').then((snapshot) => {
            console.log('Uploaded a base64 string!');
        });
        const url = await getDownloadURL(storageRef)
        arr.push(url)
    }
    // const tempObj = {...req.body.body, title: ""}
    const docRef = await addDoc(collection(db, "products"), {
        image: arr,
        ...req.body.body
    });
    res.status(201).send({
        id: docRef.id,
        image: arr,
        ...data
    });
}))
app.delete('/', isAuthenticated, errorHandler(async (req, res) => {
    const { id, imgUrl } = req.query
    await deleteDoc(doc(db, "products", id))
    if (imgUrl) {
        const storage = getStorage();
        const desertRef = ref(storage, `images/${imgUrl}.jpg`);
        deleteObject(desertRef).then(() => {
            return res.send('deleted')
        }).catch((error) => {
            return res.send('failed to delete')
        });
    }
    res.send("deleted")
}))
app.patch('/', isAuthenticated, errorHandler(async (req, res) => {
    const data = req.body
    await setDoc(doc(db, "products", req.body.id), data, { merge: true })
    const editedDoc = await getDoc(doc(db, "products", req.body.id))
    res.status(200).send({
        id: editedDoc.id,
        ...editedDoc.data()
    })
}))
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})