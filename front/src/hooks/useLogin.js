import { useAuthContext } from './useAuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export const useLogin = () => {
    const [Error, setError] = useState(null)
    const [Loading, setLoading] = useState(false)
    const { dispatch } = useAuthContext();
    const navigate = useNavigate()

    const login = async (email, password) => {
        setLoading(true)
        setError(null)

        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        })

        const json = await response.json()

        if (!response.ok) {
            setLoading(false)
            setError(json.message)   // FIX
            return
        }

        // Save correct data
        localStorage.setItem('user', JSON.stringify(json.user))
        localStorage.setItem('token', json.token)

        dispatch({ type: 'LOGIN', payload: json.user })

        setLoading(false)
        navigate('/')
    }

    return { login, Loading, Error }
}
