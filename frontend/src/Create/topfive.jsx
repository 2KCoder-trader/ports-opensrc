import React , {useState , useEffect} from 'react';
import styles from './page.module.css';
import AddIcon from '@mui/icons-material/Add';


function Stock({ symbol , percent , volume , price , fullName, onClick }) {
    function colorCode(value, type) {
        let color;
        let new_value;
        if (value > 0){
          color = 'green';
          if (type === 'percent'){
            new_value = '+' + value + '%';
          } else if (type === 'dollar'){
            new_value = '+' + value;
          }
        }
        else if (value < 0) {
          color = 'red';
          if (type === 'percent'){
    
            new_value = value + '%';
          } else if (type === 'dollar'){
            new_value = '-'+ value.toString().slice(1);
          }
        } else {
          color = '#1B263B';
        }
        return <span style={{color: color}}>{new_value}</span>;
    }
    return (
        <div className={styles.stock_grid} onClick={onClick}>
            <div className={styles.stock_label} style={{fontSize: '1.1vw'}}>{symbol}</div>
            <div className={styles.stock_label}>{fullName}</div>
            <div className={styles.stock_label} style={{fontSize: '1.1vw'}}>{colorCode(percent, 'dollar')}</div>
            <div className={styles.stock_label} style={{fontSize: '1.1vw'}}>${price}</div>
            <div className={styles.stock_label}>{volume}</div>
            <div className={styles.add_icon} onClick={onClick}>
                <AddIcon/>
            </div>
        </div>
    );
}

const temp = [{symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}]

function TopFive({data, setSelectedStocks}) {

    const handleAddClick = (fullName) => {
        const jsonObject = {stock: fullName};
        setSelectedStocks(prevSelectedStocks => [...prevSelectedStocks, jsonObject]);
    }
    
    const stocks = data.map((stock, index) => (
        <div className='flex-item' key={index}>
            <Stock symbol={stock.symbol} percent = {stock.percent} volume = {stock.volume} price = {stock.price} fullName = {stock.fullName} onClick={() =>  handleAddClick(stock.symbol)} />
        </div>
    ));
    // 
    // if (!searchQuery.trim()|| filtered_data.length === 0) {
    //     return null;
    // }

    

    return (
        <div className={styles.search_results_wrap} style={{marginTop: 20}}>
            <div className={styles.topfive_title}>
                Top Five Movers
            </div>
            <div>
                <div className= {styles.search_headers}>
                    <div className= {styles.search_results_grid}>
                        <div className={styles.stock_grid_header}>
                            <div className={styles.stock_label}>Symbol</div>
                            <div className={styles.stock_label}>Name</div>
                            <div className={styles.stock_label}>Percent Change</div>
                            <div className={styles.stock_label}>Price</div>
                            <div className={styles.stock_label}>Volume</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.search_results}>
                <div className={styles.search_results_grid}>
                    {stocks}
                </div>
            </div>
        </div>
    );
}
export default TopFive;