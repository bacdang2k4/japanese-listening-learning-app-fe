import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteGuardProps {
    children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
    const adminData = localStorage.getItem('admin');
    const adminToken = localStorage.getItem('admin_token');

    if (!adminData || !adminToken) {
        return <Navigate to="/login" replace />;
    }

    try {
        const admin = JSON.parse(adminData);
        // Backend returns role as "ROLE_ADMIN"
        if (admin.role !== 'ROLE_ADMIN' && admin.role !== 'ADMIN') {
            return <Navigate to="/login" replace />;
        }
    } catch {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default AdminRouteGuard;
