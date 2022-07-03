import React from 'react'
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { logout, emailVerification, deleteTodo, addTodo } from '../firebase';
import { logout as logoutHandle } from '../store/auth';
import { useNavigate } from "react-router-dom"
import { useState } from "react";
import { modal } from "../utils";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "dayjs/locale/tr";


dayjs.extend(relativeTime)
dayjs.locale('tr')

export default function Home() {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const { todos } = useSelector(state => state.todos)

    const [todo, setTodo] = useState('')
    const [done, setDone] = useState(true)

    const submitHandle = async e => {
        e.preventDefault()
        await addTodo({
            todo,
            uid: user.uid,
            done
        })
        setTodo('')
    }

    const handleDelete = async id => {
        await deleteTodo(id)
    }

    const handleLogout = async () => {
        await logout()
        dispatch(logoutHandle())
        navigate('/login', {
            replace: true
        })
    }

    const handleVerification = async () => {
        await emailVerification()
    }

    if (user) {
        return (
            <>
                <h1 className=" flex gap-x-4 items-center">
                    {user.photoURL && <img src={user.photoURL} className="w-7 h-7 rounded-full" />}
                    Hoşgeldin, {user.displayName} ({user.email})
                    <Link to="/settings" className="h-8 rounded px-4 text-sm text-white flex items-center bg-indigo-700">Ayarlar</Link>
                    <button onClick={handleLogout} className="h-8 rounded px-4 text-sm text-white bg-indigo-700">Çıkış yap</button>
                    {!user.emailVerified &&
                        <button onClick={handleVerification} className="h-8 rounded px-4 text-sm text-white bg-indigo-700">E-posta onayla</button>
                    }
                </h1>

                <form className="flex gap-x-4 mt-4" onSubmit={submitHandle}>
                    <input type="text" placeholder="Todo yaz" value={todo} onChange={e => setTodo(e.target.value)} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                    <label>
                        <input type="checkbox" checked={done} onChange={e => setDone(e.target.checked)} />
                        Tamamlandı olarak işaretle
                    </label>
                    <button disabled={!todo} className="inline-flex disabled:opacity-20 cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Ekle</button>
                </form>

                <ul className="mt-4 flex flex-col gap-y-2">
                    {todos.map(todo => (
                        <li key={todo.id} className="p-4 flex justify-between items-center rounded bg-indigo-50 text-sm text-indigo-700" >
                            <span className={`${todo.done ? 'line-through' : ''}`}>
                                {todo.todo}
                            </span>
                            {todo ?.createdAt && <span>{dayjs.unix(todo.createdAt.seconds).fromNow()}</span>}
                            <div className="flex gap-x-2">
                                <button onClick={() => modal('edit-todo-modal', todo)} className="h-7 rounded px-3 text-xs bg-indigo-700 text-white">Düzenle</button>
                                <button onClick={() => handleDelete(todo.id)} className="h-7 rounded px-3 text-xs bg-indigo-700 text-white">Sil</button>
                            </div>
                        </li>
                    ))}
                    {todos.length == 0 && (
                        <li className="p-4 flex justify-between items-center rounded bg-orange-50 text-sm text-orange-700" >
                            Hiç todo ekemedin!
                        </li>
                    )}
                </ul>
            </>
        )
    }

    return (
        <div>
            <Link to="/register">Kayıt ol</Link>
            <Link to="/login">Giriş yap</Link>
            {/*
            <br /><br />
             
            <ul className="mt-4 flex flex-col gap-y-2">
                {todos.map(todo => (
                    <li key={todo.id} className="p-4 flex justify-between items-center rounded bg-indigo-50 text-sm text-indigo-700" >
                        {todo.todo}
                        <button onClick={() => handleDelete(todo.id)} className="h-7 rounded px-3 text-xs bg-indigo-700 text-white">Sil</button>
                    </li>
                ))}
                {todos.length == 0 && (
                    <li className="p-4 flex justify-between items-center rounded bg-orange-50 text-sm text-orange-700" >
                        Hiç todo ekemedin!
                    </li>
                )}
            </ul> */}
        </div>
    )
}
