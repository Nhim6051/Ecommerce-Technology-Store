"use client";
import { useCallback, useEffect, useState } from "react";
import type React from "react";

import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Filter, Home } from "lucide-react";
import Link from "next/link";
import { env } from "@/libs/env.helper";

interface Product {
  _id: string;
  product_name: string;
  description: string;
  slug: string;
  price: number;
  salePrice: number;
  stock: number;
  images: string[];
  category: ICategory;
  attributes: string[];
  rating: number;
  brand: Brand;
  reviewCount: number;
  tags: string[];
}

interface ICategory {
  _id: string;
  category_name: string;
}

interface Brand {
  _id: string;
  brand_name: string;
}

interface ApiResponse {
  data: {
    products: Product[];
    pagination: {
      totalRecord: number;
    };
  };
}

export default function ProductPageByCategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [noProducts, setNoProducts] = useState<boolean>(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setNoProducts(false);

    const decodedSlug = decodeURIComponent(slug);

    const numericMinPrice = minPrice ? Number.parseFloat(minPrice) : null;
    const numericMaxPrice = maxPrice ? Number.parseFloat(maxPrice) : null;

    const queryParams = new URLSearchParams({
      category_slug: decodedSlug,
      page: currentPage.toString(),
      limit: "12",
      ...(numericMinPrice &&
        !isNaN(numericMinPrice) && { price_gte: numericMinPrice.toString() }),
      ...(numericMaxPrice &&
        !isNaN(numericMaxPrice) && { price_lte: numericMaxPrice.toString() }),
      ...(selectedBrand && { brand_slug: selectedBrand }),
      ...(minRating && { rating_gte: minRating }),
      ...(sortOrder && {
        sort_by: sortOrder === "newest" ? "createdAt" : "salePrice",
        sort_type: sortOrder === "asc" ? "asc" : "desc",
      }),
    });

    const query = `${env.API_URL}/products?${queryParams.toString()}`;
    console.log("query ===>", query);
    try {
      const res = await fetch(query);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: ApiResponse = await res.json();
      setProducts(data.data.products);
      setTotalPages(Math.ceil(data.data.pagination.totalRecord / 12));
      if (data.data.products.length === 0) setNoProducts(true);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    slug,
    currentPage,
    minPrice,
    maxPrice,
    selectedBrand,
    minRating,
    sortOrder,
  ]);

  useEffect(() => {
    if (slug) {
      fetchProducts();
    }
  }, [slug, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  //Price
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (
      value === "" ||
      (!isNaN(Number.parseInt(value)) && Number.parseInt(value) >= 0)
    ) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (
      value === "" ||
      (!isNaN(Number.parseInt(value)) && Number.parseInt(value) >= 0)
    ) {
      setMaxPrice(value);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 text-gray-600 mb-8 text-[15px]">
        <Home className="text-blue-500" />
        <Link href="/" className="hover:underline text-blue-600">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="font-medium capitalize">
          {products.length > 0 ? products[0].category.category_name : slug}
        </span>
      </div>

      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <Filter className="text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bộ lọc cho thương hiệu, đánh giá, sắp xếp, và giá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thương hiệu
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">Tất cả</option>
              {/* Extract unique brands to avoid duplicates */}
              {Array.from(
                new Set(
                  products.map((product) => JSON.stringify(product.brand))
                )
              )
                .map((brandString) => {
                  const brand = JSON.parse(brandString);
                  return brand ? (
                    <option key={brand._id} value={brand.slug}>
                      {brand.brand_name}
                    </option>
                  ) : null;
                })
                .filter(Boolean)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đánh giá
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Tất cả</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {"⭐".repeat(star)} trở lên
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">Mặc định</option>
              <option value="asc">Giá tăng</option>
              <option value="desc">Giá giảm</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
          <div className="sm:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá từ
              </label>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={handleMinPriceChange}
                placeholder="Ví dụ: 1000000"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến
              </label>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={handleMaxPriceChange}
                placeholder="Ví dụ: 5000000"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-8">
            Loading...
          </div>
        ) : noProducts ? (
          <div className="w-full flex justify-center items-center py-8">
            <span className="text-lg text-gray-600">
              Không tìm thấy sản phẩm
            </span>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>

      <div className="flex justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md"
          disabled={currentPage === 1 || isLoading}
        >
          Trước
        </button>
        <span className="flex items-center justify-center">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md"
          disabled={currentPage === totalPages || isLoading}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
