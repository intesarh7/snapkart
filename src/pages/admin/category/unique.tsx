import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function UniqueCategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/category/unique")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      });
  }, []);

  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          Unique Categories
        </h2>

        {categories.length === 0 ? (
          <p className="text-gray-500">
            No categories found
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {categories.map((c, index) => (
              <div
                key={index}
                className="bg-white shadow rounded-lg p-4 text-center"
              >
                {c.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
