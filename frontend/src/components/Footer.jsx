import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const Footer = () => {
    let currDate = new Date()
    return (
        <Container maxWidth="sm">
            <Typography variant="body1" align="center">
                © 2025 ASU
            </Typography>
            
            
        </Container>
    );
}

export default Footer;
