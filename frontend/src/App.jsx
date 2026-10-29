import { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronDown, Clock3, GraduationCap, MapPin, Menu, Search, Sparkles, Users, X } from 'lucide-react';

const events = [
  { id: 'EV-101', title: 'Diseña tu primera página web', category: 'Tecnología', date: '24', month: 'OCT', time: '9:00 a. m. – 12:00 p. m.', place: 'Universidad EAFIT · Medellín', seats: 18, level: 'Principiante', image: 'photo-1498050108023-c5249f4df085', tone: 'mint', tag: 'Taller práctico' },
  { id: 'EV-102', title: 'Ideas que se convierten en proyectos', category: 'Emprendimiento', date: '28', month: 'OCT', time: '4:00 p. m. – 6:00 p. m.', place: 'Ruta N · Medellín', seats: 0, level: 'Todos los niveles', image: 'photo-1521737711867-e3b97375f902', tone: 'peach', tag: 'Charla' },
  { id: 'EV-103', title: 'Inglés para comunicar tus ideas', category: 'Idiomas', date: '02', month: 'NOV', time: '10:00 a. m. – 1:00 p. m.', place: 'Biblioteca Pública Piloto', seats: 12, level: 'Intermedio', image: 'photo-1455390582262-044cdead277a', tone: 'lilac', tag: 'Laboratorio' },
  { id: 'EV-104', title: 'Finanzas personales sin enredos', category: 'Educación financiera', date: '05', month: 'NOV', time: '6:00 p. m. – 7:30 p. m.', place: 'Comfama · San Ignacio', seats: 24, level: 'Principiante', image: 'photo-1554224155-6726b3ff858f', tone: 'yellow', tag: 'Sesión abierta' },
  { id: 'EV-105', title: 'Narrar historias con fotografía', category: 'Cultura', date: '09', month: 'NOV', time: '2:00 p. m. – 5:00 p. m.', place: 'Casa Museo Pedro Nel Gómez', seats: 8, level: 'Todos los niveles', image: 'photo-1452587925148-ce544e77e70d', tone: 'blue', tag: 'Taller práctico' },
  { id: 'EV-106', title: 'Inteligencia artificial para aprender', category: 'Tecnología', date: '14', month: 'NOV', time: '9:30 a. m. – 11:30 a. m.', place: 'Parque Explora · Medellín', seats: 32, level: 'Principiante', image: 'photo-1677442136019-21780ecad995', tone: 'rose', tag: 'Próximamente', soon: true },
];

const categories = ['Todos', 'Tecnología', 'Emprendimiento', 'Idiomas', 'Educación financiera', 'Cultura'];

function App() {
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [checkin, setCheckin] = useState({ inscripcion_id: '', evento_id: '' });
  const [checkinResult, setCheckinResult] = useState(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const filtered = useMemo(() => events.filter((event) => (category === 'Todos' || event.category === category) && `${event.title} ${event.category} ${event.place}`.toLowerCase().includes(query.toLowerCase())), [category, query]);

  const registerInterest = (event) => {
    if (!event.seats) {
      setNotice(`“${event.title}” está lleno. La lista de espera estará disponible cuando conectemos n8n.`);
    } else {
      setNotice(`¡Listo! La inscripción a “${event.title}” se conectará con tu cuenta cuando activemos n8n.`);
    }
    setSelected(null);
  };

  const subscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setNotice(`Gracias. Te avisaremos de nuevas experiencias educativas en ${email}.`); setEmail(''); }
  };

  const submitCheckin = async (e) => {
    e.preventDefault();
    setCheckinLoading(true);
    setCheckinResult(null);
    const endpoint = import.meta.env.VITE_N8N_CHECKIN_URL || 'https://saraosorio.app.n8n.cloud/webhook/ep11/checkin';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscripcion_id: checkin.inscripcion_id.trim(), evento_id: checkin.evento_id.trim() }),
      });
      const data = await response.json();
      const messages = {
        EXITOSO: 'Check-in realizado correctamente.',
        DUPLICADO: 'El ingreso ya había sido registrado.',
        RECHAZADO: data.mensaje || 'No se pudo autorizar el ingreso.',
      };
      const resultKinds = { EXITOSO: 'success', DUPLICADO: 'duplicate', RECHAZADO: 'rejected' };
      setCheckinResult({
        kind: resultKinds[data.resultado] || 'error',
        message: messages[data.resultado] || data.mensaje || 'El servicio devolvió una respuesta no reconocida.',
        detail: data.checkin_id ? `Código: ${data.checkin_id}` : '',
      });
      if (response.ok && data.resultado === 'EXITOSO') setCheckin({ inscripcion_id: '', evento_id: '' });
    } catch {
      setCheckinResult({ kind: 'error', message: 'No fue posible conectar con el servicio. Verifica que WF11 esté publicado y que la URL permita solicitudes desde esta aplicación.' });
    } finally {
      setCheckinLoading(false);
    }
  };
  return <>
    <header className="topbar">
      <a className="brand" href="#inicio" aria-label="EventPass, inicio"><span className="brand-mark"><GraduationCap size={21} strokeWidth={2.3}/></span><span>eventpass<span className="brand-dot">.</span></span></a>
      <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
        <a href="#eventos" onClick={() => setMenuOpen(false)}>Explorar eventos</a><a href="#checkin" onClick={() => setMenuOpen(false)}>Check-in</a><a href="#como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</a><a href="#comunidad" onClick={() => setMenuOpen(false)}>Comunidad</a>
      </nav>
      <div className="nav-actions"><button className="login-btn" onClick={() => setNotice('El inicio de sesión estará disponible al conectar los webhooks de n8n.')}>Iniciar sesión</button><button className="signup-btn" onClick={() => setNotice('El registro estará disponible al conectar los webhooks de n8n.')}>Crear cuenta <ArrowUpRight size={15}/></button></div>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">{menuOpen ? <X/> : <Menu/>}</button>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"/> APRENDER SE VIVE MEJOR EN COMUNIDAD</div><h1>Tu próxima idea<br/>empieza <em>aquí.</em></h1><p className="hero-desc">Talleres, charlas y experiencias para aprender algo nuevo, conocer personas y llevar tus ideas más lejos.</p><div className="hero-actions"><a className="primary-btn" href="#eventos">Encuentra tu próximo evento <ArrowRight size={17}/></a><span className="hero-note"><span className="avatar-stack"><i>J</i><i>M</i><i>S</i></span> Una comunidad que aprende junta</span></div><div className="hero-stat"><strong>Aprende a tu ritmo.</strong><span>Curiosidad bienvenida. No necesitas experiencia.</span></div></div>
        <div className="hero-art"><div className="hero-photo"/><div className="floating-note note-top"><span className="note-icon"><Sparkles size={17}/></span><span><b>Aprender haciendo</b><small>Experiencias prácticas</small></span></div><div className="floating-note note-bottom"><span className="note-icon note-green"><Users size={17}/></span><span><b>En buena compañía</b><small>Personas con tus intereses</small></span></div><div className="art-caption"><span className="caption-dot"/> MEDELLÍN · COLOMBIA</div></div>
      </section>

      <section className="ticker" aria-label="Temas de eventos"><span>Ideas en movimiento</span><i>✳</i><span>Habilidades para la vida</span><i>✳</i><span>Aprendizaje compartido</span><i>✳</i><span>Curiosidad sin límites</span></section>

      <section id="eventos" className="events-section"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> AGENDA ABIERTA</div><h2>Aprendizaje que<br className="mobile-break"/> <em>te mueve.</em></h2></div><p>Elige un tema que te intrigue. Nosotros ponemos el espacio, las personas y las ganas de aprender.</p></div>
        <div className="toolbar"><div className="category-list">{categories.map((cat) => <button key={cat} className={category === cat ? 'category active' : 'category'} onClick={() => setCategory(cat)}>{cat}</button>)}</div><label className="search-box"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar una experiencia"/><kbd>⌘ K</kbd></label></div>
        <div className="event-grid">{filtered.map((event) => <article className="event-card" key={event.id}><button className="card-image" onClick={() => setSelected(event)} aria-label={`Ver ${event.title}`} style={{'--photo': `url(https://images.unsplash.com/${event.image}?auto=format&fit=crop&w=900&q=85)`}}><span className="event-tag">{event.tag}</span><span className="date-tile"><b>{event.date}</b><small>{event.month}</small></span><span className="image-arrow"><ArrowUpRight size={18}/></span></button><div className="card-content"><div className="card-category">{event.category}<span/> {event.level}</div><button className="card-title" onClick={() => setSelected(event)}>{event.title}</button><div className="event-info"><span><CalendarDays size={15}/>{event.date} {event.month.toLowerCase()}</span><span><MapPin size={15}/>{event.place}</span></div><div className="card-bottom"><span className={event.seats ? 'availability' : 'availability full'}><i/>{event.seats ? `${event.seats} cupos disponibles` : 'Cupos completos'}</span><button onClick={() => setSelected(event)} className="details-link">Ver detalles <ArrowRight size={15}/></button></div></div></article>)}</div>
        {!filtered.length && <div className="empty-state"><Search size={25}/><b>No encontramos eventos con esa búsqueda.</b><span>Prueba con otra palabra o categoría.</span></div>}
        <div className="catalog-footer"><span>Mostrando {filtered.length} experiencias para aprender</span><a href="#newsletter">¿No encuentras lo que buscas? <ArrowRight size={15}/></a></div>
      </section>

      <section id="checkin" className="checkin-section">
        <div className="checkin-copy"><div className="eyebrow"><span className="eyebrow-line"/> ACCESO AL EVENTO</div><h2>Registrar <em>ingreso.</em></h2><p>Valida la inscripción y el evento. Solo las inscripciones confirmadas pueden completar el check-in.</p></div>
        <form className="checkin-form" onSubmit={submitCheckin}>
          <label htmlFor="checkin-inscripcion">ID de inscripción</label>
          <input id="checkin-inscripcion" required value={checkin.inscripcion_id} onChange={(e) => setCheckin({ ...checkin, inscripcion_id: e.target.value })} placeholder="Ej. INS-123" autoComplete="off" />
          <label htmlFor="checkin-evento">ID de evento</label>
          <input id="checkin-evento" required value={checkin.evento_id} onChange={(e) => setCheckin({ ...checkin, evento_id: e.target.value })} placeholder="Ej. EVT-001" autoComplete="off" />
          <button className="primary-btn checkin-submit" type="submit" disabled={checkinLoading}>{checkinLoading ? 'Validando…' : 'Registrar check-in'} <ArrowRight size={16}/></button>
          {checkinResult && <div className={`checkin-result ${checkinResult.kind}`} role="status" aria-live="polite"><strong>{checkinResult.kind === 'success' ? 'Éxito' : checkinResult.kind === 'duplicate' ? 'Duplicado' : checkinResult.kind === 'error' ? 'Error técnico' : 'Rechazado'}</strong><span>{checkinResult.message}</span>{checkinResult.detail && <small>{checkinResult.detail}</small>}</div>}
        </form>
      </section>
      <section id="como-funciona" className="manifesto"><div className="manifesto-icon"><BookOpen size={22}/></div><div><div className="eyebrow"><span className="eyebrow-line"/> APRENDER TAMBIÉN ES ENCONTRARSE</div><h2>Una buena pregunta<br/>puede cambiarlo <em>todo.</em></h2></div><div className="manifesto-aside"><p>Creemos que aprender no termina en un salón. Empieza cuando compartes una idea, pruebas algo por primera vez o conoces a alguien que ve el mundo distinto.</p><a href="#eventos">Descubre la agenda <ArrowDown size={15}/></a></div></section>

      <section className="steps"><div className="steps-heading"><div className="eyebrow"><span className="eyebrow-line"/> TU EXPERIENCIA, EN TRES PASOS</div><h2>Fácil de encontrar.<br/><em>Bonito de vivir.</em></h2></div><div className="step-grid"><div className="step"><span className="step-num">01</span><span className="step-icon"><Search size={20}/></span><h3>Encuentra tu tema</h3><p>Explora eventos por tema y elige algo que te dé curiosidad.</p></div><div className="step"><span className="step-num">02</span><span className="step-icon"><CalendarDays size={20}/></span><h3>Guarda tu lugar</h3><p>Inscríbete en pocos pasos. Si se llena, puedes entrar a la lista de espera.</p></div><div className="step"><span className="step-num">03</span><span className="step-icon"><Users size={20}/></span><h3>Vive la experiencia</h3><p>Llega con curiosidad. Te esperamos con una comunidad lista para aprender.</p></div></div></section>

      <section id="comunidad" className="community"><div className="community-img"/><div className="community-copy"><div className="eyebrow"><span className="eyebrow-line"/> MÁS QUE UN EVENTO</div><h2>Ven por lo que<br/>vas a <em>aprender.</em><br/>Quédate por<br/>quienes conoces.</h2><p>Las mejores ideas aparecen cuando compartimos. Encuentra personas curiosas, nuevas perspectivas y motivos para volver.</p><a href="#eventos" className="text-link">Conoce la comunidad <ArrowUpRight size={16}/></a></div></section>

      <section id="newsletter" className="newsletter"><div><div className="eyebrow"><span className="eyebrow-line"/> UNA NOTA DE VEZ EN CUANDO</div><h2>Buenas ideas.<br/><em>En tu correo.</em></h2></div><form onSubmit={subscribe}><label htmlFor="email">Recibe novedades sobre próximos eventos educativos.</label><div className="email-row"><input id="email" type="email" required placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}/><button type="submit">Quiero enterarme <ArrowRight size={16}/></button></div><small>Sin ruido, solo oportunidades para aprender.</small></form></section>
    </main>
    <footer><a className="brand" href="#inicio"><span className="brand-mark"><GraduationCap size={20}/></span><span>eventpass<span className="brand-dot">.</span></span></a><span>Aprender nos reúne. © 2026 EventPass</span><div><a href="#eventos">Eventos</a><a href="#como-funciona">Sobre nosotros</a><a href="mailto:hola@eventpass.co">Contacto</a></div></footer>

    {notice && <div className="toast" role="status"><span><Check size={17}/></span>{notice}<button onClick={() => setNotice('')} aria-label="Cerrar"><X size={17}/></button></div>}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="event-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar"><X/></button><div className="modal-image" style={{'--photo': `url(https://images.unsplash.com/${selected.image}?auto=format&fit=crop&w=1000&q=85)`}}/><div className="modal-body"><span className="event-tag">{selected.tag}</span><div className="card-category">{selected.category} <span/> {selected.level}</div><h2>{selected.title}</h2><p>Una experiencia para aprender haciendo, compartir ideas y salir con algo nuevo que llevar a tu día a día. Ven con curiosidad; aquí empezamos desde lo esencial.</p><div className="modal-facts"><span><CalendarDays size={17}/>{selected.date} {selected.month} · {selected.time}</span><span><MapPin size={17}/>{selected.place}</span><span><Clock3 size={17}/>{selected.seats ? `${selected.seats} cupos disponibles` : 'Aforo completo · puedes consultar la lista de espera'}</span></div><button className="primary-btn modal-cta" onClick={() => registerInterest(selected)}>{selected.seats ? 'Quiero inscribirme' : 'Consultar lista de espera'} <ArrowRight size={17}/></button><small className="demo-note">Vista de demostración: el registro se habilita al conectar n8n.</small></div></section></div>}
  </>;
}

export default App;
