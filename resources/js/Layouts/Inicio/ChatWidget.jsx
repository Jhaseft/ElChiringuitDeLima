import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiSolidMessageRoundedDots } from "react-icons/bi";
import { IoClose, IoSend } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";

const getSessionId = () => {
  let id = localStorage.getItem("chat_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_session", id);
  }
  return id;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      message: "¡Hola! 👋 Soy tu asistente. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
    },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const sendMessage = async (text) => {
    const value = text.trim();
    if (!value) return;

    const sessionId = getSessionId();
    const newMessages = [...messages, { message: value, sender: "user" }];
    setMessages(newMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await axios.post("/chat/send", {
        message: value,
        session_id: sessionId,
      });
      setMessages([
        ...newMessages,
        { message: res.data.reply, sender: "bot" },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          message: "Hubo un problema al responder. Intenta de nuevo.",
          sender: "bot",
        },
      ]);
    }

    setTyping(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-gray-900 shadow-xl shadow-yellow-500/30 ring-2 ring-yellow-300/50 hover:bg-yellow-300"
            aria-label="Abrir chat"
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, -8, 0] }}
              transition={{
                repeat: Infinity,
                repeatDelay: 2.5,
                duration: 0.9,
                ease: "easeInOut",
              }}
              className="flex items-center justify-center"
            >
              <BiSolidMessageRoundedDots className="text-2xl" />
            </motion.span>
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-yellow-300 ring-2 ring-gray-900" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-700/70 bg-gray-900 shadow-2xl shadow-black/60"
          >
            <div className="flex items-center justify-between border-b border-gray-700/70 bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-gray-900 shadow-md shadow-yellow-500/20">
                  <FaRobot className="text-lg" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-gray-800" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">
                    Asistente Virtual
                  </p>
                  <p className="text-[11px] text-gray-400">En línea</p>
                </div>
              </div>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-700/60 hover:text-white"
                aria-label="Cerrar chat"
              >
                <IoClose className="text-xl" />
              </motion.button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-900 px-4 py-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "rounded-br-sm bg-yellow-400 text-gray-900"
                        : "rounded-bl-sm border border-gray-700/60 bg-gray-800 text-gray-100"
                    }`}
                  >
                    {msg.message}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-sm border border-gray-700/60 bg-gray-800 px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="block h-2 w-2 rounded-full bg-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={scrollRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-gray-700/70 bg-gray-800/60 px-3 py-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 rounded-full bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-gray-700 transition-shadow focus:ring-2 focus:ring-yellow-400"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-gray-900 shadow-md shadow-yellow-500/20 transition-opacity hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Enviar mensaje"
              >
                <IoSend className="text-base" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
