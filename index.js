import express from 'express'
import { collection, doc, addDoc, getDocs, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import bodyParser from 'body-parser'
import { getStorage, ref, deleteObject, uploadString, getDownloadURL } from "firebase/storage";
import { db } from './firebase.js'
import crypto from 'crypto'
import cors from 'cors'
import { storage } from './firebase.js';
import { isAuthenticated, errorHandler } from './helperFunctions.js';
const app = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
const port = 8080;
app.use(cors())
//// get all products
app.get('/', errorHandler(async (req, res) => {
    const docs = await getDocs(collection(db, "products"));
    let arr = []
    docs.forEach((doc) => {
        arr.push({ id: doc.id, ...doc.data() })
    });
    res.status(200).send(arr)
}))
    ////create product
    .post('/', isAuthenticated, errorHandler(async (req, res) => {
        const data = req.body
        const { img } = req.body.body
        const array = img.split(',')
        let arr = []
        for (let i = 0; i < array.length; i++) {
            const id = crypto.randomBytes(16).toString("hex");
            // const fixedbase64 = array[i].split(/,(.+)/)[1]
            const storageRef = ref(storage, id);
            await uploadString(storageRef, array[i], 'base64')
            const url = await getDownloadURL(storageRef)
            arr.push({ imgName: id, imgUrl: url })
        }
        const docRef = await addDoc(collection(db, "products"), {
            ...req.body.body,
            img: arr
        });
        res.status(201).send({
            ...data.body,
            id: docRef.id,
            img: arr
        });
    }))
    //// delete product
    .delete('/:id', isAuthenticated, errorHandler(async (req, res) => {
        const id = req.params.id
        const mydoc = await getDoc(doc(db, "products", id))
        if (mydoc.exists()) {
            console.log("Document data:", mydoc.data().img);
            mydoc.data().img.map((el) => {
                const storage = getStorage();
                const desertRef = ref(storage, `${el.imgName}`);
                (async () => {
                    try {
                        await deleteObject(desertRef)
                    } catch (e) {
                        console.log(e);
                    }
                })()
            })
        }
        await deleteDoc(doc(db, "products", id))
        res.status(200).send('deleted successfully')
    }))
    ////update product
    .patch('/:id', isAuthenticated, errorHandler(async (req, res) => {
        const { images, title, description } = req.body
        const id = req.params.id
        if (images !== undefined) {
            const myArr = JSON.parse(images);
            myArr.map(async (el) => {
                const storageRef = ref(storage, el.imgName);
                await uploadString(storageRef, imgUrl, 'base64')
                const url = await getDownloadURL(storageRef)
                const mydoc = await getDoc(doc(db, "products", id))
                mydoc.data().img.map((element) => {
                    if (element.imgName === el.imgName) {
                        element.imgUrl = url
                    }
                })
            })
        }
        if (title !== undefined) {
            await setDoc(doc(db, "products", id), {
                title: title,
            }, { merge: true })
        }
        if (description !== undefined) {
            await setDoc(doc(db, "products", id), {
                description: description,
            }, { merge: true })
        }
        const editedDoc = await getDoc(doc(db, "products", id))
        res.status(200).send({
            id: editedDoc.id,
            ...editedDoc.data()
        })
    }))
    ////specific product detail
    .get('/:id', isAuthenticated, errorHandler(async (req, res) => {
        const id = req.params.id
        const docs = await getDoc(doc(db, "products", id));
        res.status(200).send({
            id: docs.id,
            ...docs.data()
        })
    }))
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})