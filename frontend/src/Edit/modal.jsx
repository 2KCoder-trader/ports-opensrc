import React, { useState, useEffect } from 'react';
import styles from './modal.module.css';
import { createPort, investPort } from '../user';
import { trefoil } from 'ldrs';
import { useNavigate } from 'react-router-dom';
import { set } from 'date-fns';
import SecureStorage from 'react-secure-storage';
import PortDraft from './port_draft';

trefoil.register();


function Listing({data, selectedStocks, setSelectedStocks, title, description, sector, investment, setPortCreated}) {
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState('');
    console.log("selectedStocks", selectedStocks);

    async function handleBuildPort(e) {
        const stocks = selectedStocks.map(sstock => sstock.stock);
        const stockfmtstring = stocks.join(' ');
        const percentages = selectedStocks.map(sstock => sstock.percent);
        const percentagefmtstring = percentages.join(' ');
        // const positions = selectedStocks.map(sstock => sstock.position);
        const positions = [];
        for(let i = 0; i < selectedStocks.length; i++){
            positions.push("long");
        }
        const position_typesfmtstring = positions.join(' ');
        const display_title = title.trim();
    
        if (!display_title) {
            setError('Title is required');
            return;
        }
            

        const display_description = description.trim();
        if (!display_description) {
            setError('Description is required');
            return;
        }
        // for comp
        // const moneyValue = parseFloat(investment);
        // if (isNaN(moneyValue) || moneyValue <= 5) {
          
        //     setError('Money must be greater or equal to $5.');
        //     return;
        // }
    
        const username = SecureStorage.getItem('username');
        const user_id = SecureStorage.getItem('userId');
    
        // Start loading
        setLoading(true);
        setError('');
    
        const createdPort = await createPort(display_title, user_id, stockfmtstring, percentagefmtstring, display_description, position_typesfmtstring,sector);

        setSelectedStocks([]);
        setPortCreated(true);
        // for comp
        // await investPort(createdPort, user_id, moneyValue)
        setLoading(false);
    }


    if (selectedStocks.length === 0) {
        return (
            <div style={{flex: 1, justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '50vh'}}>
                <div style={{fontSize: 20, opacity: 0.5, textAlign: 'center', width: '50%', }}>
                    Add some stocks and they will show up here!
                </div>
            </div>
        );
    } else if (selectedStocks.length < 5) {
        return (
            <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                <div className={styles.bar_container}>
                    <div style={{flex: selectedStocks.length, backgroundColor: '#080823', opacity: 0.6}}/>
                    <div style={{flex: 5 - selectedStocks.length}}/>
                </div>
                <div style={{fontWeight: 'bold'}}>
                    {selectedStocks.length}/5
                </div>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90%'}}>
                    <PortDraft data={data} selectedStocks={selectedStocks} setSelectedStocks={setSelectedStocks}/>
                </div>
                <div style={{fontSize: 20, opacity: 0.5, textAlign: 'center', width: '90%', margin: 20}}>
                    Add {5 - selectedStocks.length} more to finish the portfolio.
                </div>
            </div>
        );
    } else {
        return (
            <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                <div className={styles.bar_container}>
                    <div style={{flex: selectedStocks.length, backgroundColor: '#080823', opacity: 0.6}}/>
                    <div style={{flex: 20 - selectedStocks.length}}/>
                </div>
                <div style={{fontWeight: 'bold'}}>
                    {selectedStocks.length}/20
                </div>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '90%'}}>
                    <PortDraft data={data} selectedStocks={selectedStocks} setSelectedStocks={setSelectedStocks}/>
                </div>
                <div>
                    {!loading && (<div className={styles.build_button} onClick={handleBuildPort}>Create</div>)}
                </div>
                {error != '' && <div className={styles.error}>{error}</div>}
                {loading && (
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
                )}
            </div>  
        );
    }
}

function Modal({ data, handleClose, selectedStocks, setSelectedStocks, sumOfPercentages, sector}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [investment, setInvestment] = useState('');
    const [portCreated, setPortCreated] = useState(false);
    // const [isMin5, setIsMin5] = useState(false);
    const navigate = useNavigate();

    // useEffect(() => {
    //     for(let i = 0; i < selectedStocks.length; i++){
    //         if (selectedStocks[i].percent < 5){
    //             setIsMin5(false);
    //             break;
    //         }
    //         setIsMin5(true);
    //     }
    // }, [selectedStocks]);


    function handleCreationClose() {
        setPortCreated(false);
        handleClose();
        navigate('/home');

    }
    
    return (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <div className={styles.modal}>
                <div>
                    <input className={styles.title_input} placeholder="Port Name" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
                </div>
                <div>
                    <textarea className={styles.description_input} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600}></textarea>
                </div>
                <div style={{justifyContent: 'center', display: 'flex'}}>
                    <div className={styles.investment_container}>
                        {/* <div style={{width: '100%'}}>
                            Investment Amount:
                        </div>
                        for comp
                        <input type='number' className={styles.investment_input} placeholder='$' value={investment} onChange={(e) => setInvestment(e.target.value)} />*/}
                    </div> 
                </div>
            </div>
            <Listing data={data} selectedStocks={selectedStocks} setSelectedStocks={setSelectedStocks} title={title} description={description} sector={sector} investment={investment} setPortCreated={setPortCreated}/>
            {portCreated && 
                <div className={styles.modal_overlay}>
                    <div className={styles.modal}>
                        <div>
                            <div style={{fontSize: '20px', padding: 20}}>Portfolio Created</div>
                            <div className={styles.modal_close_button} onClick={handleCreationClose}>Home</div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default Modal;