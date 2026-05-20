import React from "react";
import styles from './popup.module.css'
import DangerousIcon from '@mui/icons-material/Dangerous';
import ReplayIcon from '@mui/icons-material/Replay';

function Popup () {
    function refresh () {
        window.location.reload();
    }
    return (
        <>
            <div className={styles.backdrop}>
                <div className={styles.popup}>
                    <DangerousIcon style={{color: 'red', fontSize: '50px'}}/>
                    Words here!
                    <button className={styles.refresh_button} onClick={refresh}>
                        Refresh
                        <ReplayIcon style={{fontSize: '20px', marginLeft: 2}}/>
                    </button>
                </div>
            </div>
        </>
    ); 
}

export default Popup;