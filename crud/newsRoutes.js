import { collection, doc, addDoc, getDocs, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { db } from '../firebase.js'
import { errorHandler } from '../helperFunctions/helperFunctions.js';
import { imgConverter } from '../helperFunctions/imageConverter.js'
export const getNews = async (req, res) => {
    const docs = await getDocs(collection(db, "news"))
    let arr = []
    docs.forEach((doc) => {
        arr.push({ id: doc.id, ...doc.data() })
    })
    res.status(200).send(arr)
}
export const createNews = errorHandler(async (req, res) => {
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
    res.send('as')
})
export const deleteNews = errorHandler(async (req, res, next) => {
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
})
export const updateNews = errorHandler(async (req, res) => {
    const id = req.params.id
    const { imgName, img } = req.body.body
    const { url } = await imgConverter(img, imgName)
    await setDoc(doc(db, 'news', id), {
        ...req.body.body,
        img: url
    }, { merge: true })
    const mydoc = await getDoc(doc(db, "news", id))
    res.status(200).send({
        ...mydoc.data()
    })
})