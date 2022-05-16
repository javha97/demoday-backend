import express from 'express'
import { collection, doc, addDoc, getDocs, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import bodyParser from 'body-parser'
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from './firebase.js'
import { getAuth, onAuthStateChanged } from "firebase/auth";
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
const port = 3000
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
app.post('/', isAuthenticated, errorHandler(async (req, res) => {
    const data = req.body
    console.log(data);
    const docRef = await addDoc(collection(db, "products"), req.body);
    res.status(201).send({
        id: docRef.id,
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