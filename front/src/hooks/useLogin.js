import { useAuthContext } from './useAuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
export const useLogin = () => {
    const [Error, setError] = useState(null)
    const [Loading, setLoading] = useState(null)
    const { dispatch } = useAuthContext();
    const navigate = useNavigate()


    const login = async (email, password) => {
        setLoading(true)
        setError(null)


        const response = await fetch("/users/login"
            , {
                method: "POST",
                headers: { "content-Type": "application/json" },
                body: JSON.stringify({ email, password })
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

            navigate('/')
        }


    }

    return { login, Loading, Error }

}
