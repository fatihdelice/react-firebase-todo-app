import React, { useState } from 'react'
import { updateTodo } from '../../firebase';

export default function EditTodoModal({ close, data }) {

    const [todo, setTodo] = useState(data.todo)
    const [done, setDone] = useState(data.done)

    const clickHandle = async () => {
        await updateTodo(data.id, {
            todo,
            done
        })
        close()
    }

    return (
        <>
        {JSON.stringify(data)}
            <input type="text" value={todo} onChange={e => setTodo(e.target.value)} /><br />
            <label>
                <input type="checkbox" checked={done} onChange={e => setDone(e.target.checked)} />
                Tamamlandı olarak işaretle
            </label><br />
            <button onClick={clickHandle}>Kaydet</button>
        </>
    )
}
