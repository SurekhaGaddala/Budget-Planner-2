import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("bp_token");
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  }
});
export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Transactions", "Budgets", "Goals", "Profile"],
  endpoints: (builder) => ({
    register: builder.mutation({ query: (body) => ({ url: "/auth/register", method: "POST", body }) }),
    login: builder.mutation({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
    getTransactions: builder.query({ query: () => "/transactions", providesTags: ["Transactions"] }),
    addTransaction: builder.mutation({ query: (body) => ({ url: "/transactions", method: "POST", body }), invalidatesTags: ["Transactions"] }),
    deleteTransaction: builder.mutation({ query: (id) => ({ url: `/transactions/${id}`, method: "DELETE" }), invalidatesTags: ["Transactions"] }),
    getBudgets: builder.query({ query: () => "/budgets", providesTags: ["Budgets"] }),
    saveBudget: builder.mutation({ query: (body) => ({ url: "/budgets", method: "POST", body }), invalidatesTags: ["Budgets"] }),
    deleteBudget: builder.mutation({ query: (id) => ({ url: `/budgets/${id}`, method: "DELETE" }), invalidatesTags: ["Budgets"] }),
    getGoals: builder.query({ query: () => "/goals", providesTags: ["Goals"] }),
    addGoal: builder.mutation({ query: (body) => ({ url: "/goals", method: "POST", body }), invalidatesTags: ["Goals"] }),
    updateGoal: builder.mutation({ query: ({ id, saved }) => ({ url: `/goals/${id}`, method: "PATCH", body: { saved } }), invalidatesTags: ["Goals"] }),
    deleteGoal: builder.mutation({ query: (id) => ({ url: `/goals/${id}`, method: "DELETE" }), invalidatesTags: ["Goals"] }),
    getProfile: builder.query({ query: () => "/users/profile", providesTags: ["Profile"] }),
    updateProfile: builder.mutation({ query: (body) => ({ url: "/users/profile", method: "PATCH", body }), invalidatesTags: ["Profile"] })
  })
});
export const {
  useRegisterMutation, useLoginMutation, useGetTransactionsQuery, useAddTransactionMutation,
  useDeleteTransactionMutation, useGetBudgetsQuery, useSaveBudgetMutation, useDeleteBudgetMutation,
  useGetGoalsQuery, useAddGoalMutation, useUpdateGoalMutation, useDeleteGoalMutation,
  useGetProfileQuery, useUpdateProfileMutation
} = api;
