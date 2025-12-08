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

export default function BrowseLaporan() {
    const [filters, setFilters] = useState({
        nomor_invoice: "",
        tanggal_invoice: "",
        periode: "",
        tanggal_batas_pembayaran: "",
        jumlah: "",
        tanggal_bayar: "",
        status: "",
        action: "",
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
                tglInvoice: filters.tanggal_invoice,
                periode: filters.periode,
                tglBatasPembayaran: filters.tanggal_batas_pembayaran,
                jumlah: filters.jumlah,
                tglBayar: filters.tanggal_bayar,
                status: filters.status,
                searchBy: searchBy,
                searchValue: searchValue,
            }).toString();

            const response = await api.browse.laporan_tagihan.search(params);

            if (response.data.kode === 200) {
                setData(response.data.data);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("Error fetching laporan:", error);
            alert("Gagal memuat data laporan");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (invoiceId) => {
        try {
            const response = await api.browse.laporan_tagihan.downloadSingle({ invoiceId });

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Invoice_${invoiceId}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading invoice:", error);
            alert("Gagal mendownload invoice");
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
            <td style={{ padding: "10px 28px", whiteSpace: "nowrap" }}>
                <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/tagihan/tagihan`)}
                >
                    Tagihan
                </Button>
                <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/tagihan/va`)}
                >
                    Virtual Account
                </Button>
                <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/tagihan/invoice`)}
                    sx={{ ml: 1 }}
                >
                    Invoice
                </Button>
            </td>

            <Typography variant="h6" fontWeight={600} mb={2}>
                📦 Browse Laporan Invoice
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
                        Filter Invoice
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
                        <MenuItem value="">Semua</MenuItem>
                        <MenuItem value="Unpaid">Unpaid</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                    </TextField>
                </Stack>

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
                                <th style={{ padding: "8px 10px" }}></th>
                                {["Nomor Invoice", "Tanggal Invoice", "Periode", "Tanggal Batas Pembayaran", "Jumlah", "Tanggal Bayar", "Status", "Action"].map((h) => (
                                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600, fontSize: 13, color: "#334155" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((d) => (
                                <tr key={d.no}>
                                    <td style={{ padding: "6px 10px" }}>{d.nomor_invoice}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.tanggal_invoice}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.periode}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.tanggal_batas_pembayaran}</td>
                                    <td style={{ padding: "6px 10px" }}>{formatRupiah(d.jumlah)}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.tanggal_bayar}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.status}</td>
                                    <td style={{ padding: "6px 10px" }}>{d.action}</td>
                                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Download />}
                                            onClick={() => handleDownload(d.nomor_invoice)}
                                            size="small"
                                        >
                                            Download
                                        </Button>
                                    </td>
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
                                    bgcolor: pageNum === currentPage ? "primary.main" : "inherit",
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
