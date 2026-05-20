import React , {useState , useEffect} from 'react';
import styles from './port_draft.module.css';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';
import { GiConsoleController } from 'react-icons/gi';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Grid from '@mui/joy/Grid';


function ToggleButtons({position, setPosition}) {
    const handlePosition = (event, newPosition) => {
        // if (newPosition !== null) {
        setPosition(newPosition);
        //   }
        
    };
  
    return (
      <ToggleButtonGroup
        size= "small"
        value={position}
        exclusive
        onChange={handlePosition}
        aria-label="postion type"
        sx={{
            borderRadius: 0, // Remove border radius from ToggleButtonGroup
          }}
        className={styles.ss_toggle}
      >
        <ToggleButton value="long" sx={{
             color: 'white',
             fontSize: '10px', // Adjust the font size to make the buttons smaller
             padding: '0px 0px', // Adjust the padding to make the buttons smaller
             minWidth: '40px',
             borderColor: 'white',
             '&.Mui-selected': {
            backgroundColor: 'white', // Change this to your desired selected color
            color: '#1B263B', // Change text color if needed
            '&:hover': {
              backgroundColor: 'white', // Change this to your desired selected color
              color: '#1B263B', // Change text color if needed
            }, 
            }
             }}>LONG</ToggleButton>
        <ToggleButton value="short" sx={{
             color: 'white', 
             fontSize: '10px', // Adjust the font size to make the buttons smaller
             padding: '0px 0px', // Adjust the padding to make the buttons smaller
             minWidth: '40px',
             borderColor: 'white',
             '&.Mui-selected': {
            backgroundColor: 'white', // Change this to your desired selected color
            color: '#1B263B', // Change text color if needed
            '&:hover': {
              backgroundColor: 'white', // Change this to your desired selected color
              color: '#1B263B', // Change text color if needed
            }, 
            }
             }}>SHORT</ToggleButton>
      </ToggleButtonGroup>
    );
  }



function SelectedStock({index, symbol, price, spercent, onClick,modified, setModified, setSelectedStocks}) {

    const [disPercent, setDisPercent] = useState(spercent);
    const [position, setPosition] = useState("long");
    const [maxLength, setMaxLength] = useState(4);
    
    const handleInputChange = (e) => {

        const value = e.target.value;
        // Allow only numbers up to one decimal place
        if (/^\d*\.?\d{0,1}$/.test(value)) {
        
        setDisPercent(e.target.value);
        setModified(true);
        setSelectedStocks(prevSelectedStocks => {
            // Create a copy of the previous state array
            const updatedStocks = [...prevSelectedStocks];
            
            // Modify the specific element at the given index
            updatedStocks[index] = {
                ...updatedStocks[index],
                percent: e.target.value,
            };
            
            // Return the modified array to update the state
            return updatedStocks;
            
        });}
    }

    useEffect(() => {
        if (parseFloat(disPercent) < 10){
            setMaxLength(3);
        } else {
            setMaxLength(4);
        }
    }, [disPercent]);

    useEffect(() => {
        setDisPercent(spercent);
        
    }, [spercent]);
    

    useEffect(() => {
        setSelectedStocks(prevSelectedStocks => {
            // Create a copy of the previous state array
            const updatedStocks = [...prevSelectedStocks];
            
            // Modify the specific element at the given index
            updatedStocks[index] = {
                ...updatedStocks[index],
                position: position,
            };
            
            // Return the modified array to update the state
            return updatedStocks;
        });
    }, [position]);

    function colorCode(value, type) {
        let color;
        let new_value;
        if (value > 0){
          color = 'green';
          if (type === 'percent'){
            new_value = '+' + value + '%';
          } else if (type === 'dollar'){
            new_value = '$' + value;
          }
        }
        else if (value < 0){
          color = 'red';
          if (type === 'percent'){
    
            new_value = value + '%';
          } else if (type === 'dollar'){
            new_value = '-$'+ value.toString().slice(1);
          }
        } else {
          color = '#1B263B';
        }
        return <span style={{color: color}}>{new_value}</span>;
    }

    return (
        <div className={styles.selected_stock}>
            <div className={styles.ss_front}>
                <div style={{flex: 1, marginLeft: 50}}>
                    {symbol}            
                </div>
                <div className={styles.ss_back}>
                    <div className={styles.percentage} >
                        <input value={disPercent} onChange={handleInputChange} className={styles.percent_input} />
                        %
                    </div>
                </div>
            </div>
            <Grid container justifyContent="center" spacing={4} style={{fontSize: 18}}>
                <Grid item xs={6} style={{textAlign: 'right'}}>
                    Price
                </Grid>
                <Grid item xs={6}>
                    <div className={styles.ss_middle}>
                        {colorCode(parseFloat(price).toFixed(2), 'dollar')}
                    </div>
                </Grid>
            </Grid>

            {/* <Grid container justifyContent="center" spacing={4} style={{fontSize: 18}}>
                <Grid item xs={6} style={{textAlign: 'right'}}>
                    Position
                </Grid>
                <Grid item xs={6}>
                    <div className={styles.ss_toggle}>
                        Long
                    </div>
                </Grid>
            </Grid> */}

            <Grid container justifyContent="center" spacing={4} style={{fontSize: 18}}>
                <Grid item xs={6} style={{textAlign: 'right'}}>
                    {/* Daily Change */}
                </Grid>
                <Grid item xs={5}>
                    {/* <div className={styles.ss_middle}>
                        {colorCode(5, 'percent')}
                    </div> */}
                </Grid>
                <Grid item xs={1}>
                    <div className={styles.ss_delete} onClick={onClick}>
                        <div className={styles.ss_delete_icon}>
                            <DeleteOutlineIcon fontSize={'small'} />
                        </div>
                    </div>
                </Grid>
            </Grid>

            
            
        </div>
    );
}

function PortDraft({data, selectedStocks, setSelectedStocks}) {
    const [modified, setModified] = useState(false);

    useEffect(() => {
        if (selectedStocks.length === 0) {
            setModified(false);
        }
    }, [selectedStocks.length]);


    useEffect(() => {
        let selectedStockPrices = data.map(stock => ({
            symbol: stock.symbol,
            price: stock.price
        }));
        let selectedStockSymbols = selectedStocks.map(stock => stock.stock);
        selectedStockPrices = selectedStockPrices.filter(row => selectedStockSymbols.includes(row.symbol));
        
        
        // console.log("selectedStockPrices: ", selectedStocks);

        let modifiedSelectedStocks = selectedStocks.map(stock => {
            if (stock.price === undefined) {
                
                const stockPrice = selectedStockPrices.filter(row => row.symbol === stock.stock)[0].price;
                return {...stock, price: stockPrice};
            } else {
                return stock;
            }
        });
        
        // setSelectedStocks(modifiedSelectedStocks);
        // const newselectedStocks = data.filter(row => selectedStockPrices.includes(row.symbol));

        if (!modified) {
            const percentage = ((100 / selectedStocks.length).toFixed(1));
            const remainder = (100 - (percentage * (selectedStocks.length-1))).toFixed(1);
            modifiedSelectedStocks = modifiedSelectedStocks.map((stock, index) => ({...stock, percent: index === 0 ? (remainder) : (percentage)}));
            setSelectedStocks(modifiedSelectedStocks);
        } else {
            modifiedSelectedStocks = modifiedSelectedStocks.map(stock => ({
                ...stock,
                percent: stock.percent !== undefined ? stock.percent : ""
            }));
            setSelectedStocks(modifiedSelectedStocks);
        }
        
        // setFilteredData(newfilteredData);
    }, [selectedStocks.length]);
    const handleDropClick = (fullName) => {
        setSelectedStocks(prevSelectedStocks => prevSelectedStocks.filter(stock => stock.stock !== fullName));
    }
    

    let stock_arr = [];
    for(let i =0; i < selectedStocks.length; i++) {
        stock_arr.push(selectedStocks[i].stock);
    }

    const selected_stocks = selectedStocks.map((stock, index) => (
        <div className='flex-item' key={index}>
            <SelectedStock index={index} symbol={stock.stock} price = {stock.price} spercent = {stock.percent} onClick={() =>  handleDropClick(stock.stock)} setModified={setModified} modified={modified} selectedStocks={selectedStocks} setSelectedStocks={setSelectedStocks}/>
        </div>
    ));

    return (
        <div style={{width: '100%'}}>
            <div className={styles.list_wrap}>
                {/* {selected_stocks.length > 0 && (
                    <div className={styles.port_draft_headers}>
                        <div className={styles.stock_label}>Symbol</div>
                        <div className={styles.stock_label}>Price</div>
                        <div className={styles.stock_label}>Position</div>
                        <div className={styles.stock_label}>Weight</div>
                    </div>
                )} */}
                <div className={styles.list}>   
                    {selected_stocks}
                </div>
            </div>
        </div>
    );
}

export default PortDraft;