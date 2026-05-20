import React, { useState, useEffect,useRef } from 'react';
import SecureStorage from 'react-secure-storage';
import { getLoginUsers} from '../user';
import {TopBar} from '../Home/homev2';
import { getPort,getChartData, getPortIds,getLiveIndex,setToPending,approvePort,rejectPort} from "../user.js";
import Grid from "@mui/material/Grid2";
import { Box, CssBaseline, Typography, TextField, Button, Tabs, Tab,IconButton } from "@mui/material";
import BackArrow from "./back_arrow.png";
import { Line } from "react-chartjs-2";
import './UserProfile.css';
import { uploadImage,investPort} from '../user';
import { useNavigate } from 'react-router-dom';
import Home  from './hoome.jsx';
import { FaLinkedin } from 'react-icons/fa';
import { useParams } from "react-router-dom";


const ProfileImageUpload = ({img}) => {
  const [imagePreview, setImagePreview] = useState(
    img
      ? "data:image/jpeg;base64," + img
      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  );

  // Update imagePreview when img prop changes
  useEffect(() => {
    setImagePreview(
      img
        ? "data:image/jpeg;base64," + img
        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    );
  }, [img]);

   // Correctly logs the `img` prop
   // Now reflects changes when `img` updates
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    await uploadImage(file,SecureStorage.getItem('userId'))
  };



  return (
    <div className="relative w-32 h-32">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}

      />

      <div
      
        className="relative w-full h-full rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      >
        <img
          src={imagePreview}
          alt="Profile"
          className="imagee"
        />

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};


const UserProfile = ({ userId }) => {

    const [view, setView] = React.useState("public");
    const [portIds, setPortIds] = React.useState([]);
    // set to 0 eventually
    const [portData, setPortData] = React.useState({});
    const [personalPortIds, setPersonalPortIds] = React.useState([]);

        const navigate = useNavigate();

  // State for user data and loading/error handling
  const [userData, setUserData] = useState({
    name: 'temp',
    profilePicture: '/api/placeholder/200/200',
    bio: 'temp',
    backgroundImage: '/api/placeholder/1200/300',
    cards: []
  });
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const decodeHtmlEntities = (text) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.documentElement.textContent;
  };
  const { user_id,id } = useParams();
  // Effect to fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
        let raw_data;
        let response;
     
        
        // if(SecureStorage.getItem('u_id') !== null) {
        //   console.log("kdkdkdkdkdkdk") 
        //   response= await getLoginUsers((SecureStorage.getItem('u_id')));
        // } else {
        //   
        //   response= await getLoginUsers((SecureStorage.getItem('user_name')));
        // }
     
        response= await getLoginUsers(user_id);
        console.log(response)
        // 
        
        SecureStorage.setItem("id_us",response.id)
        
        SecureStorage.setItem('img_profile',response.profile_image);
        
        const decodedBio = decodeHtmlEntities(response.bio);
        let college = 'no college';
        try {
        const college =  response.tags.find(tag => tag.type === 'college').name;
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserData({
          name: response.username || 'Anonymous User',
          profilePicture: response.profile_image || 'placeholder',
          bio: decodedBio || 'No bio available',
          backgroundImage: response.profile_image || 'placeholder',
          cards: response.cards || [],
          linkedin:response.linkedin  || 'no linkedin',
          college:  college || 'no college'
        });
     
        // setError(err.message);
        // setUserData({
        //   name: 'Error Loading Profile',
        //   profilePicture: '/api/placeholder/200/200',
        //   bio: 'Unable to load user information',
        //   backgroundImage: '/api/placeholder/1200/300',
        //   cards: [],
        //   linkedin: 'no linkedin',
        //   college:'no college'
        // });
      }

    

console.log(raw_data)

setData(raw_data);


    };

    // const fetchData = async () => {
    //   
    //   let ids = await getPortIds(SecureStorage.getItem("id_us"));
    //   
    //   setPortIds(ids);
    // };
    // fetchData();
    fetchUserData();
  }, []);



const handleClick = () => {
  // navigate(`/detail?username=${encodeURIComponent(username)}&title=${encodeURIComponent(title)}&id=${encodeURIComponent(id)}&port_id=${encodeURIComponent(port_id)}`)
  navigate(`/settings`)
};



if (error) {
  return (
    <div className="error-container">
      <h2>Oops! Something went wrong</h2>
      <p>{error}</p>
    </div>
  );
}

// const collegeTag = userData.tags;
return (
  <>

  <TopBar></TopBar>
  <div className="user-profile-container">
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>
      <div className="profile-card">
        <div className="profile-content">
          <div className="button-container">
            <button className="action-button" onClick={handleClick}>Settings</button>
          </div>
          <div className="profile-main">
        <ProfileImageUpload img = {userData.profilePicture}></ProfileImageUpload>
    
            <p className="profile-username">{userData.name}</p>
            <p className="profile-username">{userData.college}</p>
            <a href={userData.linkedin} target="_blank" rel="noopener noreferrer">
      <FaLinkedin size={30} color="#0e76a8" />
    </a>
            <div className="description-container">
             {userData.bio}
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Port Data Container */}
    <Home></Home>
  </div>
  </>
);
};

export default UserProfile;