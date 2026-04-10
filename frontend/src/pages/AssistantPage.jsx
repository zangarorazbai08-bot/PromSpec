import { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { assistantApi } from '../api';

export default function AssistantPage({ notify }) {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: 'Сұрағыңызды жазыңыз. Мен брондау мен жалға беру бойынша көмектесемін.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuestion = async (question) => {
    const text = question.trim();

    if (!text || loading) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const data = await assistantApi.chat({
        messages: nextMessages.map((message) => ({
          role: message.role,
          text: message.text
        }))
      });

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: data.reply.text
        }
      ]);
    } catch (error) {
      notify('error', error.message);
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendQuestion(input);
  };

  return (
    <section className="section-gap">
      <div className="container assistant-shell assistant-shell-compact">
        <section className="glass-card assistant-chat reveal">
          <div className="assistant-compact-head">
            <div>
              <span className="eyebrow">
                <Bot size={16} />
                AI көмекші
              </span>
              <h1>Жалға беру және брондау бойынша чат</h1>
            </div>
          </div>

          <div className="assistant-stream">
            {messages.map((message, index) => (
              <article
                className={`message-bubble ${message.role === 'user' ? 'me' : 'other'} ${
                  index === 0 && message.role === 'assistant' ? 'assistant-intro-bubble' : ''
                }`}
                key={message.id}
              >
                <strong>{message.role === 'user' ? 'Сіз' : 'Gemini'}</strong>
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          <form className="message-form assistant-form" onSubmit={handleSubmit}>
            <textarea
              className="assistant-input"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Сұрағыңызды жазыңыз"
              rows="1"
              value={input}
            />
            <button className="button primary" disabled={loading} type="submit">
              <Send size={18} />
              {loading ? 'Жауап жазылуда...' : 'Жіберу'}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
