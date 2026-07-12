import { useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiMessageCircle, FiX } from 'react-icons/fi'

const faq = [
  {
    question: 'Shipping time',
    keywords: ['shipping', 'delivery', 'arrive', 'ship'],
    answer: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.',
  },
  {
    question: 'Order tracking',
    keywords: ['track', 'tracking', 'order status', 'status'],
    answer: 'Open Account > Orders to view the current status of each purchase.',
  },
  {
    question: 'Returns policy',
    keywords: ['return', 'refund', 'exchange', 'policy'],
    answer: 'You can return eligible products within 14 days if they are unused and in original packaging.',
  },
  {
    question: 'Sizing help',
    keywords: ['size', 'sizing', 'fit', 'measure'],
    answer: 'Product pages show the available sizes. If you need help choosing one, I can connect you with the owner.',
  },
]

const ownerContact = {
  email: 'info@bounceacademy.com',
  phone: '0927 437 2354',
}

function getAssistantReply(message) {
  const normalizedMessage = message.trim().toLowerCase()

  if (!normalizedMessage) {
    return 'Please type a shop-related question or choose one of the FAQ topics below.'
  }

  const matchedFaq = faq.find((item) =>
    [item.question, ...(item.keywords ?? [])].some((term) => normalizedMessage.includes(term.toLowerCase())),
  )

  if (matchedFaq) {
    return matchedFaq.answer
  }

  return `I can help with Bounce Academy shop questions. For other concerns, please contact us at ${ownerContact.email} or ${ownerContact.phone}.`
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi I'm Bouncey, I can help with the shopping questions. If you need something else, contact us at ${ownerContact.email} or ${ownerContact.phone}.`,
    },
  ])
  const [messageInput, setMessageInput] = useState('')
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const container = messagesContainerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [isOpen, messages])

  function pushAssistantMessage(text) {
    setMessages((prev) => [...prev, { role: 'assistant', text }])
  }

  function handleQuestionSelect(question) {
    setActiveQuestion(question)
    const matchedFaq = faq.find((item) => item.question === question)
    if (matchedFaq) {
      setMessages((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', text: matchedFaq.answer }])
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedMessage = messageInput.trim()
    if (!trimmedMessage) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmedMessage }])
    pushAssistantMessage(getAssistantReply(trimmedMessage))
    setMessageInput('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-5 sm:right-5">
      {isOpen ? (
        <div className="chatbot-panel mb-3 flex h-[26rem] min-h-0 w-[22rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white text-black shadow-[0_24px_70px_rgba(0,0,0,0.16)] sm:h-[30rem] sm:w-[24rem]">
          <div className="relative overflow-hidden border-b border-gray-200 bg-white px-4 py-4">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-black/5 blur-3xl" />
            <div className="absolute -bottom-8 right-0 h-24 w-24 rounded-full bg-black/5 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-black text-white shadow-lg">
                  <FiMessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-black">Bouncey</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-black"
                aria-label="Close assistant"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={messagesContainerRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-[1.15rem] px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'border border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {faq.map((item) => (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => handleQuestionSelect(item.question)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                      activeQuestion === item.question
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    {item.question}
                  </button>
                ))}
              </div>

              <label className="block">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    placeholder="Ask about shipping, orders, returns..."
                    className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none transition focus:border-black"
                  />

                  <button
                    type="submit"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-black transition hover:border-black hover:bg-gray-50"
                    aria-label="Send message"
                  >
                    <FiArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </label>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-black bg-black text-white shadow-[0_14px_35px_rgba(0,0,0,0.28)] transition hover:translate-y-[-1px] hover:bg-gray-900 ${
          isOpen ? 'shadow-[0_18px_40px_rgba(0,0,0,0.34)]' : ''
        }`}
        aria-label="Open chat assistant"
        aria-expanded={isOpen}
      >
        <span
          className={`absolute inset-0 rounded-full bg-white/20 transition-opacity duration-300 ${
            isOpen ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'
          }`}
        />
        <FiMessageCircle
          className={`relative h-5 w-5 transition-transform duration-300 ease-out ${
            isOpen ? 'scale-110 rotate-12' : 'scale-100 rotate-0 group-hover:scale-110'
          }`}
        />
      </button>
    </div>
  )
}
