import { collection, doc, addDoc, getDocs, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { errorHandler } from '../helperFunctions/helperFunctions.js';
import { db } from '../firebase.js'
import { imgConverter } from '../helperFunctions/imageConverter.js'
export const getProducts = errorHandler(async (req, res) => {
    const docs = await getDocs(collection(db, "products"));
    let arr = []
    docs.forEach((doc) => {
        arr.push({ id: doc.id, ...doc.data() })
    });
    res.status(200).send(arr)
})
export const createProduct = errorHandler(async (req, res) => {
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
})
export const deleteProduct = errorHandler(async (req, res, next) => {
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
})
export const updateProduct = errorHandler(async (req, res) => {
    const { images } = req.body.body
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
})
export const productDetail = errorHandler(async (req, res) => {
    const id = req.params.id
    const docs = await getDoc(doc(db, "products", id));
    res.status(200).send({
        id: docs.id,
        ...docs.data()
    })
})