import { AnimatePresence, motion } from "framer-motion";

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.8, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 20 },
  },
  exit: { opacity: 0, scale: 0.85, y: 40 },
};

export default function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50  z-40"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-black border border-white  px-4 md:px-6 py-2 md:py-4 rounded-lg md:rounded-2xl shadow-2xl w-full max-w-md">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
