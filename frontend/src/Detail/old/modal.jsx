import React, { useState, useEffect } from 'react';
import styles from './modal.module.css';
import { Denied, getLoginUsers, createEmail, investPort, getDPorts} from '../../user';
import { useNavigate } from 'react-router-dom';
import SecureStorage from 'react-secure-storage';


function DenyModal(data) {  
    const [reason, setReason] = useState('');
    const navigate = useNavigate();

    const handleDenied = async () => {
      getLoginUsers(data.author)
      .then(f => {
        createEmail(f['email'],`Thank you for submitting your port “${data.name}” for review! Your port has been approved and is now public on the website.`,`${f["username"]} Port Rejection - ${data.name}`)
     
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
        await Denied(SecureStorage.getItem('port_id'));
        navigate("/secret_home")
      }
    
    return (
        <div className={styles.modal_overlay}>
            <div className={styles.modal}>
                <div>
                    <div>Reason</div>
                    <textarea className={styles.description_input} value={reason} onChange={(e) => setReason(e.target.value)}></textarea>
                        <div className={styles.build_button} onClick={handleDenied}>Submit</div>
                </div>

           
            </div>
        </div>
    );

}



function AmountModal({ invest,setError,handleClose,setReRender, reRender}){
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers up to one decimal place
   
    if (/^\d*\.?\d{0,1}$/.test(value)) {
      setAmount(value);
    }
  };


  const handleInvest = async () => {
 
      // createEmail()

      


      if (amount === undefined || amount === '') {
        setError("Please enter an amount");
        return;
      }
      if ((amount.match(/\./g) || []).length > 1) {
        setError("Invalid Input Amount: Too many decimal points");
        return;
      }
      try{
        const amountDouble = parseFloat(amount);
        if (amountDouble < 0){
          setError("Please enter a positive amount");
          return;
        }
      } catch (error){
        setError("Invalid Input Amount");
        return;
      }
      let amountDouble = parseFloat(amount);
      if (!invest){
        amountDouble = -amountDouble;
      }
      setLoading(true);
      const response = await investPort(SecureStorage.getItem('port_id'), SecureStorage.getItem('user_id'), amountDouble);
      setAmount('');
      if (response == "Reserve Divestment successful and investment deleted"){
        navigate("/home");
      }
      setError(response);
      setLoading(false);
      if (SecureStorage.getItem('Current Page') === 'Port Market'){
        SecureStorage.setItem('Current Page','My Ports');
      }
      setReRender(reRender + 1);
      handleClose();
      setLoading(false);
  }



  return (
    <div className={styles.modal_overlay}>
        <div className={styles.modal}>
            <div>
                <div className={styles.modal_close_button} onClick={handleClose}>X</div>
                <div className={styles.amount_label}>Enter Amount</div>
                <div className={styles.input_container}>$<input type = "text" className={styles.input} value={amount} onChange={handleAmountChange} placeholder='$5 minimum'></input></div>
                    {loading? (<div className={styles.loading}>
                        <l-trefoil
                            size="40"
                            stroke="4"
                            stroke-length="0.15"
                            bg-opacity="0.1"
                            speed="1.4"
                            color="black"
                        ></l-trefoil>
                    </div>):(<div className={styles.build_button} onClick={handleInvest}>{invest ? "Confirm Buy" : "Confirm Sell"}</div>)}
            </div>

       
        </div>
    </div>
);
}

export{AmountModal, DenyModal};