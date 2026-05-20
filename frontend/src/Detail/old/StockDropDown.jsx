import React from 'react';
import s from './sdd.module.css';
const StockDropDown = ({data}) => {
    const data_last = data.length -1 ;

    const not_last = data.slice(0, -1).map((stock, index) => (
        <>
        <div className={s.quick_info_label}>{Object.keys(stock)[0]}</div>
        <div className={s.quick_info_value}>{stock[Object.keys(stock)[0]].toFixed(1)}%</div>
        </>
    )
    );

    return (
        <>
            {not_last}
            <div className={s.quick_info_label_last}>{Object.keys(data[data_last])[0]}</div>
            <div className={s.quick_info_value_last}>{data[data_last][Object.keys(data[data_last])[0]].toFixed(1)}%</div>
            </>
    );
};

export default StockDropDown;