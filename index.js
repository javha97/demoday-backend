import express from 'express'
import { collection, doc, addDoc, getDocs, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import bodyParser from 'body-parser'
import { getStorage, ref, deleteObject, uploadString, getDownloadURL } from "firebase/storage";
import { db } from './firebase.js'
import cors from 'cors'
import { storage } from './firebase.js';
import { isAuthenticated, errorHandler } from './helperFunctions.js';
import { imgConverter } from './imageConverter.js'
const app = express()
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(express.json())
const port = 8080;
app.use(cors())
/////get news
app.get('/news', async (req, res) => {
    const docs = await getDocs(collection(db, "news"))
    let arr = []
    docs.forEach((doc) => {
        arr.push({ id: doc.id, ...doc.data() })
    })
    res.status(200).send(arr)
})
app.post('/news', errorHandler(async (req, res) => {
    const { img } = req.body.body
    const { url, id } = await imgConverter(img)
    const docRef = await addDoc(collection(db, "news"), {
        ...req.body.body,
        img: url,
        imgName: id
    })
    res.status(200).send({
        ...req.body.body,
        id: docRef.id,
        img: url
    })
}))
///delete news
app.delete('/news/:id', errorHandler(async (req, res, next) => {
    const { imgName } = req.body
    if (imgName !== undefined) {
        const storage = getStorage();
        const desertRef = ref(storage, `${imgName}`);
        (async () => {
            try {
                await deleteObject(desertRef)
            } catch (e) {
                console.log(e);
                next()
            }
        })()
    }
    await deleteDoc(doc(db, "news", req.params.id))
    res.status(200).send("deleted successfully")
}))
///edit news
app.patch('/news/:id', errorHandler(async (req, res) => {
    const id = req.params.id
    const { imgName, img } = req.body.body
    const storageRef = ref(storage, imgName);
    await uploadString(storageRef, img, 'base64')
    const url = await getDownloadURL(storageRef)
    await setDoc(doc(db, 'news', id), {
        ...req.body.body,
        img: url
    }, { merge: true })
    const mydoc = await getDoc(doc(db, "news", id))
    res.status(200).send({
        ...mydoc.data()
    })
}))
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
    .post('/', errorHandler(async (req, res) => {
        const { img } = req.body.body
        const array = img.split(',')
        let arr = []
        for (let i = 0; i < array.length; i++) {
            const { url, id } = await imgConverter(array[i])
            arr.push({ imgName: id, imgUrl: url })
        }
        const docRef = await addDoc(collection(db, "products"), {
            ...req.body.body,
            img: arr
        });
        res.status(201).send({
            ...req.body.body,
            id: docRef.id,
            img: arr
        });
    }))
    //// delete product
    .delete('/:id', isAuthenticated, errorHandler(async (req, res, next) => {
        const id = req.params.id
        const mydoc = await getDoc(doc(db, "products", id))
        if (mydoc.exists()) {
            mydoc.data().img.map((el) => {
                const storage = getStorage();
                const desertRef = ref(storage, `${el.imgName}`);
                (async () => {
                    try {
                        await deleteObject(desertRef)
                    } catch (e) {
                        console.log(e);
                        next()
                    }
                })()
            })
        }
        await deleteDoc(doc(db, "products", id))
        res.status(200).send('deleted successfully')
    }))
    ////update product
    .patch('/:id', errorHandler(async (req, res) => {
        const { images, title, description } = req.body.body
        let arr = []
        const myid = req.params.id
        if (images !== undefined) {
            const myArr = JSON.parse(images);
            const docs = await getDoc(doc(db, "products", myid))
            let promise = new Promise((respond, rej) => {
                myArr.map(async (el) => {
                    const { url } = await imgConverter(el.img, el.imgName)
                    docs.data().img.map(async (doc) => {
                        if (doc.imgName === el.imgName) {
                            doc.imgUrl = url
                        }
                        arr.push({ imgName: doc.imgName, imgUrl: doc.imgUrl })
                    })
                    respond(arr)
                })
            })
            const imgupdate = await promise
            await setDoc(doc(db, "products", myid), {
                img: imgupdate
            }, { merge: true })
        }
        await setDoc(doc(db, "products", myid), {
            ...req.body.body
        }, { merge: true })
        const editedDoc = await getDoc(doc(db, "products", myid))
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