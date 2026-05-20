// import React, {useState, useEffect} from 'react';
// import styles from './market.module.css';
// import Card from '../Card_Display/card';
// import Navbar from '../New_Header_Navigation/navbar';
// import Footer from '../New_Footer/footer';
// import { getGport } from '../user';
// import SecureStorage from 'react-secure-storage';

// function CardDashboard() {
//     const [data, setData] = useState([]);
//     const [time, setTime] = useState(Date.now());
//     const [searchTerm, setSearchTerm] = useState('');

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setTime(Date.now()); // Update state to trigger re-render
//           }, 60000); // 60000 ms = 1 minute
//         async function fetchData() {
//             SecureStorage.setItem('Current Page','Port Market');
//             const raw_data = await getGport();
//           
//             const mapped_data = raw_data.map(port => ({ 
//                 name: port.title, 
//                 author: port.author, 
//                 risk: port.curRisk, 
//                 price: port.valueHist[port.valueHist.length - 1],
//                 pnl: port.valueHist.length > 1 ? ((port.valueHist[port.valueHist.length - 1] - port.valueHist[port.valueHist.length - 2])/port.valueHist[port.valueHist.length - 1]) : 0,
//                 port_id: port.id
//             }));
//             setData(mapped_data);

         
//         }
//         fetchData();
//         return () => clearInterval(interval);
//     }, [time]);
//     const handleSearch = (event) => {
//         setSearchTerm(event.target.value);
//     };

//     const filteredData = data.filter(port =>
//         port.name.toLowerCase().startsWith(searchTerm.toLowerCase())
//     );

//     const sortedData = filteredData.sort((a, b) => a.name.localeCompare(b.name));
//     const gports = sortedData.map((port, index) => (
//             <div className='flex-item' key={index}>
//                 <Card title={port.name} author={port.author}  pnl ={port.pnl} risk={port.risk} price ={port.price} id ={port.port_id} domain={'market'}/>
//             </div>
//     ));
//     return (
//         <>
//         <div className={styles.searchbar_wrap}>
//         <input className={styles.searchbar}
//                 type="text"
//                 placeholder="Search by name"
//                 value={searchTerm}
//                 onChange={handleSearch}
//             /></div>
//         <div className={styles.container}>
//             {gports}
//             </div>
//             </>
//         );
// }


// function Market() {

//     return (
//         <div className={styles.structure}>
//             <Navbar tab={0}/>
//             <CardDashboard />
//             <Footer />
//         </div>
//     );
// }
// export default Market