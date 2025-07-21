import { useEffect } from "react";

function useEnterKey(callback) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                callback();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        //정리
        return () => { window.removeEventListener('keydown', handleKeyDown); }
    },[callback]);

}

export default useEnterKey;