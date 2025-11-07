export interface PostComment {
  id?: string;
  username: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId?: string;
  username?: string;
  profilePic?: string;
  loveCount?: number;
  comments?: PostComment[];
}


export const testPosts: Post[] = [
  {
    id: "1",
    content:
      "Aujourd'hui j'ai découvert Cloudinary, c'est super pratique pour stocker des images !",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    content:
      "Je travaille sur mon profil utilisateur React + Firebase, ça avance bien 😎",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    content:
      "Test de publication : juste pour voir comment ça s'affiche dans l'UI.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    content: "Envie de coder toute la nuit… qui est avec moi ? 💻🔥",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    content:
      "Aujourd'hui j'ai mis à jour mon profil et ajouté une photo de profil.",
    createdAt: new Date().toISOString(),
  },
];