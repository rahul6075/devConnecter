import React from "react";
import Sidebar from "./Sidebar";
import ChatPage from "./ChatPage";
const Chat = () => {
  return (
    <div className="chat_app">
      <div className="chat_app_body">
        <Sidebar />
        <ChatPage />
      </div>
    </div>
  );
};

export default Chat;
