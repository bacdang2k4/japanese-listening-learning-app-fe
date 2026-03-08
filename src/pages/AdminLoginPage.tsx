import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authApi, tokenStorage } from '../services/api';

const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authApi.adminLogin({
                username: formData.username,
                password: formData.password,
            });

            // Store JWT token and admin info
            tokenStorage.setAdminToken(result.data.accessToken);
            localStorage.setItem('admin', JSON.stringify({
                id: result.data.adminId,
                username: result.data.username,
                role: result.data.role,
            }));

            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Tên đăng nhập hoặc mật khẩu admin không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                padding: 2,
            }}
        >
            <Card sx={{ maxWidth: 450, width: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <AdminPanelSettings sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            Admin Panel
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Đăng nhập để quản trị hệ thống JPLearning
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Tên đăng nhập"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mb: 2, py: 1.5 }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={20} color="inherit" />
                                    Đang đăng nhập...
                                </Box>
                            ) : (
                                'Đăng nhập Admin'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdminLoginPage;
