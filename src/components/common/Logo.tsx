import Typography from "@mui/material/Typography";
import Box from "@mui/material/Typography";

import Wheel from "./Wheel";

import { CC_APP_NAME } from "../../config/params";

export const Logo = () => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        }}
    >
        <Box
            sx={{
                position: 'relative',
                height: 134,
                width: 134,
                pb: 1,
                '& > *:nth-of-type(1)': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: 'scale(0.3)',
                    transformOrigin: 'top left',
                },
            }}
        >
            <Wheel />
        </Box>
        <Typography
            variant="h2"
            color="primary"
            width="100%"
            textAlign="center"
            fontWeight="bold"
            sx={{
                textStroke: '2px #fff',
                'WebkitTextStroke': '2px #fff',
            }}
        >
            {CC_APP_NAME}
        </Typography>
    </Box>
);

export default Logo;
