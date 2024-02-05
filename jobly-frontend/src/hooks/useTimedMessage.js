import { useRef, useState, useEffect } from "react";
import { act } from "react-dom/test-utils";


// DOCUMENT HERE
function useTimedMessage(time = 3000) {
    const [active, setActive] = useState(false)
    const messageShownRef = useRef(false)
    useEffect(
        function showSavedMessage() {
            console.debug(
                "useTimedMessage useEffect showSavedMessage", "active=", active);
            if (active && !messageShownRef.current) {
                messageShownRef.current = true
                setTimeout(function removeMessage() {
                    setActive(false)
                    messageShownRef.current = false
                }, time)
            }
        }, [active, time]
    )
    return [active, setActive]
}

export default useTimedMessage