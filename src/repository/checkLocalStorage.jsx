const checkLocalStorage = () => {
    const token = localStorage.getItem('token')

    if(!token){
        return
    } else {
        // eslint-disable-next-line no-unused-vars
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            } 
        }
        return config
    }
}

export default checkLocalStorage;
