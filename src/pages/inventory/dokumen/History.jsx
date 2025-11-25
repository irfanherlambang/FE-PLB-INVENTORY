import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Collapse,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Stack,
  Snackbar,
  Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate, useParams } from "react-router-dom";
import api from '../../../api/api';

const History = ({ initialData = null}) => {
    const navigate = useNavigate();
    const { orderId } = useParams();

    const [data, setData] = useState(initialData);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [responseLoading, setResponseLoading] = useState(false);
    const [error, setError] = useState("");
    const [openCollapseIndex, setOpenCollapseIndex] = useState(null); // for items with extra details
    const [snackbar, setSnackbar] = useState({ open: false, severity: "info", message: "" });
    const [responses, setResponses] = useState([]);
    const [openDraftImportIndex, setOpenDraftImportIndex] = useState(null);
    const [openResponIndex, setOpenResponIndex] = useState(null);
    

    const fetchHistoryData = async () => {
        setHistoryLoading(true);
        setError('');

        try {
            const response = await api.inventory.dokumen.history(orderId);
            console.log("HISTORY RESPONSE:", response.data);
            if (response.data.kode === 200) {
                setData(response.data.data);
            } else {
                setError('Gagal memuat riwayat');
            }
        } catch (err) {
            console.error(err);
            setError('Terjadi error ketika memuat riwayat');
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchResponseDokumen = async () => {
        setResponseLoading(true);
        setError('');

        try {
            const response = await api.inventory.dokumen.respondoc(orderId);
            console.log("RESPONSE DOC:", response.data);
            if (response.data.kode === 200) {
                setResponses(response.data.data);
            } else {
                setError('Gagal memuat Dokumen');
            }
        } catch (err) {
            console.error(err);
            setError('Terjadi error ketika memuat Dokumen');
        } finally {
            setResponseLoading(false);
        }
    };

    // dummy data draft import
    const draftImportData = [
        {
            id: 1,
            dokumen: "Draft Import 001",
            jenis: "IMPORT",
            tanggal: "2025-11-18",
            jam: "04:25 PM"
        }
    ];

    useEffect(() => {
        if (orderId) {
            fetchHistoryData();
            fetchResponseDokumen();
        }
    }, [orderId]);


    const handleBack = () => {
        navigate(-1);
    };

    const handleViewPengajuan = () => {
        if (orderId) {
        navigate(`/inventory/dokumen/${orderId}`);
        } else {
        setSnackbar({ open: true, severity: "warning", message: "Order ID tidak tersedia" });
        }
    };

    const handleDownloadPDF = () => {
        console.log('Download PDF clicked for ID:', orderId);
    };

    const handleToggleExtra = (dateIndex, itemIndex) => {
        const key = `${dateIndex}-${itemIndex}`;
        setOpenCollapseIndex(prev => (prev === key ? null : key));
    };

    const handleDownloadResponse = () => {
        console.log("Downloading response ID:", orderId);
    };

    const handleDownloadDraft = () => {
        console.log("Downloading Draft ID:", orderId);
    };

    if (historyLoading || responseLoading) {
        return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
            <CircularProgress />
        </Box>
        );
    }

    if (!data) {
        return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6">Tidak ada data riwayat.</Typography>
            {error && <Typography color="error">{error}</Typography>}
        </Box>
        );
    }

    return (
        <Box sx={{ p: 0, minHeight: '0' }}>
        {/* Header */}
        <Box
            sx={{
                mb: 3,
                p: 3,
                background: '#1e293b',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                color: 'white'
            }}
        >
            <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
                Riwayat Order
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Detail timeline riwayat order - ID: {orderId}
            </Typography>
        </Box>

        {/* Action Bar */}
        <Box
            sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}
        >
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3
                }}
            >
                Kembali
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    Unduh Dokumen Order
                </Button>
            </Box>
        </Box>       

        {/* Timeline */}
        
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            }}
        >
            <Box
                sx={{
                    mb: 3,
                    p: 5,
                }}
            >
                {data.history && data.history.length ? (
                data.history.map((day, dayIdx) => (
                    <Box key={day.date} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                        {day.label || new Date(day.date).toLocaleDateString()}
                    </Typography>

                    <Paper sx={{ p: 2, borderRadius: 2, boxShadow: "none", backgroundColor: "background.paper" }}>
                        {day.items && day.items.length ? (
                        day.items.map((it, itIdx) => {
                            const key = `${dayIdx}-${itIdx}`;
                            const hasExtra = !!it.extra;
                            return (
                            <Box
                                key={key}
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    alignItems: "flex-start",
                                    mb: 2,
                                    position: "relative",
                                }}
                                >
                                {/* Time */}
                                <Box sx={{ width: 110, textAlign: "right", pr: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{it.time}</Typography>
                                </Box>

                                {/* TIMELINE COLUMN */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        width: 30,
                                        display: "flex",
                                        justifyContent: "center",
                                        pt: "4px",
                                        minHeight: "60px",

                                        // BULLET
                                        "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        top: "6px",           // bullet sejajar status
                                        width: "10px",
                                        height: "10px",
                                        borderRadius: "50%",
                                        backgroundColor: "#4C6FFF",
                                        zIndex: 2,
                                        },

                                        // VERTICAL LINE
                                        "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        top: "15px",          // garis mulai setelah bullet
                                        height: (() => {
                                            if (hasExtra && openCollapseIndex === key) {
                                                return "700%";
                                            }
                                            if (dayIdx === 0 && itIdx === 0 && openResponIndex === key) {
                                                return "580%";
                                            }
                                            if (it.status?.toLowerCase() === "dokumen terbit" && openDraftImportIndex === key) {
                                                return "480%";
                                            }
                                            // === KONDISI DEFAULT ===
                                            return (hasExtra || (dayIdx === 0 && itIdx === 0) || it.status?.toLowerCase() === "dokumen terbit")
                                                ? "110px"
                                                : "70px";
                                        })(),
                                        width: "2px",
                                        backgroundColor: "rgba(72, 94, 144, 0.25)",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        zIndex: 1,
                                        },
                                    }}
                                />
                                {/* Body */}
                                <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{it.status}</Typography>
                                        <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                                            Dibuat oleh: <strong>{it.user}</strong>
                                        </Typography>

                                        {it.note && <Typography variant="body2" sx={{ mb: 1 }}>{it.note}</Typography>}

                                        {/* =============== Ekstra detail / Job Number / Catatan =============== */}
                                        {hasExtra && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<DescriptionIcon />}
                                                    onClick={() => handleToggleExtra(dayIdx, itIdx)}
                                                    sx={{ textTransform: "none", mb: 1 }}
                                                >
                                                    Detail
                                                </Button>

                                                <Collapse in={openCollapseIndex === key}>
                                                    <Paper variant="outlined" sx={{ p: 2, mt: 1, backgroundColor: "transparent" }}>
                                                        {it.extra.jobNumber && (
                                                            <Typography variant="body2"><strong>Membuat draft order pada nomor JOB:</strong> {it.extra.jobNumber}</Typography>
                                                        )}
                                                        {it.extra.catatan && (
                                                            <Box sx={{ mt: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Catatan:</Typography>
                                                                <Box sx={{ pl: 1 }}>
                                                                    {Object.entries(it.extra.catatan).map(([k, v]) => (
                                                                        <Typography variant="body2" key={k}>• {k}: {v}</Typography>
                                                                    ))}
                                                                </Box>
                                                            </Box>
                                                        )}
                                                    </Paper>
                                                </Collapse>
                                            </>
                                        )}

                                        {/* =============== Tombol LIHAT PENGAJUAN & RESPON DOKUMEN hanya di item terbaru =============== */}
                                        {dayIdx === 0 && itIdx === 0 && (
                                            <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={handleViewPengajuan}
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    Lihat Pengajuan
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    startIcon={<DescriptionIcon />}
                                                    onClick={() =>
                                                        setOpenResponIndex(prev =>
                                                            prev === `${dayIdx}-${itIdx}` ? null : `${dayIdx}-${itIdx}`
                                                        )
                                                    }
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    Respon Dokumen
                                                </Button>
                                            </Box>
                                        )}

                                        {/* Collapse Respon Dokumen */}
                                        {dayIdx === 0 && itIdx === 0 && responses && (
                                            <Collapse in={openResponIndex === `${dayIdx}-${itIdx}`}>
                                                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
                                                        Respon Dokumen
                                                    </Typography>

                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>No</TableCell>
                                                                <TableCell>Nomor</TableCell>
                                                                <TableCell>Jenis</TableCell>
                                                                <TableCell>Tanggal</TableCell>
                                                                <TableCell>Jam</TableCell>
                                                                <TableCell>Aksi</TableCell>
                                                            </TableRow>
                                                        </TableHead>

                                                        <TableBody>
                                                            {responses.map((r, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>{idx + 1}</TableCell>
                                                                    <TableCell>{r.responseNumber}</TableCell>
                                                                    <TableCell>{r.description}</TableCell>
                                                                    <TableCell>{r.responseDate}</TableCell>
                                                                    <TableCell>{r.responseTime || new Date(r.responseDatetime).toLocaleTimeString()}</TableCell>
                                                                    <TableCell>
                                                                        <Tooltip title="Download">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={handleDownloadResponse}
                                                                            >
                                                                                <DownloadIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Paper>
                                            </Collapse>
                                        )}
                                        {/* Tombol UNDUH DRAFT IMPORT*/}
                                        {it.status.toLowerCase() === "dokumen terbit" && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
                                            onClick={() =>
                                            setOpenDraftImportIndex(prev =>
                                                prev === `${dayIdx}-${itIdx}` ? null : `${dayIdx}-${itIdx}`
                                            )
                                            }
                                            sx={{ textTransform: "none", mt: 1}}
                                        >
                                            Unduh (Draft) Import
                                        </Button>
                                        )}
                                        {/* Collapse Draft Import */}
                                        {it.status.toLowerCase() === "dokumen terbit" && (
                                        <Collapse in={openDraftImportIndex === `${dayIdx}-${itIdx}`}>
                                            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
                                                Draft Import
                                            </Typography>

                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>No</TableCell>
                                                        <TableCell>Dokumen</TableCell>
                                                        <TableCell>Jenis Dokumen</TableCell>
                                                        <TableCell>Tanggal</TableCell>
                                                        <TableCell>Jam</TableCell>
                                                        <TableCell>Aksi</TableCell>
                                                    </TableRow>
                                                </TableHead>

                                                <TableBody>
                                                {draftImportData.map((row, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{row.dokumen}</TableCell>
                                                        <TableCell>{row.jenis}</TableCell>
                                                        <TableCell>{row.tanggal}</TableCell>
                                                        <TableCell>{row.jam}</TableCell>
                                                        <TableCell>
                                                            <Tooltip title="Download">
                                                            <IconButton 
                                                                size="small"
                                                                onClick={handleDownloadDraft}
                                                            >
                                                                <DownloadIcon fontSize="small" />
                                                            </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                    </Collapse>
                                    )}
                                </Box>
                            </Box>
                            );
                        })
                        ) : (
                        <Typography variant="body2">No events for this date.</Typography>
                        )}
                    </Paper>
                    </Box>
                ))
                ) : (
                <Typography variant="body2">Tidak ada riwayat tersedia.</Typography>
                )}
            </Box>
        </Paper>

        {/* Snackbar */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
            </Alert>
        </Snackbar>
        </Box>
    );
};

export default History;
