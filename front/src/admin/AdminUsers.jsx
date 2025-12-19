import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import React from "react";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const token = localStorage.getItem("token");
    const auth = JSON.parse(localStorage.getItem("user")); // logged admin

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const loadUsers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/users", {
                headers,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setUsers(data.users || []);
        } catch (err) {
            toast.error(err.message || "Failed to load users");
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm("Delete user and ALL related data?")) return;

        try {
            const res = await fetch(
                `http://localhost:5000/api/admin/users/${id}`,
                {
                    method: "DELETE",
                    headers,
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("User deleted");
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div style={{ padding: 30 }}>
            <h1>Admin • Users</h1>

            <table width="100%" cellPadding={10}>
                <thead>
                    <tr>
                        <th align="left">Username</th>
                        <th align="left">Email</th>
                        <th align="left">Role</th>
                        <th align="right">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((u) => {
                        const isSelf = u._id === auth?.id;
                        const isAdmin = u.role === "admin";
                        const canDelete = !isSelf && !isAdmin;

                        return (
                            <tr key={u._id}>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td align="right">
                                    {canDelete ? (
                                        <button
                                            onClick={() => deleteUser(u._id)}
                                            style={{
                                                background: "#ff4d4f",
                                                color: "#fff",
                                                border: "none",
                                                padding: "6px 12px",
                                                borderRadius: 6,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <span style={{ color: "#999", fontStyle: "italic" }}>
                                            Protected
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}

                    {users.length === 0 && (
                        <tr>
                            <td colSpan={4}>No users</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
