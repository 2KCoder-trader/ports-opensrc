import React from "react";
import * as Mui from "@mui/material";


function Error() {

    return (
        <Mui.Box sx = {{
            width: "100%",
            height: "100vh",
            justifyContent: "center",
            alignItems: "center",
        }}>
        <Mui.Typography  color="error" sx={{
            textAlign: "center",
            justifySelf: "center",
        }}>Error 404: Page not found</Mui.Typography>
        </Mui.Box>
    );

}

export default Error;