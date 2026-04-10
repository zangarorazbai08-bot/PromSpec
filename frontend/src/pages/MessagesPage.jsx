import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, MessageSquareMore, Send } from 'lucide-react';
import { chatApi } from '../api';
import { getBookingStatusLabel } from '../labels';

export default function MessagesPage({ notify, session }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeBookingId, setActiveBookingId] = useState(searchParams.get('bookingId') || '');
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConversations = async (preferredBookingId = activeBookingId) => {
    setLoadingConversations(true);

    try {
      const data = await chatApi.conversations();
      setConversations(data.conversations);

      const nextBookingId =
        preferredBookingId && data.conversations.some((item) => String(item.bookingId) === String(preferredBookingId))
          ? String(preferredBookingId)
          : data.conversations[0]
            ? String(data.conversations[0].bookingId)
            : '';

      setActiveBookingId(nextBookingId);

      if (nextBookingId) {
        await loadMessages(nextBookingId, false);
      } else {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (error) {
      notify('error', error.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (bookingId, syncUrl = true) => {
    if (!bookingId) {
      return;
    }

    setLoadingMessages(true);

    try {
      const data = await chatApi.messages(bookingId);
      setActiveConversation(data.conversation);
      setMessages(data.messages);
      setActiveBookingId(String(bookingId));

      if (syncUrl) {
        setSearchParams({ bookingId: String(bookingId) }, { replace: true });
      }
    } catch (error) {
      notify('error', error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    const bookingIdFromUrl = searchParams.get('bookingId') || '';
    setActiveBookingId(bookingIdFromUrl);
    loadConversations(bookingIdFromUrl);
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!activeBookingId || !messageText.trim()) {
      return;
    }

    setSending(true);

    try {
      await chatApi.send(activeBookingId, { message: messageText });
      setMessageText('');
      await loadMessages(activeBookingId);
      const refreshed = await chatApi.conversations();
      setConversations(refreshed.conversations);
    } catch (error) {
      notify('error', error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section-gap">
      <div className="container messages-layout">
        <aside className="glass-card messages-sidebar reveal">
          <div className="section-head compact">
            <div>
              <h1>Чаттар</h1>
              <p>Жалға беруші мен брондаушы арасындағы хабарламалар.</p>
            </div>
            <MessageSquareMore size={20} />
          </div>

          <div className="conversation-list">
            {loadingConversations ? (
              <div className="list-skeleton" />
            ) : conversations.length ? (
              conversations.map((conversation) => (
                <button
                  className={`conversation-card ${String(conversation.bookingId) === String(activeBookingId) ? 'active' : ''}`}
                  key={conversation.bookingId}
                  onClick={() => loadMessages(conversation.bookingId)}
                  type="button"
                >
                  <img
                    alt={conversation.property.title}
                    decoding="async"
                    loading="lazy"
                    sizes="92px"
                    src={conversation.property.image}
                  />
                  <div>
                    <strong>{conversation.property.title}</strong>
                    <span>{conversation.peer.fullName}</span>
                    <p>{conversation.lastMessage || 'Чатты бастауға болады'}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="empty-state compact-empty">
                <h3>Чат жоқ</h3>
                <p>Чат бронь пайда болғаннан кейін ашылады.</p>
              </div>
            )}
          </div>
        </aside>

        <section className="glass-card messages-panel reveal delay-1">
          {activeConversation ? (
            <>
              <div className="messages-header">
                <div>
                  <h2>{activeConversation.property.title}</h2>
                  <p>{activeConversation.peer.fullName}</p>
                </div>
                <span className={`status-badge status-${activeConversation.bookingStatus}`}>{getBookingStatusLabel(activeConversation.bookingStatus)}</span>
              </div>

              <div className="message-meta-row">
                <span>
                  <CalendarDays size={16} />
                  {activeConversation.checkIn} - {activeConversation.checkOut}
                </span>
                <span>{activeConversation.property.city}</span>
              </div>

              <div className="message-stream">
                {loadingMessages ? (
                  <div className="list-skeleton" />
                ) : messages.length ? (
                  messages.map((message) => (
                    <article
                      className={`message-bubble ${message.senderId === session.user.id ? 'me' : 'other'}`}
                      key={message.id}
                    >
                      <strong>{message.sender.fullName}</strong>
                      <p>{message.message}</p>
                      <span>{new Date(message.createdAt).toLocaleString('kk-KZ')}</span>
                    </article>
                  ))
                ) : (
                  <div className="empty-state compact-empty">
                    <h3>Хабарлама жоқ</h3>
                    <p>Осы бронь бойынша әңгімені бастауға болады.</p>
                  </div>
                )}
              </div>

              <form className="message-form" onSubmit={handleSendMessage}>
                <textarea
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Хабарлама жазыңыз"
                  rows="3"
                  value={messageText}
                />
                <button className="button primary" disabled={sending} type="submit">
                  <Send size={18} />
                  {sending ? 'Жіберілуде...' : 'Жіберу'}
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <h3>Белсенді чат таңдалмаған</h3>
              <p>Алдымен бронь жасаңыз немесе бронь бетінде чатқа өтіңіз.</p>
              <Link className="button primary" to="/bookings">
                Броньдарға өту
              </Link>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
