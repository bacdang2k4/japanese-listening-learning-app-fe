import { useState, useCallback } from 'react';

const PROFILE_KEY = 'activeProfileId';

export function useActiveProfile() {
    const [profileId, setProfileIdState] = useState<number | null>(() => {
        const stored = localStorage.getItem(PROFILE_KEY);
        return stored ? Number(stored) : null;
    });

    const setProfileId = useCallback((id: number) => {
        localStorage.setItem(PROFILE_KEY, String(id));
        setProfileIdState(id);
    }, []);

    const clearProfileId = useCallback(() => {
        localStorage.removeItem(PROFILE_KEY);
        setProfileIdState(null);
    }, []);

    return { profileId, setProfileId, clearProfileId };
}

export function getActiveProfileId(): number | null {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? Number(stored) : null;
}
