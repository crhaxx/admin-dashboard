import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Folder } from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  Timestamp,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

type CategoryDoc = {
  id: string;
  name: string;
  createdAt?: any;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  images?: string[];
  categories?: string[];
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [showAddCategoryDropdown, setShowAddCategoryDropdown] = useState(false);
  const [showEditCategoryDropdown, setShowEditCategoryDropdown] = useState(false);
  const [quickCategory, setQuickCategory] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const [newProduct, setNewProduct] = useState<{
    name: string;
    price: string;
    stock: string;
    imageUrl: string;
    categories: string[];
  }>({
    name: "",
    price: "",
    stock: "",
    imageUrl: "",
    categories: [],
  });

  const [editProduct, setEditProduct] = useState<{
    id: string;
    name: string;
    price: string;
    stock: string;
    imageUrl: string;
    categories: string[];
  }>({
    id: "",
    name: "",
    price: "",
    stock: "",
    imageUrl: "",
    categories: [],
  });

  // Load categories
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { name: string; createdAt?: any }),
      }));
      setCategories(data);
    });

    return () => unsub();
  }, []);

  // Load products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          name: d.name,
          price: d.price,
          stock: d.stock,
          images: d.images || [],
          categories: d.categories || [],
        } as Product;
      });
      setProducts(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (addModal || confirmDelete.open || editModal || categoryModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [addModal, confirmDelete.open, editModal, categoryModal]);

  const deleteProduct = async () => {
    if (!confirmDelete.id) return;
    await deleteDoc(doc(db, "products", confirmDelete.id));
    setConfirmDelete({ open: false, id: null });
  };

  const saveProduct = async () => {
    await addDoc(collection(db, "products"), {
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      images: [newProduct.imageUrl],
      categories: newProduct.categories,
      createdAt: Timestamp.now(),
    });

    setAddModal(false);
    setNewProduct({
      name: "",
      price: "",
      stock: "",
      imageUrl: "",
      categories: [],
    });
  };

  const updateProduct = async () => {
    if (!editProduct.id) return;

    await updateDoc(doc(db, "products", editProduct.id), {
      name: editProduct.name,
      price: Number(editProduct.price),
      stock: Number(editProduct.stock),
      images: [editProduct.imageUrl],
      categories: editProduct.categories,
      updatedAt: Timestamp.now(),
    });

    setEditModal(false);
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "" ||
      (p.categories || []).includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-black dark:text-white">
            Products
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-black dark:text-white rounded-lg transition"
            >
              <Folder size={18} />
              Categories
            </button>

            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] px-3 py-2 rounded-lg w-full max-w-md">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none text-black dark:text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <select
          className="p-2 rounded bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] text-black dark:text-white"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Products Table */}
        <div className="bg-white dark:bg-[#111] rounded-xl shadow border border-gray-200 dark:border-[#333]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#333]">
                <th className="p-4 text-black dark:text-white">Product</th>
                <th className="p-4 text-black dark:text-white">Price</th>
                <th className="p-4 text-black dark:text-white">Stock</th>
                <th className="p-4 text-black dark:text-white">Categories</th>
                <th className="p-4 text-right text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products found
                  </td>
                </tr>
              )}

              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 dark:border-[#222] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition"
                >
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/60"
                      }
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="text-black dark:text-white">
                      {product.name}
                    </span>
                  </td>

                  <td className="p-4 text-black dark:text-white">
                    ${product.price}
                  </td>

                  <td className="p-4 text-black dark:text-white">
                    {product.stock}
                  </td>

                  <td className="p-4 text-black dark:text-white">
                    <div className="flex gap-2 flex-wrap">
                      {(product.categories || []).length === 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          -
                        </span>
                      )}
                      {(product.categories || []).map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 bg-indigo-600 text-white rounded-full text-sm"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setEditProduct({
                          id: product.id,
                          name: product.name,
                          price: String(product.price),
                          stock: String(product.stock),
                          imageUrl: product.images?.[0] || "",
                          categories: product.categories || [],
                        });
                        setEditModal(true);
                      }}
                      className="p-2 bg-gray-200 dark:bg-[#222] rounded-lg hover:bg-gray-300 dark:hover:bg-[#333] transition"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        setConfirmDelete({ open: true, id: product.id })
                      }
                      className="p-2 bg-red-200 dark:bg-red-900 rounded-lg hover:bg-red-300 dark:hover:bg-red-800 transition"
                    >
                      <Trash2
                        size={16}
                        className="text-red-700 dark:text-red-300"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      {confirmDelete.open && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111] p-6 rounded-xl shadow-xl w-full max-w-sm border border-gray-300 dark:border-[#333]">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
              Delete Product?
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, id: null })}
                className="px-4 py-2 rounded-lg text-black dark:text-white bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] transition"
              >
                Cancel
              </button>

              <button
                onClick={deleteProduct}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product popup */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111] p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-300 dark:border-[#333]">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Add Product
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product name"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />

              {/* CATEGORY MULTI-SELECT */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {newProduct.categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full"
                    >
                      {cat}
                      <button
                        onClick={() =>
                          setNewProduct({
                            ...newProduct,
                            categories: newProduct.categories.filter(
                              (c) => c !== cat
                            ),
                          })
                        }
                        className="text-white hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setShowAddCategoryDropdown(!showAddCategoryDropdown)
                    }
                    className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-left text-black dark:text-white"
                  >
                    Add category…
                  </button>

                  {showAddCategoryDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {categories.map((cat) => (
  <div
    key={cat.id}
    className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#222] cursor-pointer"
    onClick={() => {
      setNewProduct((prev) => {
        if (prev.categories.includes(cat.name)) return prev;
        return {
          ...prev,
          categories: [...prev.categories, cat.name],
        };
      });
      setShowAddCategoryDropdown(false);
    }}
  >
    <span className="text-black dark:text-white">
      {cat.name}
    </span>

    <button
      onClick={async (e) => {
        e.stopPropagation();
        await deleteDoc(doc(db, "categories", cat.id));
      }}
      className="text-red-500 hover:text-red-700"
    >
      ✕
    </button>
  </div>
))}

                      <div className="flex gap-2 p-2 border-t border-gray-300 dark:border-[#333]">
                        <input
                          type="text"
                          placeholder="New category"
                          className="flex-1 p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                          value={quickCategory}
                          onChange={(e) =>
                            setQuickCategory(e.target.value)
                          }
                        />

                        <button
  onClick={async () => {
    const name = quickCategory.trim();
    if (!name) return;

    const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
  toast.error("Category already exists");
  return;
}

    await addDoc(collection(db, "categories"), {
      name,
      createdAt: Timestamp.now(),
    });

    setNewProduct((prev) => ({
      ...prev,
      categories: [...prev.categories, name],
    }));

    setQuickCategory("");
  }}
  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
>
  Add
</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Stock"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Image URL"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={newProduct.imageUrl}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    imageUrl: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAddModal(false)}
                className="px-4 py-2 rounded-lg text-black dark:text-white bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] transition"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Product popup */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111] p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-300 dark:border-[#333]">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Edit Product
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product name"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={editProduct.name}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, name: e.target.value })
                }
              />

              {/* CATEGORY MULTI-SELECT (EDIT) */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {editProduct.categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full"
                    >
                      {cat}
                      <button
                        onClick={() =>
                          setEditProduct({
                            ...editProduct,
                            categories: editProduct.categories.filter(
                              (c) => c !== cat
                            ),
                          })
                        }
                        className="text-white hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowEditCategoryDropdown(!showEditCategoryDropdown)}
                    className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-left text-black dark:text-white"
                  >
                    Add category…
                  </button>

                  {showEditCategoryDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {categories.map((cat) => (
  <div
    key={cat.id}
    className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#222] cursor-pointer"
    onClick={() => {
      setEditProduct((prev) => {
        if (prev.categories.includes(cat.name)) return prev;
        return {
          ...prev,
          categories: [...prev.categories, cat.name],
        };
      });
      setShowEditCategoryDropdown(false);
    }}
  >
    <span className="text-black dark:text-white">
      {cat.name}
    </span>

    <button
      onClick={async (e) => {
        e.stopPropagation();
        await deleteDoc(doc(db, "categories", cat.id));
      }}
      className="text-red-500 hover:text-red-700"
    >
      ✕
    </button>
  </div>
))}

                      <div className="flex gap-2 p-2 border-t border-gray-300 dark:border-[#333]">
                        <input
                          type="text"
                          placeholder="New category"
                          className="flex-1 p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                          value={quickCategory}
                          onChange={(e) =>
                            setQuickCategory(e.target.value)
                          }
                        />

                        <button
  onClick={async () => {
    const name = quickCategory.trim();
    if (!name) return;

    // 🔥 kontrola duplicity
    const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
  toast.error("Category already exists");
  return;
}

    await addDoc(collection(db, "categories"), {
      name,
      createdAt: Timestamp.now(),
    });

    setEditProduct((prev) => ({
      ...prev,
      categories: [...prev.categories, name],
    }));

    setQuickCategory("");
  }}
  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
>
  Add
</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="number"
                placeholder="Price"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={editProduct.price}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, price: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Stock"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={editProduct.stock}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, stock: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Image URL"
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white"
                value={editProduct.imageUrl}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    imageUrl: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 rounded-lg text-black dark:text-white bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] transition"
              >
                Cancel
              </button>

              <button
                onClick={updateProduct}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories popup */}
      {categoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111] p-6 rounded-xl shadow-xl w-full max-w-sm border border-gray-300 dark:border-[#333]">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Manage Categories
            </h2>

            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white flex justify-between items-center"
                >
                  <span>{cat.name}</span>
                  <button
                    onClick={async () => {
                      await deleteDoc(doc(db, "categories", cat.id));
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder="New category name"
              className="w-full p-2 rounded bg-gray-100 dark:bg-[#222] text-black dark:text-white mb-4"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCategoryModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-[#222] text-black dark:text-white hover:bg-gray-300 dark:hover:bg-[#333] transition"
              >
                Close
              </button>

              <button
                onClick={async () => {
                  const name = newCategory.trim();
                  if (!name) return;

                  const exists = categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
  toast.error("Category already exists");
  return;
}


                  await addDoc(collection(db, "categories"), {
                    name: newCategory,
                    createdAt: Timestamp.now(),
                  });
                  setNewCategory("");
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}