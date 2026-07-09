import { useEffect, useRef, useState } from 'react'
import { FiMessageCircle, FiX } from 'react-icons/fi'

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
      text: `Hi, I can help with Bounce Academy shopping questions. If you need something else, contact us at ${ownerContact.email} or ${ownerContact.phone}.`,
    },
  ])
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div className="mb-3 flex h-[28rem] w-[20rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-soft backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">Bounce Assistant</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition hover:border-black hover:text-black"
              aria-label="Close assistant"
            >
              <FiX />
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {faq.map((item) => (
              <button
                key={item.question}
                type="button"
                onClick={() => handleQuestionSelect(item.question)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                  activeQuestion === item.question
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-black hover:text-black'
                }`}
              >
                {item.question}
              </button>
            ))}
          </div>

          <div className="mb-3 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              placeholder="Ask about shipping, orders, returns..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
            <div className="flex items-center justify-between gap-2">
              <button type="submit" className="button-primary px-3 py-2 text-xs">
                Send
              </button>
              <p className="text-[11px] text-gray-500">Shop FAQs only. Other topics show contact details.</p>
            </div>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black bg-black text-white shadow-soft transition hover:translate-y-[-1px]"
      >
        <FiMessageCircle className="h-5 w-5" />
      </button>
    </div>
  )
}
