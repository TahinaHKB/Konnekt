import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion } from "framer-motion";
import NavBar from "../component/NavBar";
import { useNavigate } from "react-router-dom";
import type { Post, PostComment } from "../data/postTest";
import LoadingComment from "../component/LoadingComment";

export default function Naviguer() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const getUserProfilePic = async (userId: string) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data().profilePic; // ici ton URL
    }
    return null; // pas trouvé
  };

  const fetchPosts = async (): Promise<Post[]> => {
    if (!currentUser) {
      navigate("/");
      return [];
    }

    setLoading(true);

    // Créer la requête
    const postsQuery = query(
      collection(db, "posts"), // collection globale des posts
      orderBy("createdAt", "desc"), // trier du plus récent au plus vieux
      limit(10) // ne prendre que les 10 premiers
    );

    // Exécuter la requête
    const postsSnapshot = await getDocs(postsQuery);

    // Récupérer les données
    const posts: Post[] = await Promise.all(
      postsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const profilePic = await getUserProfilePic(data.userId);

        const commentsSnapshot = await getDocs(
          collection(db, "posts", doc.id, "comments")
        );
        const comments: PostComment[] = commentsSnapshot.docs.map((c) => ({
          userId: c.data().userId,
          username: c.data().username,
          content: c.data().content,
          createdAt: c.data().createdAt,
        }));

        const reactionSnapshot = await getDocs(
          collection(db, "posts", doc.id, "reactions")
        );

        return {
          id: doc.id,
          userId: data.userId,
          profilePic,
          username: data.userName,
          content: data.content,
          createdAt: data.createdAt,
          likeCount: data.likeCount ?? 0,
          commentCount: data.commentCount ?? 0,
          imageUrl: data.imageUrl,
          comments,
          loveCount: reactionSnapshot.docs.length
        };
      })
    );

    setLoading(false);
    return posts;
  };

  // Récupérer tous les posts avec réactions et commentaires
  useEffect(() => {
    const getPosts = async () => {
      const latestPosts = await fetchPosts();
      setPosts(latestPosts);
    };
    getPosts();
  }, [currentUser, navigate]);

  const handleLoadMore = () => {
    const next = visibleCount + 10;
    setVisibleCount(next);
  };

  // Toggle "J'adore"
  const toggleLove = async (post: Post) => {
    if (!currentUser || !post.username) return;
    const reactionRef = doc(
      db,
      "posts",
      post.id,
      "reactions",
      currentUser.uid
    );
    const reactionsSnap = await getDocs(
      collection(db, "posts", post.id, "reactions")
    );
    const exists = reactionsSnap.docs.find((d) => d.id === currentUser.uid);

    if (exists) {
      await deleteDoc(reactionRef);
    } else {
      await setDoc(reactionRef, {
        username: currentUser.uid,
        type: "love",
      });
    }

    const updatedPosts = posts.map((p) =>
      p.id === post.id
        ? {
            ...p,
            loveCount: exists ? (p.loveCount || 1) - 1 : (p.loveCount || 0) + 1,
          }
        : p
    );
    setPosts(updatedPosts);
  };

  // Ajouter un commentaire
  const addComment = async (post: Post) => {
    if (!currentUser || !post.username) {
      alert("klj");
      return;
    }
    const input = commentInputs[post.id];
    if (!input) return;

    const commentsRef = collection(db, "posts", post.id, "comments");
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const username = userDoc.data()?.username;

    // Créer l'objet commentaire
    const newComment = {
      id: crypto.randomUUID(),
      userId: currentUser.uid,
      username: username,
      content: input,
      createdAt: new Date().toISOString(),
    };

    // Ajouter dans Firestore
    await addDoc(commentsRef, {
      userId: newComment.userId,
      username: newComment.username,
      content: newComment.content,
      createdAt: newComment.createdAt,
    });

    // Ajouter directement dans post.comments pour l'affichage instantané
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === post.id
          ? { ...p, comments: [...(p.comments || []), newComment] }
          : p
      )
    );

    setCommentInputs({ ...commentInputs, [post.id]: "" });
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex flex-col items-center py-10 pt-[60px] px-4">
        {loading ? (
          <LoadingComment />
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-lg">
            Aucune publication pour le moment 😢
          </p>
        ) : (
          <div className="flex flex-col space-y-6 w-full max-w-3xl">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center mb-4">
                  <img
                    src={post.profilePic || "/default-profile.png"}
                    alt={post.username}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {post.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4 mb-6 transition-colors hover:shadow-xl">
                  {/* Contenu */}
                  <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg mb-4 leading-relaxed break-words">
                    {post.content}
                  </p>
                  {post.imageUrl && (
                    <div className="w-full overflow-hidden rounded-xl mb-4">
                      <img
                        src={post.imageUrl}
                        alt="Publication"
                        className="w-full h-auto max-h-96 object-cover rounded-xl transition-transform transform hover:scale-105"
                      />
                    </div>
                  )}
                </div>

                {/* Reactions */}
                <div className="flex items-center space-x-4 mt-3">
                  <button
                    onClick={() => toggleLove(post)}
                    className="text-red-500 font-semibold"
                  >
                    ❤️ {post.loveCount || 0}
                  </button>
                </div>

                {/* Commentaires */}
                <div className="mt-3 space-y-2">
                  {post.comments?.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 dark:text-gray-100 sm:mr-2">
                        {c.username}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 break-words">
                        {c.content}
                      </p>
                      <span className="text-xs text-gray-400 ml-auto mt-1 sm:mt-0">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex mt-2 space-x-2">
                    <input
                      type="text"
                      placeholder="Écrire un commentaire..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [post.id]: e.target.value,
                        })
                      }
                      className="border rounded px-3 py-1 w-full"
                    />
                    <button
                      onClick={() => addComment(post)}
                      className="bg-blue-500 text-white px-4 py-1 rounded"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {visibleCount && (
              <button
                onClick={handleLoadMore}
                className="mx-auto bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition font-semibold"
              >
                Charger plus
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
