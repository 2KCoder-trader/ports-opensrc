import React from "react";
import { TopBar } from '../Home/homev2';
import Body from './UserSettingsPage';
// import Footer from '../New_Footer/footer';



function Landing() {
  return (
     <div className>
         <div className>
             <TopBar/>
             <Body/>
         </div>
         {/* <Footer />  */}
     </div>
  )
}


export default Landing;