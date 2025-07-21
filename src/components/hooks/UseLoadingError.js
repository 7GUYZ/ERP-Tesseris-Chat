import { useState } from "react";

export function UseLoadingError() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const uiStatus = {
        start: () => setLoading(true),
        stop: () => setLoading(false),
        setError,
        reset: () => setError(null),
    };
    return {loading, error, uiStatus}
}