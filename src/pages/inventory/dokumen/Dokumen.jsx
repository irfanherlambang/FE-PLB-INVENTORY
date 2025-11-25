import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  AccessTime,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert
} from '@mui/icons-material';
import api from '../../../api/api';
import { useNavigate } from 'react-router-dom';

const Dokumen = () => {
  // State management
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // -----
  const handleLihatPengajuan = () => {
    if (selectedRow) {
      navigate(`/inventory/dokumen/${selectedRow.id}`);
    }
    handleMenuClose();
  };

  const handleRiwayatOrder = () => {
    if (selectedRow) {
      navigate(`/inventory/dokumen/history/${selectedRow.id}`);
    }
    handleMenuClose();
  };

  // const handleDelete = () => {
  //   console.log('Delete:', selectedRow);
  //   // TODO: Implement delete functionality
  //   handleMenuClose();
  // };
  // -----

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    nomorJob: '',
    jenisPengajuan: '',
    referensi: '',
    dokumen: '',
    importirExportir: '',
    pengajuanVia: '',
    tdsStatus: '',
    mandiriStatus: ''
  });

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      params.append('page', (page + 1).toString());
      params.append('limit', rowsPerPage.toString());

      const response = await api.inventory.dokumen.search(params.toString());

      if (response.data.kode === 200) {
        setData(response.data.data || []);
        setTotalRows(response.data.total || 0);
        setLastUpdate(new Date());
      } else {
        setError('Gagal memuat data');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Terjadi kesalahan saat memuat data');
      setSnackbarOpen(true);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      nomorJob: '',
      jenisPengajuan: '',
      referensi: '',
      dokumen: '',
      importirExportir: '',
      pengajuanVia: '',
      tdsStatus: '',
      mandiriStatus: ''
    });
  };

  const applyFilters = () => {
    setPage(0);
    setFilterDialogOpen(false);
    fetchData();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();

    if (['selesai', 'completed', 'approved'].includes(s)) {
      return {
        bgcolor: 'rgba(56, 142, 60, 0.15)', // green-ish soft
        color: '#2e7d32',
      };
    }

    if (['proses', 'process', 'pending'].includes(s)) {
      return {
        bgcolor: 'rgba(255, 171, 0, 0.15)', // amber soft
        color: '#b28704',
      };
    }

    if (['ditolak', 'rejected', 'failed'].includes(s)) {
      return {
        bgcolor: 'rgba(211, 47, 47, 0.15)', // red soft
        color: '#b71c1c',
      };
    }

    return {
      bgcolor: 'rgba(0,0,0,0.05)',
      color: 'rgba(0,0,0,0.6)',
    };
  };


  return (
    <Box sx={{ p: 0, minHeight: '0' }}>
      {/* Header Section */}
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
          Dokumen Deklarasi
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Manajemen dokumen dan pengajuan
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


        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton
            onClick={handleRefresh}
            sx={{
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            <RefreshIcon />
          </IconButton>

          {lastUpdate && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Terakhir diperbarui: {lastUpdate.toLocaleString('id-ID')}
            </Typography>
          )}
        </Box>


        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={activeFilterCount} color="primary">
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              Filter
            </Button>
          </Badge>
          {activeFilterCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Reset Filter
            </Button>
          )}
        </Box>
      </Box>

      {/* Table Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>NO</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>NOMOR JOB</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>JENIS PENGAJUAN</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>REFERENSI</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>DOKUMEN</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>IMPORTIR/EXPORTIR</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>PENGAJUAN VIA</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>PEMBUATAN ORDER</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>TDS STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>MANDIRI STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>AKSI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((row, index) => (
                      <TableRow
                        key={row.id || index}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                          }
                        }}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.nomorJob || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.jenisPengajuan || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.referensi || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.dokumen || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.importirExportir || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.pengajuanVia || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {row.pembuatanOrder ? new Date(row.pembuatanOrder).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={row.tdsStatus || 'Unknown'}
                            size="small"
                            sx={{
                              fontWeight: 550,
                              minWidth: 80,
                              minHeight: 25,
                              borderRadius: 3,

                              ...getStatusStyle(row.tdsStatus)
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={row.mandiriStatus || 'Unknown'}
                            size="small"
                            sx={{
                              fontWeight: 550,
                              minWidth: 80,
                              minHeight: 25,
                              borderRadius: 3,

                              ...getStatusStyle(row.mandiriStatus)
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => handleMenuOpen(e, row)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              }
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          Tidak ada data yang ditemukan
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {data.length > 0 && (
              <Box sx={{ borderTop: '1px solid #e0e0e0' }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={totalRows}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Baris per halaman:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
                  }
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Filter Dokumen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gunakan filter di bawah untuk menyaring data
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Row 1 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Nomor Job"
                value={filters.nomorJob}
                onChange={(e) => handleFilterChange('nomorJob', e.target.value)}
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Jenis Pengajuan</InputLabel>
                <Select
                  value={filters.jenisPengajuan}
                  label="Jenis Pengajuan"
                  onChange={(e) => handleFilterChange('jenisPengajuan', e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="import">Import</MenuItem>
                  <MenuItem value="export">Export</MenuItem>
                  <MenuItem value="mutasi">Mutasi</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Row 2 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Referensi"
                value={filters.referensi}
                onChange={(e) => handleFilterChange('referensi', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="Dokumen"
                value={filters.dokumen}
                onChange={(e) => handleFilterChange('dokumen', e.target.value)}
                size="small"
              />
            </Stack>

            {/* Row 3 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Importir/Exportir"
                value={filters.importirExportir}
                onChange={(e) => handleFilterChange('importirExportir', e.target.value)}
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Pengajuan Via</InputLabel>
                <Select
                  value={filters.pengajuanVia}
                  label="Pengajuan Via"
                  onChange={(e) => handleFilterChange('pengajuanVia', e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                  <MenuItem value="mobile">Mobile</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* Row 4 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>TDS Status</InputLabel>
                <Select
                  value={filters.tdsStatus}
                  label="TDS Status"
                  onChange={(e) => handleFilterChange('tdsStatus', e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Mandiri Status</InputLabel>
                <Select
                  value={filters.mandiriStatus}
                  label="Mandiri Status"
                  onChange={(e) => handleFilterChange('mandiriStatus', e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => {
              clearFilters();
              setFilterDialogOpen(false);
            }}
            startIcon={<ClearIcon />}
            sx={{ textTransform: 'none' }}
          >
            Reset
          </Button>
          <Button
            onClick={() => setFilterDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={applyFilters}
            startIcon={<SearchIcon />}
            sx={{
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            }}
          >
            Terapkan Filter
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            minWidth: 180,
          }
        }}
      >
        <MenuItem onClick={handleLihatPengajuan}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lihat Pengajuan</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRiwayatOrder}>
          <ListItemIcon>
            <AccessTime fontSize="small" />
          </ListItemIcon>
          <ListItemText>Riwayat Order</ListItemText>
        </MenuItem>

        {/* <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Hapus</ListItemText>
        </MenuItem> */}
      </Menu>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dokumen;