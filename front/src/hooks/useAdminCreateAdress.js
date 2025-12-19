export const useAdminCreateAddress = () => {
    const token = localStorage.getItem("token");

    return async (sellerId, payload) => {
        const res = await fetch(
            `http://localhost:5000/api/admin/sellers/${sellerId}/addresses`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        return res.json();
    };
};
