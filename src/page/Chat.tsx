import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase"; 
import { auth } from "../firebase"; 

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: any;
}

const Chat = () => {
  const { uid } = useParams<{ uid: string }>();
  const currentUser = auth.currentUser; 
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatUser, setChatUser] = useState<{ username: string } | null>(null);

  if (!currentUser)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            ⚠️ Accès refusé
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vous devez être connecté pour accéder au chat.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );

  const chatId = [currentUser.uid, uid].sort().join("_"); // identifiant unique pour le chat

  useEffect(() => {
  const fetchChatUser = async () => {
    const userDoc = await getDoc(doc(db, "users", uid!));
    if (userDoc.exists()) {
      setChatUser({ username: userDoc.data().username });
    }
  };

  if (uid) fetchChatUser();
}, [uid]);

  // Récupérer les messages en temps réel
  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Scroll automatique vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Envoyer un message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const messagesRef = collection(db, "chats", chatId, "messages");
    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      content: inputMessage,
      createdAt: serverTimestamp(),
    });
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Messages */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Link
          to="/messages"
          className="text-blue-500 hover:text-blue-600 font-semibold flex items-center space-x-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Retour</span>
        </Link>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          Chat avec {chatUser?.username || "Chargement..."}
        </h2>
        <div></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === currentUser.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-xs break-words shadow-md ${
                msg.senderId === currentUser.uid
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs text-gray-400 block text-right mt-1">
                {msg.createdAt?.seconds
                  ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()
                  : ""}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input pour envoyer */}
      <div className="flex p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
        <input
          type="text"
          className="flex-1 p-3 rounded-l-2xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
          placeholder="Écrire un message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-2xl transition-colors"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Chat;


