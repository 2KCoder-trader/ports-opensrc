import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import styles from './settings.module.css';
import { changeEmail, changePassword, changeUsername, getUserById, getCash, getInvesting, sendConfirmationEmail, verifyConfirmationCode,verifyForgotConfirmationCode } from '../user';
import { useLocation, useNavigate } from 'react-router-dom';
import SecureStorage from 'react-secure-storage';
import Grid from '@mui/joy/Grid';
import { uploadImage,uploadBio,uploadLinkedIn} from '../user';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const VideoPlayer = () => {
  return (<>
  <div style = {{display: "flex", justifyContent: "center", alignItems:"center", fontSize: "40px", }}>
        Ports Tutorial Video
        </div>
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <ReactPlayer
        url="https://www.youtube.com/watch?v=Lown5XsendM"
        controls
        width="100%"
        height="400px"
        style={{ maxWidth: "720px" }}
      />
    </div>
    </>
  );
};
const ProfileImageUpload = ({img}) => {
  const [imagePreview, setImagePreview] = useState (
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
    <>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
  
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-full cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
       
          >
            {/* Profile Image */}
            <img src={imagePreview} alt="Profile" className={styles.profile_picture} />
  
            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
  
        {/* Text Box Below Image */}
        <div className="text-sm text-white text-center mt-2">
  Click to upload profile picture
</div>

      </div>
    </>
  );
  
};

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modal_background}>
      <div className={styles.modal}>
          {children}
      </div>
    </div>
  );
};

const UserSettingsPage = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/home");
  };
  

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [bio, setBio] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [college,setCollege] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [cash, setCash] = useState(0);
  const [investing, setInvesting] = useState(0);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [isConfirmingPassword, setIsConfirmingPassword] = useState(false);
  const [isEditingLinkedIn, setIsEditingLinkedIn] = useState(false);
const [linkedin, setLinkedIn] = useState('');

  const location = useLocation();
  const { state } = location;

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  useEffect(() => {
    if (state && state.message) {
      const element = document.getElementById('video');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const handleScroll = debounce(() => {
          SecureStorage.setItem('Current Page', 'Settings');
          window.removeEventListener('scroll', handleScroll);
        }, 100);
        window.addEventListener('scroll', handleScroll);
      }
    }
  }, [location]);
  const decodeHtmlEntities = (text) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.documentElement.textContent;
  };
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserById(SecureStorage.getItem('userId'));
      setUser(user);
      SecureStorage.setItem("profile_image", user.profile_image);
      setNewName(user.username);
      setNewEmail(user.email);
      const cash = await getCash(SecureStorage.getItem('userId'));
      setCash(parseFloat(cash).toFixed(1));
      const investing = await getInvesting(SecureStorage.getItem('userId'));
      setInvesting(parseFloat(investing).toFixed(1));

      

      // 
      user.tags.forEach(tag => {
        
        if (tag.type === 'college') {
            
            setCollege(tag.name);
        }
    });
    const decodedBio = decodeHtmlEntities(user.bio);
    setBio(decodedBio);
      setLinkedIn(user.linkedin)
    };
    fetchUser();
  }, [triggerFetch]);

  const handleSendConfirmation = async (type) => {
    const userId = SecureStorage.getItem('userId');
    try {
      if (type === 'email') {
        SecureStorage.setItem("newEmail", newEmail);
        await sendConfirmationEmail(newEmail, userId);
        setIsConfirmationSent(true);
        setIsConfirmingEmail(true);
        setEmailModalOpen(true);
      } else if (type === 'password') {
        await sendConfirmationEmail(user.email, userId);
        setIsConfirmationSent(true);
        setIsConfirmingPassword(true);
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      alert('Failed to send confirmation email. Please try again.');
    }
  };

  const handleVerifyConfirmation = async (type) => {
    const userId = SecureStorage.getItem('userId');
    try {
      let isVerified = false;
      if (type === 'email') {
        isVerified = await verifyConfirmationCode(SecureStorage.getItem('user_name'), confirmationCode);
      } else {
        isVerified = await verifyConfirmationCode(SecureStorage.getItem('user_name'), confirmationCode);
      }
      if (isVerified) {
        if (type === 'email') {
          await changeEmail(userId, SecureStorage.getItem("newEmail"));
          SecureStorage.setItem('email', newEmail);
          setEmailModalOpen(false);
          setIsEditingEmail(false);
        } else if (type === 'password') {
          await changePassword(userId, newPassword, oldPassword);
          setPasswordModalOpen(false);
          setIsEditingPassword(false);
        }
        setIsConfirmationSent(false);
        setIsConfirmingEmail(false);
        setIsConfirmingPassword(false);
        setConfirmationCode('');
        setTriggerFetch((prev) => !prev);
      } else {
        alert('Invalid confirmation code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying confirmation code:', error);
      alert('Failed to verify confirmation code. Please try again.');
    }
  };

  const handleEdit = (field) => {
    if (field === 'name') setIsEditingName(true);
    if (field === 'email') setIsEditingEmail(true);
    if (field === 'password') {
      setIsEditingPassword(true);
      setPasswordModalOpen(true);
    }
    if (field === 'bio') setIsEditingBio(true);
    if (field === 'linkedin') setIsEditingLinkedIn(true);
  };

  const handleSave = async (field) => {
    let userId = SecureStorage.getItem('userId');

    if (field === 'name') {
      setUser((prevUser) => ({ ...prevUser, name: newName }));
      const success = await changeUsername(userId, newName);
      SecureStorage.setItem('userToken', success);
      SecureStorage.setItem('username', newName);
      setIsEditingName(false);
    } else if (field === 'email') {
      handleSendConfirmation('email');
    } else if (field === 'password') {
      if (newPassword === confirmPassword) {
        handleSendConfirmation('password');
      } else {
        alert('Passwords do not match');
      }
    }
    else if (field === 'bio') {
      setIsEditingBio(false);
      await uploadBio(bio,userId);
    } else  if (field === 'linkedin') {
      setIsEditingLinkedIn(false);
      await uploadLinkedIn(linkedin, SecureStorage.getItem('userId')); // Replace with your API call
    }
    setTriggerFetch((prev) => !prev);
  };

  const handleCancel = (field) => {
    if (field === 'name') {
      setNewName(user.username);
      setIsEditingName(false);
    }
    if (field === 'email') {
      setNewEmail(user.email);
      setIsEditingEmail(false);
      setEmailModalOpen(false);
      setIsConfirmationSent(false);
      setIsConfirmingEmail(false);
      setConfirmationCode('');
    }
    if (field === 'password') {
      setIsEditingPassword(false);
      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setIsConfirmationSent(false);
      setIsConfirmingPassword(false);
      setConfirmationCode('');
    }

    if (field === 'linkedin') {
      setIsEditingLinkedIn(false);
      setLinkedIn(user.linkedin); // Replace with the correct user field
    }
  
  };

  // return (
  //   <>
  //     <div className="max-w-md mx-auto p-6 space-y-6">
  //       <div className="flex justify-center mb-8">
  //         <ProfileImageUpload img={SecureStorage.getItem("profile_image")} />
  //       </div>

  //       <div className="space-y-6 bg-white rounded-lg">
  //         <div className="flex justify-between items-center pb-4 border-b">
  //           <span className="font-medium">My Stats</span>
  //         </div>

  //         <div className="space-y-4">
  //           <div className="flex justify-between items-center">
  //             <span className="text-gray-600">Cash</span>
  //             <span className="font-medium">${cash}</span>
  //           </div>

  //           <div className="flex justify-between items-center">
  //             <span className="text-gray-600">Investments</span>
  //             <span className="font-medium">${investing}</span>
  //           </div>
  //         </div>

  //         <div className="space-y-4 pt-4">
  //           <div className="space-y-2">
  //             <label className="block text-gray-600">Username</label>
  //             <div className="flex items-center space-x-2">
  //               <input
  //                 type="text"
  //                 value={newName}
  //                 onChange={(e) => setNewName(e.target.value)}
  //                 disabled={!isEditingName}
  //                 className={`flex-1 p-2 border rounded focus:outline-none focus:border-blue-500 ${
  //                   !isEditingName ? 'bg-gray-50' : ''
  //                 }`}
  //               />
  //               {!isEditingName ? (
  //                 <button 
  //                   onClick={() => handleEdit('name')} 
  //                   className="p-2 text-blue-500 hover:text-blue-600"
  //                 >
  //                   Edit
  //                 </button>
  //               ) : (
  //                 <div className="space-x-2">
  //                   <button 
  //                     onClick={() => handleSave('name')} 
  //                     className="p-2 text-green-500 hover:text-green-600"
  //                   >
  //                     Save
  //                   </button>
  //                   <button 
  //                     onClick={() => handleCancel('name')} 
  //                     className="p-2 text-red-500 hover:text-red-600"
  //                   >
  //                     Cancel
  //                   </button>
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //           <div className="space-y-2">
  //             <label className="block text-gray-600">Bio</label>
  //             <div className="flex items-center space-x-2">
  //               <input
  //                 type="text"
  //                 value={newName}
  //                 onChange={(e) => setBio(e.target.value)}
  //                 disabled={!isEditingName}
  //                 className={`flex-1 p-2 border rounded focus:outline-none focus:border-blue-500 ${
  //                   !isEditingName ? 'bg-gray-50' : ''
  //                 }`}
  //               />
  //               {!isEditingName ? (
  //                 <button 
  //                   onClick={() => handleEdit('name')} 
  //                   className="p-2 text-blue-500 hover:text-blue-600"
  //                 >
  //                   Edit
  //                 </button>
  //               ) : (
  //                 <div className="space-x-2">
  //                   <button 
  //                     onClick={() => handleSave('name')} 
  //                     className="p-2 text-green-500 hover:text-green-600"
  //                   >
  //                     Save
  //                   </button>
  //                   <button 
  //                     onClick={() => handleCancel('name')} 
  //                     className="p-2 text-red-500 hover:text-red-600"
  //                   >
  //                     Cancel
  //                   </button>
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //           <div className="space-y-2">
  //             <label className="block text-gray-600">Email</label>
  //             <div className="flex items-center space-x-2">
  //               <input
  //                 type="email"
  //                 value={newEmail}
  //                 onChange={(e) => setNewEmail(e.target.value)}
  //                 disabled={!isEditingEmail}
  //                 className={`flex-1 p-2 border rounded focus:outline-none focus:border-blue-500 ${
  //                   !isEditingEmail ? 'bg-gray-50' : ''
  //                 }`}
  //               />
  //               {!isEditingEmail ? (
  //                 <button 
  //                   onClick={() => handleEdit('email')} 
  //                   className="p-2 text-blue-500 hover:text-blue-600"
  //                 >
  //                   Edit
  //                 </button>
  //               ) : (
  //                 <div className="space-x-2">
  //                   <button 
  //                     onClick={() => handleSave('email')} 
  //                     className="p-2 text-green-500 hover:text-green-600"
  //                   >
  //                     Save
  //                   </button>
  //                   <button 
  //                     onClick={() => handleCancel('email')} 
  //                     className="p-2 text-red-500 hover:text-red-600"
  //                   >
  //                     Cancel
  //                   </button>
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-gray-600">Password</label>
  //             <div className="flex items-center space-x-2">
  //               <input
  //                 type="password"
  //                 value="••••••••"
  //                 disabled
  //                 className="flex-1 p-2 border rounded bg-gray-50"
  //               />
  //               <button 
  //                 onClick={() => handleEdit('password')} 
  //                 className="p-2 text-blue-500 hover:text-blue-600"
  //               >
  //                 Edit
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //    {/* Email Confirmation Modal */}
  //    <Modal isOpen={emailModalOpen} onClose={() => handleCancel('email')}>
  //       <h3 className="text-lg font-medium mb-4">Confirm Email Change</h3>
  //       {!isConfirmationSent ? (
  //         <div className="space-y-4">
  //           <p className="text-gray-600">
  //             We'll send a confirmation code to your new email address.
  //           </p>
  //           <div className="flex justify-end space-x-2">
  //             <button
  //               onClick={() => handleSendConfirmation('email')}
  //               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //             >
  //               Send Code
  //             </button>
  //             <button
  //               onClick={() => handleCancel('email')}
  //               className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
  //             >
  //               Cancel
  //             </button>
  //           </div>
  //         </div>
  //       ) : (
  //         <div className="space-y-4">
  //           <p className="text-gray-600">
  //             Please enter the confirmation code sent to your email.
  //           </p>
  //           <input
  //             type="text"
  //             value={confirmationCode}
  //             onChange={(e) => setConfirmationCode(e.target.value)}
  //             className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
  //             placeholder="Enter confirmation code"
  //           />
  //           <div className="flex justify-end space-x-2">
  //             <button
  //               onClick={() => handleVerifyConfirmation('email')}
  //               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //             >
  //               Verify
  //             </button>
  //             <button
  //               onClick={() => handleCancel('email')}
  //               className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
  //             >
  //               Cancel
  //             </button>
  //           </div>
  //         </div>
  //       )}
  //     </Modal>

  //     {/* Password Modal */}
  //     <Modal isOpen={passwordModalOpen} onClose={() => handleCancel('password')}>
  //       <h3 className="text-lg font-medium mb-4">Change Password</h3>
  //       {!isConfirmationSent ? (
  //         <div className="space-y-4">
  //           <div>
  //             <label className="block text-gray-600 mb-1">Current Password</label>
  //             <input
  //               type="password"
  //               value={oldPassword}
  //               onChange={(e) => setOldPassword(e.target.value)}
  //               className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
  //             />
  //           </div>
  //           <div>
  //             <label className="block text-gray-600 mb-1">New Password</label>
  //             <input
  //               type="password"
  //               value={newPassword}
  //               onChange={(e) => setNewPassword(e.target.value)}
  //               className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
  //             />
  //           </div>
  //           <div>
  //             <label className="block text-gray-600 mb-1">Confirm New Password</label>
  //             <input
  //               type="password"
  //               value={confirmPassword}
  //               onChange={(e) => setConfirmPassword(e.target.value)}
  //               className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
  //             />
  //           </div>
  //           <div className="flex justify-end space-x-2">
  //             <button
  //               onClick={() => handleSave('password')}
  //               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //             >
  //               Send Verification Code
  //             </button>
  //             <button
  //               onClick={() => handleCancel('password')}
  //               className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
  //             >
  //               Cancel
  //             </button>
  //           </div>
  //         </div>
  //       ) : (
  //         <div className="space-y-4">
  //           <p className="text-gray-600">
  //             Please enter the confirmation code sent to your email.
  //           </p>
  //           <input
  //             type="text"
  //             value={confirmationCode}
  //             onChange={(e) => setConfirmationCode(e.target.value)}
  //             className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
  //             placeholder="Enter confirmation code"
  //           />
  //           <div className="flex justify-end space-x-2">
  //             <button
  //               onClick={() => handleVerifyConfirmation('password')}
  //               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //             >
  //               Verify and Change Password
  //             </button>
  //             <button
  //               onClick={() => handleCancel('password')}
  //               className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
  //             >
  //               Cancel
  //             </button>
  //           </div>
  //         </div>
    //     )}
    //   </Modal>

    // </>
  // );
  return (
    <>
      <div className={styles.container}>
        <div className={styles.settings_title}>
          Settings
        </div>
        <div className={styles.container_e}>
          <div className={styles.profile_picture_container}>
            <ProfileImageUpload img={SecureStorage.getItem("profile_image")} />
          </div>
          <div>
            <Grid container columnSpacing={3} sx={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
            }}>
              <Grid item xs={3}>
                <label className={styles.texttt}>Username</label>
              </Grid>
              <Grid item xs={8}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={!isEditingName}
                  className={styles.input}
                />
              </Grid>
              <Grid item xs={1}/>
              {/* <Grid item xs={1}>
                {!isEditingName ? (
                  <button
                    onClick={() => handleEdit("name")}
                    className={styles.button}
                  >
                    <EditOutlinedIcon />
                  </button>
                ) : (
                  <div style={{display: 'flex'}}>
                    <button
                      onClick={() => handleSave("name")}
                      className={styles.button}
                      style={{marginRight: 5}}
                    >
                      <CheckIcon/>
                    </button>
                    <button
                      onClick={() => handleCancel("name")}
                      className={styles.button}
                    >
                      <CloseIcon/>
                    </button>
                  </div>
                )}
              </Grid> */}
            </Grid>

            <Grid container columnSpacing={3} sx={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
            }}>
              <Grid item xs={3}>
                <label className={styles.texttt}>Email</label>
              </Grid>
              <Grid item xs={8}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={!isEditingEmail}
                  className={styles.input}
                />
              </Grid>
              <Grid item xs={1}>
                {!isEditingEmail ? (
                  <button
                    onClick={() => handleEdit("email")}
                    className={styles.button}
                  >
                    <EditOutlinedIcon />
                  </button>
                ) : (
                  <div style={{display: 'flex'}}>
                    <button
                      onClick={() => handleSave("email")}
                      className={styles.button}
                      style={{marginRight: 5}}
                    >
                      <CheckIcon/>
                    </button>
                    <button
                      onClick={() => handleCancel("email")}
                      className={styles.button}
                    >
                      <CloseIcon/>
                    </button>
                  </div>
                )}
              </Grid>
            </Grid>
  
            <Grid container columnSpacing={3} sx={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
            }}>
              <Grid item xs={3}>
                <label className={styles.texttt}>Password</label>
              </Grid>
              <Grid item xs={8}>
                <input
                  type="password"
                  value="••••••••"
                  disabled
                  className={styles.input}
                />
              </Grid>
              <Grid item xs={1}>
                <button
                  onClick={() => handleEdit("password")}
                  className={styles.button}
                >
                  <EditOutlinedIcon />
                </button>
              </Grid>
            </Grid>
  
            <Grid container columnSpacing={3} sx={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
            }}>
              <Grid item xs={3}>
                <label className={styles.texttt}>Bio</label>
              </Grid>
              <Grid item xs={8}>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditingBio}
                  className={styles.input}
                />
              </Grid>
              <Grid item xs={1}>
                {!isEditingBio ? (
                  <button
                    onClick={() => handleEdit("bio")}
                    className={styles.button}
                  >
                    <EditOutlinedIcon />
                  </button>
                ) : (
                  <div style={{display: 'flex'}}>
                    <button
                      onClick={() => handleSave("bio")}
                      className={styles.button}
                      style={{marginRight: 5}}
                    >
                      <CheckIcon/>
                    </button>
                    <button
                      onClick={() => handleCancel("bio")}
                      className={styles.button}
                    >
                      <CloseIcon/>
                    </button>
                  </div>
                )}
              </Grid>
            </Grid>
  
            <Grid container columnSpacing={3} sx={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
            }}>
              <Grid item xs={3}>
                <label className={styles.texttt}>College</label>
              </Grid>
              <Grid item xs={8}>
                <input
                  type="text"
                  value={college}
                  disabled
                  className={styles.input}
                />
              </Grid>
              <Grid item xs={1}/> 
            </Grid>

            <Grid container columnSpacing={3} sx={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
            }}>
              <Grid item xs={3}>
                <label className={styles.texttt}>LinkedIn</label>
              </Grid>
              <Grid item xs={8}>
                <input
                  type="text"
                  value={linkedin} // Change this to the appropriate state variable for LinkedIn
                  onChange={(e) => setLinkedIn(e.target.value)} // Update the state variable for LinkedIn
                  disabled={!isEditingLinkedIn}
                  className={styles.input}
                />
              </Grid>
              <Grid item xs={1}>
                {!isEditingLinkedIn ? (
                  <button onClick={() => handleEdit("linkedin")} className={styles.button}>
                    <EditOutlinedIcon />
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button onClick={() => handleSave("linkedin")} className={styles.button}>
                      <CheckIcon/>
                    </button>
                    <button onClick={() => handleCancel("linkedin")} className={styles.button}>
                      <CloseIcon/>
                    </button>
                  </div>
                )}
              </Grid>
            </Grid>

            <div className={styles.stats}>
              <div className={styles.stats_container}>
                <div style={{fontWeight: 700, paddingBottom: 30}}>
                  <span className="">My Stats</span>
                </div>

                <Grid container sx={{paddingBottom: 2}}>
                  <Grid item xs={6}>Cash</Grid>
                  <Grid item xs={6}>${cash}</Grid>
                </Grid>
      
                <Grid container>
                  <Grid item xs={6}>Investments</Grid>
                  <Grid item xs={6}>${investing}</Grid>
                </Grid>
              </div>
            </div>
          </div>
          <div>Tutorial Video</div>
          <ReactPlayer
        url='https://youtu.be/Lown5XsendM'
        playing={false}
        controls={true}
        styles={{
          display: 'flex',
          width: '1200px',
          height: '800px',

        }}
      />
        </div>
        <button
          onClick={() => handleBackClick()}
          className={styles.back_button}
        >
          <ArrowBackIosIcon fontSize='small'/>
          Back
        </button>
      </div>      

      <Modal isOpen={emailModalOpen} onClose={() => handleCancel('email')}>
        <h3 className="text-lg font-medium mb-4">Confirm Email Change</h3>
        {isConfirmationSent ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              We'll send a confirmation code to your new email address.
            </p>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <div style={{width: 'auto'}}>
                <button
                  onClick={() => handleSendConfirmation('email')}
                  className={styles.verify_button}
                >
                  Send Code
                </button>
                <button
                  onClick={() => handleCancel('email')}
                  className={styles.cancel_button}
                  style={{flex: 1}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p style={{marginBottom: 2}}>
              Please enter the confirmation code sent to your email.
            </p>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className={styles.modal_input}
              placeholder="Enter confirmation code"
            />
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <div style={{width: 'auto'}}>
                <button
                  onClick={() => handleVerifyConfirmation('email')}
                  className={styles.verify_button}
                >
                  Verify
                </button>
                <button
                  onClick={() => handleCancel('email')}
                  className={styles.cancel_button}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
       </Modal>

      {/* Password Modal */}
      <Modal isOpen={passwordModalOpen} onClose={() => handleCancel('password')}>
        <h3 className="">Change Password</h3>
        {!isConfirmationSent ? (
          <div className="">
            <div>
              <label>Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={styles.modal_input}
              />
            </div>
            <div>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.modal_input}
              />
            </div>
            <div>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.modal_input}
              />
            </div>
            <div style={{display: 'flex'}}>
              <button
                onClick={() => handleSave('password')}
                className={styles.verify_button}
              >
                Send Verification Code
              </button>
              <button
                onClick={() => handleCancel('password')}
                className={styles.cancel_button}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p style={{marginBottom: 2}}>
              Please enter the confirmation code sent to your email.
            </p>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className={styles.modal_input}
              placeholder="Enter confirmation code"
            />
            <div style={{display: 'flex'}}>
              <button
                onClick={() => handleVerifyConfirmation('password')}
                className={styles.verify_button}
              >
                Verify and Change Password
              </button>
              <button
                onClick={() => handleCancel('password')}
                className={styles.cancel_button}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>


        {/* <VideoPlayer></VideoPlayer> */}

    </>
  );
  
};

export default UserSettingsPage;