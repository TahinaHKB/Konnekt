import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  MessageSquare,
  Compass,
  LogOut,
  UserCheck,
} from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Icone from "../assets/connection.png";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("Utilisateur");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || "Utilisateur");
        setProfilePic(data.profilePic);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const activeClass = "text-blue-600 font-semibold";
  const inactiveClass = "text-gray-700 dark:text-gray-100 hover:text-blue-600";

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {" "}
          {/* groupe icône + texte */}
          <img src={Icone} alt="Icône" className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-white">Konnekt</h1>
        </div>

        {/* Liens desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink
            to="/navig"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            <div className="flex items-center gap-1">
              <Compass size={18} /> Naviguer
            </div>
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            <div className="flex items-center gap-1">
              <MessageSquare size={18} /> Messages
            </div>
          </NavLink>

          {/* Profil + dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
            >
              <img
                src={profilePic || "https://via.placeholder.com/30"}
                alt="Profil"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-white">{username}</span>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl shadow-lg overflow-hidden"
                >
                  {/* <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                        isActive ? activeClass : ""
                      }`
                    }
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={18} className="mr-2" /> Paramètres
                  </NavLink> */}
                  <NavLink
                    to="/home"
                    className={({ isActive }) =>
                      `flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                        isActive ? activeClass : ""
                      }`
                    }
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserCheck size={18} className="mr-2" />
                    Mon profil
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <LogOut size={18} className="mr-2" /> Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bouton burger mobile */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-100 focus:outline-none"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu mobile animé */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-3 space-y-3"
          >
            {/* Photo + nom en haut */}
            <div className="flex items-center gap-3 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              <img
                src={profilePic || "https://via.placeholder.com/40"}
                alt="Profil"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {username}
                </span>
                {/* <span className="text-sm text-gray-500 dark:text-gray-400">
                  Voir mon profil
                </span> */}
              </div>
            </div>

            <NavLink
              to="/navig"
              className={({ isActive }) =>
                `block flex items-center gap-2 ${
                  isActive ? activeClass : inactiveClass
                }`
              }
              onClick={toggleMenu}
            >
              <Compass size={18} /> Naviguer
            </NavLink>

            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `block flex items-center gap-2 ${
                  isActive ? activeClass : inactiveClass
                }`
              }
              onClick={toggleMenu}
            >
              <MessageSquare size={18} /> Messages
            </NavLink>

            <NavLink
              to="/home"
              className={({ isActive }) =>
                `block flex items-center gap-2 ${
                  isActive ? activeClass : inactiveClass
                }`
              }
              onClick={toggleMenu}
            >
              <User size={18} /> Voir mon profil
            </NavLink>

            {/* <NavLink
              to="/settings"
              className={({ isActive }) =>
                `block flex items-center gap-2 ${
                  isActive ? activeClass : inactiveClass
                }`
              }
              onClick={toggleMenu}
            >
              <Settings size={18} /> Paramètres
            </NavLink> */}

            <button
              onClick={() => {
                toggleMenu();
                handleLogout();
              }}
              className="w-full text-left flex items-center gap-2 hover:text-blue-600"
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

