import React , {useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './page.module.css';
import { getStocks, getStocksPerc, portDraftVisual } from '../user';
import SearchResults from './searchresults';
import PortDraft from './port_draft';
import Modal from './modal';

// import { TopBar } from '../Home/homev2';

import { TopBar } from '../Home/homev2';

// import Header from '../../old_stuff/New_Header_Navigation/navbar';
// import Footer from '../New_Footer/footer';
import CreationData from './creationGraph';
import SecureStorage from 'react-secure-storage';
import dd from '../Home/home.module.css';
import Grid from '@mui/joy/Grid';
import BackArrow from '../Home/back_arrow.png';
import { Button, Typography } from '@mui/material';
import TopFive from './topfive.jsx';

// function SearchBar ({searchQuery, setSearchQuery }) {
//     return (
//         <div className={styles.searchbar_wrap}>
//             <input type="text" 
//             placeholder="Enter Ticker or Company Name"
//             value={searchQuery}
//             className={styles.searchbar}
//             onChange={(e) => setSearchQuery(e.target.value)} />
//         </div>
//     );
// }
// function removeNulls(data) {
//     if (Array.isArray(data)) {
//       // Filter each element of the array
//       return data
//         .map(item => removeNulls(item)) // Recursively remove nulls
//         .filter(item => item !== null);  // Remove null elements
//     } else if (data !== null && typeof data === 'object') {
//       // Filter each property of the object
//       return Object.fromEntries(
//         Object.entries(data)
//           .map(([key, value]) => [key, removeNulls(value)]) // Recursively remove nullsHome (2 Cedar Ct)
//           .filter(([key, value]) => value !== null) // Remove null properties
//       );
//     } else {
//       // Return other data types as is
//       return data;
//     }
//   }

function MakeAPort() {
    return (
        <div className={styles.structure}>
            <TopBar />
            <TemplateEditPort />
        </div>
    );
}

const temp = [{symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {symbol: 'AAPL', stock: 'AAPL', percent: -2.07, price: 145.56, volume: 153274720, fullName: "Apple Inc"}, {symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}]

function TemplateEditPort(id) {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('General');
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [draftValues, setDraftValues] = useState({});
    const handleShowModal = () => {
        setShowModal(true);
    }


    useEffect(() => {

    const getSelectedStocks = async () => {
    const port = await getPort(id);
    setSelectedStocks(port.portStocks)
    }
    getSelectedStocks();
    }, [])


    useEffect(() => {
        const fetchDraftValues = async () => {
            let completedSelectedStocks = true;
            if (selectedStocks.length === 0) {
                completedSelectedStocks = false;
                setDraftValues({});
            }
            for (const stock of selectedStocks) {
                if (!stock.percent || !stock.stock || !stock.price) {
                    completedSelectedStocks = false;
                    break;
                }
            }

            if (completedSelectedStocks) {
                const stocks = selectedStocks.map(stock => stock.stock);
                const percents = selectedStocks.map(stock => parseFloat((parseFloat(stock.percent)*100).toFixed(0)));
                const prices = selectedStocks.map(stock => stock.price*100);


                const sector = selectedOption;  
                const transformedStockInfo = { stocks, percents, prices, sector };
            

                const draftValues = await portDraftVisual(transformedStockInfo);
               
                setDraftValues(draftValues);
            }
        };
        fetchDraftValues();
    } , [selectedStocks, selectedOption]);

        
    const handleCloseModal = () => setShowModal(false);

    useEffect(() => {
        async function loadData() {
            if (searchQuery.length === 0) {
                setData([]);
            } else {
                const raw_data = await getStocks(searchQuery);
                
                const data = raw_data.content.map(stock => ({ symbol: stock.ticker, percent: stock.dailyChange.toFixed(2), price: stock.price.toFixed(2), volume: stock.volume, fullName: String(stock.fullName)}));
                setData(data);
            }
        }
        async function loadSelectedStocks() {
            if (isEditing && data.length > 0) {
                const portId = SecureStorage.getItem('port_id');
                const stocks = await getStocksPerc(portId);
                const symbols = stocks.map(stock => ({stock:Object.keys(stock)[0]}));
                setSelectedStocks(symbols);
            }
        }
        loadSelectedStocks();
        loadData();
        // V is causing it to run twice
    }, [data.length, searchQuery, isEditing]);


    const percentages = selectedStocks.map(sstock => {
        try {
            const parsed = parseFloat(sstock.percent);
            return isNaN(parsed) ? 0 : parsed;
        } catch (error) {
            console.error(`Error parsing percent for stock: ${sstock}`, error);
            return 0;
        }
    });

    const sumOfPercentages = percentages.reduce((acc, curr) => acc + parseFloat(curr), 0).toFixed(5);
    const sumOfPercentagesDisplay = Math.floor(sumOfPercentages * 100000) / 100000;
    function colorCode(value){
        if (value == 100){
            return <span style={{color: 'green'}}>{sumOfPercentagesDisplay}%</span>;
        }else{
            return <span style={{color: 'red'}}>{sumOfPercentagesDisplay}%</span>;
        }
    }

    function DropDownButton({selectedOption, setSelectedOption}) {
        const handleOptionChange = (event) => {
            setSelectedOption(event.target.value);
        };
        
        return (
            <select className={styles.sort_value} value={selectedOption} onChange={handleOptionChange}>
                <option className={styles.option_wrap} value="General">General</option>
                <option className={styles.option_wrap} value="Energy">Energy</option>
                <option className={styles.option_wrap} value="Materials">Materials</option>
                <option className={styles.option_wrap} value="Industrials">Industrials</option>
                <option className={styles.option_wrap} value="Utilities">Utilities</option>
                <option className={styles.option_wrap} value="Financial">Financial</option>
                <option className={styles.option_wrap} value="Health Care">Health Care</option>
                <option className={styles.option_wrap} value="Consumer Discretionary">Consumer Discretionary</option>
                <option className={styles.option_wrap} value="Consumer Staples">Consumer Staples</option>
                <option className={styles.option_wrap} value="Technology">Technology</option>
                <option className={styles.option_wrap} value="Communication">Communication</option>
                <option className={styles.option_wrap} value="Real Estate">Real Estate</option>

            </select>
        );
    }
    const searchbarStyles = {
        backgroundColor: '#F0F0F5',
        borderRadius: '5px',
        border: '#1B263B 2px solid',
        color: '#1B263B',
        fontSize: '18px',
        padding: '5px 20px',
        // margin: '5px 20px',
        width: '100%',
    };

    
    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <div className={styles.structure} style={{flex: 7}}>
            {/* <Header current_page={"Build-a-Port"}/> */}
            {/* <SideMenu/> */}
                <Button
                    sx={{
                        width: "149px",
                        height: "39px",
                        borderRadius: "10px",
                        border: "1px solid #080823",
                        backgroundColor: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "20px"
                    }}
                    onClick = {() => navigate("/home")}
                >
                    <img src={BackArrow} style={{ marginRight: "8px" }} /> 
                    <Typography
                        sx = {{
                        color: "#080823",
                        fontWeight: "700",
                        fontSize: "25px",
                        textAlign: "center",
                        }}
                    >
                        Cancel
                    </Typography>
                </Button>
                <div className={styles.title}>
                    Creation Data
                </div>
                <CreationData values={draftValues}/>
                <div className={styles.component}>
                    <div className={styles.searchbar_wrap}>
                        <Grid container spacing={3} sx={{ paddingLeft: '10%', paddingRight: '10%' }}>
                            <Grid item sm={8} xs={12}>
                                <input 
                                    type="text" 
                                    placeholder="Enter Ticker or Company Name"
                                    value={searchQuery}
                                    style={searchbarStyles}
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                />
                            </Grid>
                            <Grid item sm={2} xs={6}>
                                <DropDownButton selectedOption={selectedOption} setSelectedOption={setSelectedOption}/>
                            </Grid>
                        </Grid>
                    </div>  
                    <div className={styles.search_component}>
                        <div className={styles.search_results_wrap_wrap}>
                            <SearchResults searchQuery={searchQuery} setSearchQuery={setSearchQuery} data={data} selectedStocks={selectedStocks} setSelectedStocks={setSelectedStocks}/>
                        </div>
                    </div>

                    {/* <div className={styles.search_component}>
                        <div className={styles.search_results_wrap_wrap}>
                            <TopFive  data={temp} setSelectedStocks={setSelectedStocks}/>
                        </div>
                    </div>

                    <PortDraft data={data} selectedStocks={selectedStocks} setSelectedStocks={setSelectedStocks}/>
                    <div className={styles.wrap}>

                        {selectedStocks.length > 0 && (
                            <>
                                <div className={styles.total_percentage}>{colorCode(sumOfPercentagesDisplay)}</div>
                                <div className={styles.modal_pop_button} onClick={handleShowModal}>NEXT</div>
                            </>
                        )}

                    </div> */}
                </div>
            </div>
            <div style={{flex: 3}}>
                <div style={{margin: 20, border: '1px solid black', borderRadius: 10, backgroundColor: 'white', display: 'flex', flexDirection: 'column'}}> 
                    <div style={{textAlign: 'center', marginTop: 10, fontSize: 35, fontWeight: 'bold', }}>
                        Port Details
                    </div>
                    <Modal
                        data={data}
                        handleClose={handleCloseModal}
                        selectedStocks={selectedStocks}
                        setSelectedStocks={setSelectedStocks}
                        isEditing={isEditing}
                        sumOfPercentages={sumOfPercentages}
                        sector={selectedOption}
                    />
                </div>
            </div>
        </div>
    );
}

// export { TemplateMakeAPort };

export default MakeAPort;