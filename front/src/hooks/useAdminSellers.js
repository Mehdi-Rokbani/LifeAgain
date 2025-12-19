export const useAdminSellers = () => {
    const token = localStorage.getItem("token");
    const [sellers, setSellers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/admin/sellers", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => d.success && setSellers(d.sellers));
    }, []);

    return { sellers };
};
