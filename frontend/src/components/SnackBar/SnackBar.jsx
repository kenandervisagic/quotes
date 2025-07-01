import React, {useEffect, useState} from 'react';
import {Box, Snackbar} from "@mui/material";

function SnackBar({severity = "info", message = "User informed."}) {
    const [isOpen, setIsOpen] = useState(true);
    const handleClose = () => {
        setIsOpen(false)
    }
    const [backgroundColor, setBackgroundColor] = useState("var(--color-info)");

    useEffect(() => {
        switch (severity) {
            case "success":
                setBackgroundColor("var(--color-success)");
                break;
            case "error":
                setBackgroundColor("var(--color-error)");
                break;
            case "warning":
                setBackgroundColor("var(--color-warning)");
                break;
            default:
                setBackgroundColor("var(--color-info)");
                break;
        }
    }, [severity]);


    return (
        <Snackbar
            autoHideDuration={3000}
            open={isOpen}
            onClose={handleClose}
        >
            <Box sx={{
                width: '100%',
                backgroundColor: backgroundColor,
                padding: '6px 16px',
                color: 'white',
                fontWeight: '500',
                borderRadius: '4px'
            }}>
                {message}
            </Box>
        </Snackbar>
    );
}

export default SnackBar;