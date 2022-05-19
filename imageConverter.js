import crypto from 'crypto'
import { storage } from './firebase.js';
import { ref, uploadString, getDownloadURL } from "firebase/storage";
export const imgConverter = async (img, imgname) => {
    if (imgname === undefined) {
        const id = crypto.randomBytes(16).toString("hex");
        const storageRef = ref(storage, id);
        await uploadString(storageRef, img, 'base64')
        const url = await getDownloadURL(storageRef)
        return { url, id }
    } else {
        const storageRef = ref(storage, imgname);
        await uploadString(storageRef, img, 'base64')
        const url = await getDownloadURL(storageRef)
        return { url, imgname }
    }
}