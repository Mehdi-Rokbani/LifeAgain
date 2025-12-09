import { useEffect, useState } from "react";
import axios from "axios";

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/categories");
                const resTree = await axios.get("http://localhost:5000/api/categories/tree");
                setCategories(res.data);
                setTree(resTree.data);
            } catch (err) {
                console.log("CATEGORY LOAD ERROR:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, tree, loading };
}
