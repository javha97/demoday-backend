// import { isAuthenticated, errorHandler } from './helperFunctions.js';
// import { getStorage, ref, deleteObject } from "firebase/storage";
// import { db } from './firebase.js'
// import { Router } from 'express';
// import { collection, doc, getDocs, deleteDoc, getDoc } from "firebase/firestore";
// const router = Router()
// router.route('/')
//     .get(errorHandler(async (req, res) => {
//         const docs = await getDocs(collection(db, "products"));
//         let arr = []
//         docs.forEach((doc) => {
//             arr.push({ id: doc.id, ...doc.data() })
//         });
//         res.status(200).send(arr)
//     }))
//     .delete(isAuthenticated, errorHandler(async (req, res) => {
//         const { id } = req.query
//         const mydoc = await getDoc(doc(db, "products", id))
//         if (mydoc.exists()) {
//             console.log("Document data:", mydoc.data().img);
//             mydoc.data().img.map((el) => {
//                 const storage = getStorage();
//                 const desertRef = ref(storage, `${el.imgName}`);
//                 (async () => {
//                     try {
//                         await deleteObject(desertRef)
//                     } catch (e) {
//                         console.log(e);
//                     }
//                 })()
//             })
//         }
//         await deleteDoc(doc(db, "products", id))
//         res.status(200).send('deleted successfully')
//     }))
// export default router