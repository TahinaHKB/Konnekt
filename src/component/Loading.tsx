import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-50 to-blue-50">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Le cercle animé */}
        <motion.div
          className="w-16 h-16 border-4 border-t-purple-500 border-blue-500 rounded-full mb-4"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 1,
          }}
        />

        {/* Le texte amusant */}
        <motion.p
          className="text-lg font-bold text-purple-700 text-center"
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
          }}
        >
          Chargement en cours... 
        </motion.p>

        {/* Petite phrase fun */}
        <motion.p
          className="mt-2 text-sm text-gray-500 text-center max-w-xs"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
          }}
        >
          Patiente un instant, on prépare tout pour toi !
        </motion.p>
      </motion.div>
    </div>
  );
}
