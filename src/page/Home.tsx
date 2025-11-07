import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { type Post } from "../data/postTest";
import NavBar from "../component/NavBar";
import { motion } from "framer-motion";
import Loading from "../component/Loading";

const CLOUD_NAME = "dyjgjijfa"; // Remplace par ton Cloudinary cloud name
const UPLOAD_PRESET = "konnektData"; // Remplace par ton preset unsigned

const Profile: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const navigate = useNavigate();

  const fetchPosts = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const postsRef = query(
      collection(db, "posts"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(postsRef);
    const loadedPosts: Post[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
    setPosts(loadedPosts.reverse()); // Affiche les plus récents en haut
    setLoading(false);
  };

  const handleDeletePost = async (postId: string, _imageUrl?: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const postRef = doc(db, "posts", postId);
      await deleteDoc(postRef);

      // Met à jour localement
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));

      console.log("✅ Publication supprimée avec succès");
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.username);
        setEmail(data.email);
        setBirthdate(data.birthdate || "");
        setProfilePic(data.profilePic || "");
      }

      //Charger les publications
      fetchPosts();
    };

    fetchUserData();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      username,
      birthdate,
      profilePic,
    });
    alert("Profil mis à jour !");
  };

  const handlePostCreate = async () => {
    const user = auth.currentUser;
    if (!user || !newPost.trim()) return;

    let imageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", UPLOAD_PRESET);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        imageUrl = data.secure_url;
      } catch (error) {
        console.error("Erreur upload image Cloudinary:", error);
        alert("Erreur upload image");
        return;
      }
    }

    const postId = new Date().getTime().toString();
    const postRef = doc(db, "posts", postId);

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const username = userDoc.data()?.username;

    try {
      await setDoc(postRef, {
        userId: user.uid,
        userName: username,
        content: newPost,
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      setNewPost("");
      setSelectedFile(null);
      fetchPosts();
      alert("Publication créée !");
    } catch (error) {
      console.error("Erreur création post :", error);
      alert("Erreur création post");
    }
  };

  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      setProfilePic(res.data.secure_url); // URL publique Cloudinary
    } catch (err) {
      console.error("Erreur upload Cloudinary :", err);
      alert("Erreur lors de l'upload de l'image.");
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex flex-col items-center py-10 pt-[60px] px-4 md:px-10">
        {/* === Ligne du haut === */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Profil utilisateur */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-purple-200 flex flex-col"
          >
            <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-700">
              Mon Profil
            </h2>

            <div className="flex flex-col items-center mb-6">
              <div className="relative w-28 h-28 mb-4">
                <img
                  src={profilePic}
                  alt="Profil"
                  className="w-full h-full rounded-full object-cover shadow-lg border-4 border-purple-200"
                />
                <label className="absolute bottom-0 right-0 bg-purple-500 p-1 rounded-full cursor-pointer hover:bg-purple-600 transition">
                  <input
                    type="file"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 13V7a1 1 0 011-1h10a1 1 0 011 1v6h2v-6a3 3 0 00-3-3H5a3 3 0 00-3 3v6h2zM2 15a2 2 0 012-2h12a2 2 0 012 2v2H2v-2z" />
                  </svg>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none cursor-not-allowed"
                disabled
                placeholder="Nom d'utilisateur"
              />
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
              />
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
              <button
                onClick={handleProfileUpdate}
                className="w-full bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition font-semibold"
              >
                Mettre à jour le profil
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-blue-200 flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-2 text-center text-blue-700 flex items-center justify-center gap-2">
              Créer une publication
            </h2>

            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Partage tes pensées, tes idées ou un moment de ta journée. Ajoute
              une image si tu veux rendre ta publication plus vivante !
            </p>

            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Exprime-toi librement ici..."
              className="w-full mb-4 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none h-28"
            />

            {/* Input file stylé */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
                📸 Ajouter une image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.length && setSelectedFile(e.target.files[0])
                  }
                  className="hidden"
                />
                <span className="px-3 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-sm">
                  Choisir un fichier
                </span>
              </label>
            </div>

            {/* Aperçu de l'image sélectionnée */}
            {selectedFile && (
              <div className="mb-4">
                <p className="text-gray-500 text-sm mb-2">Aperçu :</p>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Aperçu de la publication"
                  className="w-full max-h-60 object-cover rounded-xl shadow-md"
                />
              </div>
            )}

            <button
              onClick={handlePostCreate}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-600 transition font-semibold shadow-md"
            >
              Publier maintenant
            </button>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Tes publications apparaîtront juste en dessous 👇
            </p>
          </motion.div>
        </div>

        {/* === Ligne du bas : publications === */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-7xl bg-white p-8 rounded-3xl shadow-xl border border-gray-200"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Mes publications
          </h3>

          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Aucune publication pour le moment.
            </p>
          ) : (
            <div
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth 
                       scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100 pb-4"
            >
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="snap-center min-w-[280px] sm:min-w-[320px] md:min-w-[350px] 
               border rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-blue-50 
               hover:from-purple-100 hover:to-blue-100 transition shadow-md 
               relative"
                >
                  <p className="mb-2 text-gray-800 font-medium">
                    {post.content}
                  </p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Publication"
                      className="w-full h-52 object-cover rounded-xl mb-2 shadow-sm"
                    />
                  )}

                  <p className="text-xs text-gray-400 text-right">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>

                  {/* Bouton Supprimer */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeletePost(post.id, post.imageUrl)}
                    className="absolute top-3 right-3 text-white bg-red-500 hover:bg-red-600 
                 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition"
                  >
                    Supprimer
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Profile;

