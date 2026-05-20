import React from 'react';
import Header from '../Homepage/header';
const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        This privacy policy ("policy") will help you understand how Zephyr Capital, LLC ("us", "we", "our") uses and protects the data you provide to us when you visit and use example.com ("blog", "service").
      </p>
      <p className="mb-4">
        We reserve the right to change this policy at any given time, of which you will be promptly updated. If you want to make sure that you are up to date with the latest changes, we advise you to frequently visit this page.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">What User Data We Collect</h2>
      <p className="mb-2">When you visit the blog, we may collect the following data:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Your IP address.</li>
        <li>Your contact information and email address.</li>
        <li>Other information such as interests and preferences.</li>
        <li>Data profile regarding your online behavior on our blog.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">Why We Collect Your Data</h2>
      <p className="mb-2">We are collecting your data for several reasons:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>To better understand your needs.</li>
        <li>To improve our services and products.</li>
        <li>To send you promotional emails containing the information we think you will find interesting.</li>
        <li>To contact you to fill out surveys and participate in other types of market research.</li>
        <li>To customize our blog according to your online behavior and personal preferences.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">Safeguarding and Securing the Data</h2>
      <p className="mb-4">
        Zephyr Capital, LLC is committed to securing your data and keeping it confidential. Zephyr Capital, LLC has done all in its power to prevent data theft, unauthorized access, and disclosure by implementing the latest technologies and software, which help us safeguard all the information we collect online.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">Our Cookie Policy</h2>
      <p className="mb-4">
        Once you agree to allow our blog to use cookies, you also agree to use the data it collects regarding your online behavior (analyze web traffic, web pages you visit and spend the most time on).
      </p>
      <p className="mb-4">
        The data we collect by using cookies is used to customize our blog to your needs. After we use the data for statistical analysis, the data is completely removed from our systems.
      </p>
      <p className="mb-4">
        Please note that cookies don't allow us to gain control of your computer in any way. They are strictly used to monitor which pages you find useful and which you do not so that we can provide a better experience for you.
      </p>
      <p className="mb-4">
        If you want to disable cookies, you can do it by accessing the settings of your internet browser. You can visit <a href="https://www.internetcookies.com" className="text-blue-600 hover:underline">https://www.internetcookies.com</a>, which contains comprehensive information on how to do this on a wide variety of browsers and devices.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">Links to Other Websites</h2>
      <p className="mb-4">
        Our blog contains links that lead to other websites. If you click on these links Zephyr Capital, LLC is not held responsible for your data and privacy protection. Visiting those websites is not governed by this privacy policy agreement. Make sure to read the privacy policy documentation of the website you go to from our website.
      </p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">Restricting the Collection of your Personal Data</h2>
      <p className="mb-2">At some point, you might wish to restrict the use and collection of your personal data. You can achieve this by doing the following:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>When you are filling the forms on the blog, make sure to check if there is a box which you can leave unchecked, if you don't want to disclose your personal information.</li>
        <li>If you have already agreed to share your information with us, feel free to contact us via email and we will be more than happy to change this for you.</li>
      </ul>
      <p className="mb-4">
        Zephyr Capital, LLC will not lease, sell or distribute your personal information to any third parties, unless we have your permission. We might do so if the law forces us. Your personal information will be used when we need to send you promotional materials if you agree to this privacy policy.
      </p>
    </div>
  );
};

// export default PrivacyPolicy;

const GDPRComplianceNotice = () => (
  <div>
    <Header/>
    <h2 className="text-2xl font-semibold mt-6 mb-4">GDPR Compliance Notice</h2>
    <p className="mb-4">
      Your privacy is important to us. We are committed to complying with the General Data Protection Regulation (GDPR) to protect your personal data. By using our services, you agree to the collection and use of information in accordance with this notice.
    </p>
    <h3 className="text-xl font-semibold mt-4 mb-2">1. Data We Collect</h3>
    <p className="mb-4">
      We may collect personal information, such as your name, email address, contact details, and other relevant data to provide our services.
    </p>
    <h3 className="text-xl font-semibold mt-4 mb-2">2. How We Use Your Data</h3>
    <p className="mb-4">
      Your data will be used for the following purposes:
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li>To provide and maintain our services</li>
      <li>To communicate with you</li>
      <li>To improve our offerings</li>
      <li>To comply with legal obligations</li>
    </ul>
    <h3 className="text-xl font-semibold mt-4 mb-2">3. Your Rights</h3>
    <p className="mb-4">
      You have the following rights concerning your personal data:
    </p>
    <ul className="list-disc pl-6 mb-4">
      <li><strong>Access</strong>: You can request access to your personal data at any time.</li>
      <li><strong>Correction</strong>: You can request the correction of inaccurate or incomplete data.</li>
      <li><strong>Deletion</strong>: You can request that we delete your data, subject to certain legal exceptions.</li>
      <li><strong>Data Portability</strong>: You can request a copy of your data in a structured, machine-readable format.</li>
      <li><strong>Objection</strong>: You can object to our processing of your data based on legitimate interests.</li>
    </ul>
    <h3 className="text-xl font-semibold mt-4 mb-2">4. Data Sharing</h3>
    <p className="mb-4">
      We do not share your personal data with third parties, except when necessary to provide services (such as payment processing) or comply with legal requirements.
    </p>
    <h3 className="text-xl font-semibold mt-4 mb-2">5. Cookies</h3>
    <p className="mb-4">
      We use cookies to improve your experience on our site. You can adjust your cookie preferences in your browser settings.
    </p>
    <h3 className="text-xl font-semibold mt-4 mb-2">6. Data Retention</h3>
    <p className="mb-4">
      We will retain your personal data only for as long as is necessary to fulfill the purposes for which it was collected or to comply with legal obligations.
    </p>
    <h3 className="text-xl font-semibold mt-4 mb-2">7. Contact Information</h3>
    <p className="mb-4">
      For questions about your data or to exercise any of your rights, please contact our Data Protection Officer (DPO) at zephyrcapitaljak@gmail.com.
    </p>
  </div>
);

export default GDPRComplianceNotice;