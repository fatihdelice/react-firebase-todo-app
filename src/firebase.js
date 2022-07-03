import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, reauthenticateWithCredential, updatePassword, sendEmailVerification, onAuthStateChanged, signInWithEmailAndPassword, signOut, EmailAuthProvider } from "firebase/auth"
import { getFirestore, collection, orderBy, updateDoc, serverTimestamp, addDoc, query, where, deleteDoc, onSnapshot, doc } from "firebase/firestore"
import toast from "react-hot-toast";
import store from "./store";
import { login as loginHandle, logout as logoutHandle } from "./store/auth";
import { openModal } from "./store/modal";
import { setTodos } from "./store/todos";
import { setUserData } from "./utils";


const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_ID
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app)



export const register = async (email, password) => {
    try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        return user
    } catch (error) {
        toast.error(error.message)
    }
}

export const login = async (email, password) => {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        return user
    } catch (error) {
        toast.error(error.message)
    }
}

export const reAuth = async password => {
    try {
        const credential = await EmailAuthProvider.credential(
            auth.currentUser.email,
            password
        )
        const { user } = await reauthenticateWithCredential(auth.currentUser, credential)
        return user
    } catch (error) {
        toast.error(error.message)
    }
}

export const logout = async () => {
    try {
        await signOut(auth)
        return true
    } catch (error) {
        toast.error(error.message)
    }
}

export const update = async data => {
    try {
        await updateProfile(auth.currentUser, data)
        toast.success('Profil güncellendi.')
        return true
    } catch (error) {
        toast.error(error.message)
    }
}
export const resetPassword = async password => {
    try {
        await updatePassword(auth.currentUser, password)
        toast.success('Parolanız güncellendi.')
        return true
    } catch (error) {
        if (error.code == 'auth/requires-recent-login') {
            console.log("geldi")
            store.dispatch(openModal({
                name: 're-auth-modal'
            }))
        }
        toast.error(error.message)
    }
}

export const emailVerification = async () => {
    try {
        await sendEmailVerification(auth.currentUser)
        toast.success(`Doğrulama maili ${auth.currentUser.email} adresine gönderildi, lütfen kontrol ediniz!`)
    } catch (error) {
        toast.error(error.message)
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        setUserData()

        onSnapshot(query(collection(db, 'todos'), where('uid', '==', user.uid), orderBy('createdAt', 'desc')), (doc) => {
            store.dispatch(
                setTodos(
                    doc.docs.reduce((todos, todo) => [...todos, { ...todo.data(), id: todo.id }], [])
                )
            )
        });

    } else {
        store.dispatch(logoutHandle())
    }
});

export const addTodo = async data => {
    try {
        data.createdAt = serverTimestamp()
        const result = await addDoc(collection(db, 'todos'), data)
        return result.id
    } catch (error) {
        toast.error(error.message)
    }
}

export const updateTodo = async (id, data) => {
    try {
        const todoRef = doc(db, 'todos', id);
        await updateDoc(todoRef, data)
        toast.success('Todo başarıyla güncellendi.')
        return true
    } catch (error) {
        toast.error(error.message)
    }
}

export const deleteTodo = async id => {
    try {
        await deleteDoc(doc(db, 'todos', id))
    } catch (error) {
        toast.error(error.message)
    }
}

export default app