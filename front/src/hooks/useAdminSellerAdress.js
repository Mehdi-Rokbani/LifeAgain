export const useAdminSellerAddresses = (sellerId) => {
    const token = localStorage.getItem("token");
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        if (!sellerId) return;

        fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => d.success && setAddresses(d.addresses));
    }, [sellerId]);

    return { addresses };
};
