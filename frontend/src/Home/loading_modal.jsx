import React, { useState, useEffect } from 'react';
import styles from '../New_Make_A_Port/modal.module.css';
import { createPort } from '../user';
import { trefoil } from 'ldrs';
import { useNavigate } from 'react-router-dom';

trefoil.register();

function LoadModal() {

return (
    <div className={styles.modal_overlay}>
        <div className={styles.loading}>
                        <l-trefoil
                            size="40"
                            stroke="4"
                            stroke-length="0.15"
                            bg-opacity="0.1"
                            speed="1.4"
                            color="black"
                        ></l-trefoil>
                    </div>
    </div>
)
};



function LoadModalPorts() {

    return (
            <div className={styles.loading}>
                            <l-trefoil
                                size="40"
                                stroke="4"
                                stroke-length="0.15"
                                bg-opacity="0.1"
                                speed="1.4"
                                color="black"
                            ></l-trefoil>
                        </div>
    )
    };


    export default LoadModal;

    export {
        LoadModalPorts
    }