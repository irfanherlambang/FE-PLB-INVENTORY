import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Button,
    Stack,
} from "@mui/material";
import { Search, Download, FilterAlt } from "@mui/icons-material";
import api from "../../api/api";
import { ReceiptLong, Payment, Description } from "@mui/icons-material";

export default function BrowseLaporan() {
    const [filters, setFilters] = useState({
        nomor_invoice: "",
        tanggal_invoice: "",
        nomor_faktur: "",
        periode: "",
        tanggal_batas_pembayaran: "",
        jumlah: "",
        tanggal_bayar: "",
        status: "",
        action: ""
    });
    const [searchBy, setSearchBy] = useState("nomor_invoice");
    const [searchValue, setSearchValue] = useState("");
    const navigate = useNavigate();

    const [selectedJobs, setSelectedJobs] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // === HANDLE SEARCH ===
    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                nomorInvoice: filters.nomor_invoice,
                tanggalInvoice: filters.tanggal_invoice,
                tanggalBatasPembayaran: filters.tanggal_batas_pembayaran,
                status: filters.status,
                searchBy,
                searchValue
            }).toString();

            const response = await api.browse.laporan_penagihan.search(params);
            console.log("Fetched Penagihan:", response.data);

            const fetchedData = response.data.data || response.data || [];
            setData(fetchedData);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching laporan:", error);
            alert("Gagal memuat data laporan");
        } finally {
            setLoading(false);
        }
    };


    // === HANDLE EXPORT EXCEL ===
    const handleExport = async () => {
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.browse.laporan_penagihan.download(params);

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Laporan_Penagihan.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error export laporan:", error);
            alert("Gagal export ke Excel");
        }
    };



    const totalPages = Math.ceil(data.length / rowsPerPage);
    const currentData = data.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const getPageNumbers = () => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const formatRupiah = (value) => {
        if (!value) return "-";
        return "Rp " + new Intl.NumberFormat("id-ID", {
            style: "decimal",
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Box p={3}>
            <Typography variant="h6" fontWeight={600} mb={2}>
                📦 Browse List Penagihan
            </Typography>

            {/* === FILTER BAR === */}
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
                elevation={2}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <FilterAlt color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>
                        Filter Penagihan
                    </Typography>
                </Stack>

                {/* --- SEARCH + DROPDOWN --- */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    mt={0.5}
                    alignItems={{ xs: "stretch", md: "center" }}
                >
                    <TextField
                        select
                        label="Cari Berdasarkan"
                        value={searchBy}
                        onChange={(e) => setSearchBy(e.target.value)}
                        size="small"
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="nomor_invoice">Nomor Invoice</MenuItem>
                        <MenuItem value="tanggal_invoice">Tanggal Invoice</MenuItem>
                        <MenuItem value="tanggal_batas_pembayaran">Tanggal Batas Pembayaran</MenuItem>
                    </TextField>

                    <TextField
                        label="Ketik Nomor"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        size="small"
                        placeholder="Masukkan nomor sesuai pilihan..."
                        sx={{ minWidth: 300 }}
                    />

                    <TextField
                        select
                        label="Status"
                        name="status"
                        value={filters.status}
                        onChange={handleChange}
                        size="small"
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="Unpaid">Unpaid</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                    </TextField>
                </Stack>

                {/* === TRUE IMPLEMENTATION NOT DONE === */}
                <Stack direction="row" alignItems="center">
                    <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
                        <Button
                            variant="contained"
                            startIcon={<Search />}
                            onClick={handleSearch}
                            size="medium"
                            sx={{ height: 40, px: 2.5 }}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Tampilkan"}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleExport}
                            size="medium"
                            sx={{ height: 40, px: 2.5 }}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Export Excel"}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* === HASIL LAPORAN === */}
            <Paper sx={{ p: 2, borderRadius: 2 }} elevation={2}>
                <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                    📄 Hasil Laporan
                </Typography>

                {data.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        (Data laporan akan tampil setelah filter dijalankan)
                    </Typography>
                ) : (
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            borderRadius: 8,
                            overflow: "hidden",
                            fontSize: "13px",
                        }}
                    >
                        <thead style={{ background: "#f1f5f9" }}>
                            <tr>
                                <th style={{ padding: "8px 10px" }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedJobs.length === currentData.length && currentData.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedJobs(currentData.map((d) => d.nomor_invoice));
                                            } else {
                                                setSelectedJobs([]);
                                            }
                                        }}
                                    />
                                </th>
                                {["Nama Perusahaan", "Nomor Invoice", "Tanggal Invoice", "Periode", "Nomor Fakutr", "Tanggal Batas Pembayaran", "Jumlah", "Tanggal Bayar", "Status", "Action"].map((h) => (
                                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600, fontSize: 13, color: "#334155" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((d) => (
                                <tr key={d.no}>
                                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedJobs.includes(d.nomor_invoice)}
                                            onChange={() => handleToggleJob(d.nomor_invoice)}
                                        />
                                    </td>
                                    <td style={{ padding: "6px 10px" }}>{d.nama_perusahaan}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.nomor_invoice}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.tanggal_invoice}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.periode}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.nomor_faktur}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.tanggal_batas_pembayaran}</td>
                                    <td style={{ padding: "6px 10px" }}>{formatRupiah(d.jumlah)}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.tanggal_bayar}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.status}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* === PAGINATION === */}
                {totalPages > 1 && (
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={2}
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Prev
                        </Button>

                        {getPageNumbers().map((pageNum) => (
                            <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "contained" : "outlined"}
                                size="small"
                                onClick={() => setCurrentPage(pageNum)}
                                sx={{
                                    minWidth: 36,
                                    px: 1,
                                    bgcolor:
                                        pageNum === currentPage ? "primary.main" : "inherit",
                                    color: pageNum === currentPage ? "#fff" : "inherit",
                                }}
                            >
                                {pageNum}
                            </Button>
                        ))}

                        <Button
                            variant="outlined"
                            size="small"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}
