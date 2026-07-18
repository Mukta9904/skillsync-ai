import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        // Set loading state to true
        setLoading(true)
        try {
            // Call the login API and set the user state with the returned user data
            const data = await login({ email, password })
            // Set the user state with the returned user data
            const nextUser = data?.user ?? null
            setUser(nextUser)
            return nextUser
        } catch (err) {
            setUser(null)
            return null
        } finally {
            // Set loading state to false after the login attempt is complete
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            const nextUser = data?.user ?? null
            setUser(nextUser)
            return nextUser
        } catch (err) {
            setUser(null)
            return null
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
