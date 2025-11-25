// src/api/api.js
import axios from "axios";

// ✅ Buat instance axios utama
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ✅ Tambahkan interceptor (opsional, bisa nambah token otomatis)
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// ✅ Grup API
const api = {
  user: {
    login: (data) => axiosInstance.post("/user/login", data),
    register: (data) => axiosInstance.post("/user/register", data),
    resetPassword: (data) => axiosInstance.post("/user/resetPassword", data),
    forgotPassword: (email) => axiosInstance.post("/user/forgotPassword", { email }),
    list: () => axiosInstance.get("/user/list"),
    deleteUser: (data) => axiosInstance.delete("/user/deleteUser", data),
  },
  browse: {
    laporan_pemasukan: {
      search: (params) => axiosInstance.get(`/browse/laporanPemasukan/search?${params}`),
      download: (params) => axiosInstance.get(`/browse/laporanPemasukan/download?${params}`, { responseType: "blob" }),
    },
    laporan_pengeluaran: {
      search: (params) => axiosInstance.get(`/browse/laporanPengeluaran/search?${params}`),
      download: (params) => axiosInstance.get(`/browse/laporanPengeluaran/download?${params}`, { responseType: "blob" }),
    },
    laporan_mutasi: {
      search: (params) => axiosInstance.get(`/browse/laporanMutasi/search?${params}`),
      download: (params) => axiosInstance.get(`/browse/laporanMutasi/download?${params}`, { responseType: "blob" }),
    }

  },
  inventory: {
    dokumen: {
      search: (params) => axiosInstance.get(`/inventory/dokumen/search?${params}`),
      lihatPengajuan: (params) => axiosInstance.get(`/inventory/dokumen/lihatpengajuan/${params}`),
      history: (params) => axiosInstance.get(`/inventory/dokumen/history/${params}`),
      respondoc: (params) => axiosInstance.get(`/inventory/dokumen/respondoc/${params}`),

    }
  },

  // kamu bisa tambah grup lain nanti, misal:
  // produk: {...},
  // laporan: {...},
};

export default api;
