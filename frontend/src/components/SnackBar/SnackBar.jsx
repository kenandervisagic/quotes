import React, {useState} from 'react';
import {Alert, Snackbar} from "@mui/material";

function SnackBar({severity="info", message="User informed."}) {
    const [isOpen, setIsOpen] = useState(true);
    const handleClose=()=>{
        setIsOpen(false)
    }
    return (
        <Snackbar
            autoHideDuration={3000}
            open={isOpen}
            onClose={handleClose}
        >
            <Alert
                severity={severity}
                variant="filled"
                sx={{width: '100%'}}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}

export default SnackBar;