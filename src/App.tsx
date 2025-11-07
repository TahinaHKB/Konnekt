import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./page/Register";
import Login from "./page/Login"
import Home from "./page/Home"
import Naviguer from "./page/Navig";
import UsersList from "./page/Message";
import Chat from "./page/Chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/navig" element={<Naviguer />} />
        <Route path="/home" element={<Home />} />
        <Route path="/messages" element={<UsersList />} />
        <Route path="/chat/:uid" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
