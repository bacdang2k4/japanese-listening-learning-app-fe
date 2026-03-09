import React from 'react';
import { Navigate } from 'react-router-dom';
import { tokenStorage } from '@/services/api';

interface LearnerRouteGuardProps {
    children: React.ReactNode;
}

const LearnerRouteGuard: React.FC<LearnerRouteGuardProps> = ({ children }) => {
    const token = tokenStorage.getLearnerToken();
    const learnerData = localStorage.getItem('learner');

    if (!token || !learnerData) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default LearnerRouteGuard;
