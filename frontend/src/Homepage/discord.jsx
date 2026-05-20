import { FaDiscord } from "react-icons/fa";

const DiscordLink = ({ text = "Join our Discord" }) => {
  return (
    <a
      href={"https://discord.gg/wdKZK6kGBs"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
    >
      <FaDiscord size={24} />
      {text}
    </a>
  );
};

export default DiscordLink;