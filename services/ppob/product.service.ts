import { apiSlice } from "../base-query";
import { Product } from "@/types/ppob/product"; 

export const productCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Product Categories (with pagination)
    getProductList: builder.query<
      {
        data: Product[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; ppob_category_id?: number }
    >({
      query: ({ page, paginate, ppob_category_id }) => ({
        url: `/master/ppob-products`,
        method: "GET",
        params: {
          page,
          paginate,
          ppob_category_id,
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Product[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Product Category by Slug
    getProductBySlug: builder.query<Product, string>({
      query: (slug) => ({
        url: `/master/ppob-products/${slug}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Product;
      }) => response.data,
    }),

    // ➕ Create Product Category
    createProduct: builder.mutation<Product, FormData>({
      query: (payload) => ({
        url: `/master/ppob-products`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Product;
      }) => response.data,
    }),

    // ✏️ Update Product Category by Slug
    updateProduct: builder.mutation<
      Product,
      { slug: string; payload: FormData }
    >({
      query: ({ slug, payload }) => ({
        url: `/master/ppob-products/${slug}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Product;
      }) => response.data,
    }),

    // ❌ Delete Product Category by Slug
    deleteProduct: builder.mutation<
      { code: number; message: string },
      string
    >({
      query: (slug) => ({
        url: `/master/ppob-products/${slug}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductListQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productCategoryApi;