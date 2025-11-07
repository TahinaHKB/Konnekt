import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../component/LoadingComment";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!email || password.length < 6)
        throw new Error("Email ou mot de passe invalide");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Enregistrement Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        username: username,
        birthdate: "none",
        profilePic: "https://res.cloudinary.com/dyjgjijfa/image/upload/v1762547536/m11dom2lca9yzbrc1qpf.png"
      });

      setError("Utilisateur créé :" + user.uid);
      navigate("/login");
    } catch (err: any) {
      setError("Erreur inscription :" + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-green-500 px-4">
  <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-md">
    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
      Créer un compte
    </h2>
    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
    <form onSubmit={handleRegister} className="space-y-4">
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
      />
      {loading ? <Loading msg="Création du compte..." /> : 
      <button
        type="submit"
        className="w-full bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition"
      >
        Créer un compte
      </button>
      }
    </form>
    <div className="mt-6 text-center text-gray-500 text-sm sm:text-base">
      Déjà un compte ?{" "}
      <Link
        to="/"
        className="text-purple-500 font-semibold hover:underline"
      >
        Se connecter
      </Link>
    </div>
  </div>
</div>

  );
};

export default Register;


