import React , {useState , useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './page.module.css';
import { getStocks, getStocksPerc, portDraftVisual,getTop5Stocks, getGeneratedPort } from '../user';
import SearchResults from './searchresults';
import PortDraft from './port_draft';
import Modal from './modal';
import OpenAI from 'openai';
// import { TopBar } from '../Home/homev2';

import { TopBar } from '../Home/homev2';

// import Header from '../../old_stuff/New_Header_Navigation/navbar';
// import Footer from '../New_Footer/footer';
import CreationData from './creationGraph';
import SecureStorage from 'react-secure-storage';
import Grid from '@mui/joy/Grid';
import BackArrow from '../Detail/back_arrow.png';
import { Button, Typography, Tab, Tabs,TextField } from '@mui/material';
import { getPort } from '../user.js';
import { color } from 'framer-motion';
import TopFive  from './topfive.jsx';

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
    const { id } = useParams();
    
    const [ portData, setPortData ] = useState({});
    const navigate = useNavigate();
    useEffect(() => {
        const fetchPortData = async () => {
            const portData = await getPort(id);
            if (portData.author.id !== SecureStorage.getItem('userId')) {
                navigate('/home');
            }
            setPortData(portData);
        }
        if(id){
            fetchPortData();
        }
    }, [id]);


    return (
        <div className={styles.structure}>
            <TopBar />
            <TemplateMakeAPort portData = {portData}/>
        </div>
    );
}

//const temp = [{symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {symbol: 'AAPL', stock: 'AAPL', percent: -2.07, price: 145.56, volume: 153274720, fullName: "Apple Inc"}, {symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {symbol: 'NVDA', stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}, {stock: 'NVDA', percent: -2.07, price: 145.56, volume: 153274720, fullName: "NVIDIA Corporation"}]




function TemplateMakeAPort({portData}) {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('General');
    const [selectedTypeOption, setSelectedTypeOption] = useState('ticker');
    const [data, setData] = useState([]);
    const [top5, setop5] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [promptQuery, setPromptQuery] = useState('');
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [draftValues, setDraftValues] = useState({});
    const [aiPrompt, setAiPrompt] = useState('');

    async function getGeneratedPortFront(){
        console.log("Prompt: ", promptQuery);
       const content = await getGeneratedPort(promptQuery);
        
        const contentList = content.split(",");
        let selectedStocks = [];
        for(let i = 1; i < contentList.length; i+2){
            const stockObject = {
                stock: contentList[i],
                percent: contentList[i+1],
                price: 100,
            }
            selectedStocks.push(stockObject);
        }
        setSelectedStocks(selectedStocks);
        setPromptQuery("");
    }



    
    const handleShowModal = () => {
        setShowModal(true);
    }

    useEffect(() => {

        const getSelectedStocks = () => {
            
            const selectedStocks = portData.portStocks.map(stock => {
                return {
                    stock: stock.stockId.ticker,
                    percent: stock.curPerc,
                    price: stock.stockId.price,
                };});


        setSelectedStocks(selectedStocks);
        }
        if(portData.portStocks){
        getSelectedStocks();
        }
        }, [portData])


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

                const raw_data = await getStocks();
                // console.log(raw_data);
                const data = raw_data.map(stock => ({ symbol: stock.ticker, percent: stock.dailyChange.toFixed(2), price: stock.price.toFixed(2), volume: stock.volume, fullName: String(stock.fullName)}));
                setData(data);

        }
        loadData();
        // V is causing it to run twice
    }, [data.length, searchQuery, selectedTypeOption]);

    // useEffect(() => {
    //     async function loadData() {
    //         const r_d = await getTop5Stocks();
            
    //        const d = r_d.map(stock => ({ symbol: stock.ticker, percent: stock.dailyChange.toFixed(2), price: stock.price.toFixed(2), volume: stock.volume, fullName: String(stock.fullName)}));
            
    //         setop5(d)
    
    //     }
    //     loadData();
    //     // V is causing it to run twice
    // }, []);



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


    const searchbarStylesLeft = {
        backgroundColor: '#1D1D6B',
        borderRadius: '5px',
        border: '#0000 2px solid',
        color: '#0000',
        fontSize: '18px',
        // padding: '5px 20px',
        // margin: '5px 20px',
        borderTopRightSize: '0px',
        borderTopLeftSize: '0px',
        width: '100%',
        display: 'flex',
        padding: "0px",
        height: '40px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '12px',
    };

    const aiTextFieldStyle = {
        backgroundColor: '#F0F0F5',
        borderRadius: '5px',
        border: '#1B263B 2px solid',
        color: '#1B263B',
        fontSize: '18px',
        // padding: '5px 20px',
        // margin: '5px 20px',
        width: '70%',
        display: 'flex',
        height: '120px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '12px',
        justifyContent: 'center',
    };

    

    
    return (
        <div style={{display: 'flex', flexDirection: 'row', minWidth: "1600px"}}>
            <div className={styles.structure} style={{flex: 7}}>
            {/* <Header current_page={"Build-a-Port"}/> */}
            {/* <SideMenu/> */}
                <Button
                    sx={{
                        width: "149px",
                        height: "39px",
                        borderRadius: "10px",
                        border: "2px solid #0000",
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

<div className={styles.component}><div className={styles.searchbar_wrap}>
                        <Grid container spacing={3} sx={{ paddingLeft: '10%', paddingRight: '10%' }}>
                        <Grid item sm={8} sx = {searchbarStylesLeft}>
                                <input 
                                    type="text" 
                                    placeholder="Enter AI Prompt"
                                    value={promptQuery}
                                    style = {{
                                        
                                        backgroundColor: '#1D1D6B',
                                        borderRadius: '5px',
                                        border: '#00000 1px solid',
                                        color: '#FFFF',
                                        fontSize: '18px',
                                        // margin: '5px 20px',
                                        borderTopRightSize: '0px',
                                        borderTopLeftSize: '0px',
                                        width: '100%',
                                        height: '30px',
                                    }}
                                    onChange={(e) => setPromptQuery(e.target.value)} 
                                />
                                <Button variant="contained" color="primary" onClick={getGeneratedPortFront}  style={{marginLeft: "10px"}}>Generate</Button>
                                </Grid>
                            <Grid item sm={8} sx = {searchbarStylesLeft}>
                                <input 
                                    type="text" 
                                    placeholder="Enter Ticker or Company Name"
                                    value={searchQuery}
                                    style = {{
                                        
                                        backgroundColor: '#1D1D6B',
                                        borderRadius: '5px',
                                        border: '#00000 1px solid',
                                        color: '#FFFF',
                                        fontSize: '18px',
                                        // margin: '5px 20px',
                                        borderTopRightSize: '0px',
                                        borderTopLeftSize: '0px',
                                        width: '100%',
                                        height: '30px',
                                    }}
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                />
                                <TypeToggleButton selectedTypeOption={selectedTypeOption} setSelectedTypeOption={setSelectedTypeOption}/>
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
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
  <div 
//   style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "500px", margin: "auto" }}
  style = {aiTextFieldStyle}>

   <textarea
  placeholder="Enter Prompt"
  value={aiPrompt}
  onChange={(e) => setAiPrompt(e.target.value)}
  style={{
    color: '#1B263B',
    fontSize: '18px',
    width: '100%',
    height: '110px',
    border: 'none', // Removes the border
    outline: 'none', // Removes the focus bar
    backgroundColor: '#F0F0F5',
    borderRadius: '5px',
    padding: '10px',
    resize: 'none' // Prevents manual resizing
  }}
/>
</div>
    <Button variant="contained" color="primary" style={{marginBottom: "20px"}}>
      Draft
    </Button>
  </div>


            </div>
            <div style={{flex: 2}}>
                <div style={{margin: 20, border: '1px solid black', borderRadius: 10, backgroundColor: '#1D1D6B', display: 'flex', flexDirection: 'column', minWidth: "100px"}}> 
                    <div style={{textAlign: 'center', marginTop: 10, fontSize: 35, fontWeight: 'bold',color:'#FFFF' }}>
                        Port Details
                    </div>
                    <Modal
                        data={data}
                        handleClose={handleCloseModal}
                        selectedStocks={selectedStocks}
                        setSelectedStocks={setSelectedStocks}
                        sumOfPercentagesDisplay={sumOfPercentagesDisplay}
                        sector={selectedOption}
                        status={portData.status}
                        id={portData.id}
                    />
                </div>
            </div>
         </div>
    );
}

function TypeToggleButton({selectedTypeOption, setSelectedTypeOption}) {
    const handleOptionChange = () => {
          
        if (selectedTypeOption === "ticker") {
            setSelectedTypeOption("fullName");
        } else {
            setSelectedTypeOption("ticker");
        }
    };


return (
        <Button onClick ={handleOptionChange} sx = {{textTransform: 'none',

            backgroundColor: '#1D1D6B',
        color: '#FFFF',
        fontSize: '18px',
        // padding: '5px 20px',
        // margin: '5px 20px',
        height: '20px',
        width: '200px',
        alignText: 'right',
        
        }}> 
      {selectedTypeOption === "ticker" ? (
        <Typography sx={{
            fontSize: '18px',
            color: '#FFFF',
            justifyContent: 'center',
            alignItems: 'center',
            }} >Ticker</Typography>
      ) : (
        <Typography sx={{
            fontSize: '18px',
            color: '#FFFF',
            justifyContent: 'center',
            alignItems: 'center',
            }}>Company Name</Typography>
      )}
    </Button>
  );
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
// export { TemplateMakeAPort };

export default MakeAPort; 