import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CryptoJS from "crypto-js";

// Initialize Google Analytics with enhanced user tracking

export const initGA = (measurementId, userId) => {
    if (!window.gtag) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);

        script.onload = () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                window.dataLayer.push(arguments);
            }
            window.gtag = gtag;

            gtag("js", new Date());
            
            // Set the user property first
            gtag("set", "user_properties", {
                user_id: userId
            });
            
            // Then configure with measurement ID
            gtag("config", measurementId);
        };
    }
};


// export const initGA = (measurementId, userId) => {
//     if (!window.gtag) {
//         const script = document.createElement("script");
//         script.async = true;
//         script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
//         document.head.appendChild(script);

//         script.onload = () => {
//             window.dataLayer = window.dataLayer || [];
//             function gtag() {
//                 window.dataLayer.push(arguments);
//             }
//             window.gtag = gtag;

//             gtag("js", new Date());
//             gtag("config", measurementId, {
//                 user_id: userId,
//                 custom_map: {
//                     'dimension1': 'user_type',
//                     'dimension2': 'last_login_date'
//                 }
//             });
//         };
//     }
// };

// Enhanced track page view with user context
export const trackPageView = (path, userId) => {
    if (window.gtag) {
        window.gtag("config", "G-RNE4MCT56P", {
            page_path: path,
            user_id: userId
        });
    }
};
export const trackEvent = ({ category, action, label, value }) => {
    if (window.gtag) {
        window.gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};
// Enhanced event tracking with user engagement metrics
export const trackUserEngagement = (username, actionType) => {
    if (window.gtag) {
        // Hash the username for privacy
        const hashedUserId = CryptoJS.SHA256(username).toString();
        
        window.gtag("event", "user_login", {
            // Send user info as event parameters
            username: hashedUserId,
            action_type: actionType,
            login_timestamp: new Date().toISOString(),
        });
    }
};

// Function to check competition eligibility
export const checkLoginEligibility = async (username) => {
    const hashedUserId = CryptoJS.SHA256(username).toString();
    
    // Track the eligibility check
    trackEvent({
        category: "Competition",
        action: "eligibility_check",
        label: hashedUserId,
        value: 1
    });

    // Your database query logic here
    // Return true if user has logged in within last 7 days
    return true; // Replace with actual implementation
};

const LoginButton = ({ username, onLoginSuccess }) => {
    const [lastLoginDate, setLastLoginDate] = useState(null);
    const hashedUserId = CryptoJS.SHA256(username).toString();

    useEffect(() => {
        initGA("G-RNE4MCT56P", hashedUserId);
        trackPageView(window.location.pathname, hashedUserId);
    }, [hashedUserId]);

    const handleLoginClick = async () => {
        const timestamp = new Date();
        setLastLoginDate(timestamp);

        // Track the login event with enhanced data
        trackEvent({
            category: "User",
            action: "login",
            label: username,
            value: username
        });

        // Track detailed user engagement
        trackUserEngagement(username, "login");

        // Check competition eligibility
        const isEligible = await checkLoginEligibility(username);

        // Track competition eligibility status
        trackEvent({
            category: "Competition",
            action: "eligibility_status",
            label: isEligible ? "eligible" : "ineligible",
            value: isEligible ? 1 : 0
        });

        if (onLoginSuccess) {
        //   alert("you are good for login!")
        } else {
            // alert("contact adminstrator about participation in competition")
        }
    };

    return (
        <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleLoginClick}
        >
            Sign in
        </Button>
    );
};

export default LoginButton;