import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // ton fichier de config Firebase
import { useNavigate } from "react-router-dom";
import NavBar from "../component/NavBar";

interface User {
  uid: string;
  username: string;
  profilePic: string;
  lastMessage?: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData: User[] = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];

      // Exclure l'utilisateur connecté
      const filteredUsers = usersData.filter(
        (user) => user.uid !== currentUser.uid
      );

      setUsers(filteredUsers);
    };

    fetchUsers();
  }, []);

  return (
    <>
      <NavBar />
      <div className="max-w-3xl mx-auto p-4 pt-[60px]">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Tous les utilisateurs
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map((user) => (
            <div
              key={user.uid}
              onClick={() => navigate(`/chat/${user.uid}`)}
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl cursor-pointer transition-shadow"
            >
              <img
                src={user.profilePic}
                alt={user.username}
                className="w-14 h-14 rounded-full object-cover mr-4"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {user.username}
                </span>
                {user.lastMessage && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-xs">
                    {user.lastMessage}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UsersList;
