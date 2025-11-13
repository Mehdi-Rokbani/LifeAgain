import { useAuthContext } from './useAuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
export const useSingup = () => {
    const [Error, setError] = useState(null)
    const [Loading, setLoading] = useState(null)
    const { dispatch } = useAuthContext();
    const Navigate = useNavigate()


    const signup = async (user) => {
        setLoading(true)
        setError(null)

        const response = await fetch("/users/register"
            , {
                method: "POST",
                headers: { "content-Type": "application/json" },
                body: JSON.stringify(user)
            })
        const json = await response.json()
        console.log('what am i geting : ', json)
        if (!response.ok) {
            setLoading(false)
            setError(json.error)
            console.log(json)
            console.log(Error)
        }

        if (response.ok) {
            //save user in storage
            localStorage.setItem('user', JSON.stringify(json));
            localStorage.setItem('token', json.token);

            //update AUTH CONTEXT
            dispatch({ type: 'LOGIN', payload: json })
            setLoading(false)
            console.log(json)

            Navigate('/');


        }


    }

    return { signup, Loading, Error }

}
