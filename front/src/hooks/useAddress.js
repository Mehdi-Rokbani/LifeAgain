import axios from "axios";

export const useAddress = () => {
    const token = localStorage.getItem("token");

    const getAddresses = async () => {
        const res = await axios.get("http://localhost:5000/api/user/get", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    };

    const addAddress = async (data) => {
        const res = await axios.post("http://localhost:5000/api/user/add", data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    };

    const deleteAddress = async (id) => {
        await axios.delete(`http://localhost:5000/api/user/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    return { getAddresses, addAddress, deleteAddress };
};
