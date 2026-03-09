import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
// import { supabase } from '../services/supabase';
import { X, Calendar as CalendarIcon, Clock, Share2 } from 'lucide-react';

const BIT_PALETTE = ['#005696', '#FFCC00', '#1E293B', '#4F46E5', '#7C3AED'];

const ScheduleCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prefillDate, setPrefillDate] = useState(null);
    const navigate = useNavigate();
    const calendarRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            console.log("Data ready for n8n transfer:", { action: "fetch_posts_calendar" });
            /*
            const { data, error } = await supabase
                .from('scheduled_posts')
                .select('*');

            if (error) throw error;
            */
            const data = [];

            if (data) {
                const formattedEvents = data.map(post => {
                    const dateObj = new Date(post.scheduled_date);
                    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    let shortTitle = post.caption || 'Nova Postagem';
                    if (shortTitle.length > 20) {
                        shortTitle = shortTitle.substring(0, 20) + '...';
                    }

                    const randomColor = BIT_PALETTE[Math.floor(Math.random() * BIT_PALETTE.length)];

                    return {
                        id: post.id,
                        title: shortTitle,
                        start: post.scheduled_date,
                        backgroundColor: randomColor,
                        borderColor: randomColor,
                        extendedProps: {
                            time: timeString,
                            image_content: post.image_content,
                            caption: post.caption,
                            platforms: post.platforms || [],
                            fullData: post
                        }
                    };
                });
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (arg) => {
        setPrefillDate(arg.dateStr);
        setIsModalOpen(true);
    };

    const handleEventClick = (arg) => {
        setSelectedEvent(arg.event);
    };

    const renderEventContent = (eventInfo) => {
        const { time, image_content, caption } = eventInfo.event.extendedProps;

        return (
            <div
                className="flex items-center gap-2 p-1 bg-white rounded-lg border-l-4 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] group"
                style={{
                    borderColor: eventInfo.event.borderColor || '#005696',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    width: '100%',
                    transform: 'translateZ(0)' // Hardware acceleration
                }}
            >
                {image_content ? (
                    <div className="w-8 h-8 shrink-0 rounded bg-slate-100 overflow-hidden border border-slate-200 group-hover:border-bit-blue/30 transition-colors">
                        <img
                            src={image_content}
                            alt="thumb"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-8 h-8 shrink-0 rounded bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-bit-blue/30 transition-colors">
                        <CalendarIcon size={14} className="text-slate-400" />
                    </div>
                )}

                <div className="flex flex-col min-w-0 pr-1 py-0.5">
                    <span className="bg-[#FFCC00] text-[#005696] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm w-fit mb-0.5 inline-block">
                        {time}
                    </span>
                    <span className="text-[11px] text-slate-700 truncate font-montserrat font-medium" title={caption}>
                        {eventInfo.event.title}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full min-h-[calc(100vh-80px)]">
            <style>{`
                /* FullCalendar Custom Theme Overrides */
                .fc {
                    font-family: 'Montserrat', sans-serif;
                }
                .fc-theme-standard .fc-scrollgrid {
                    border-color: #e2e8f0;
                }
                .fc-theme-standard td, .fc-theme-standard th {
                    border-color: #f1f5f9;
                }
                .fc-col-header-cell {
                    padding: 12px 0 !important;
                    background-color: #f8fafc;
                    color: #475569;
                    font-weight: 600;
                }
                .fc-daygrid-day-number {
                    color: #64748b;
                    font-weight: 500;
                    padding: 8px !important;
                }
                .fc-day-today {
                    background-color: #f0f9ff !important;
                }
                .fc-day-today .fc-daygrid-day-number {
                    color: #005696;
                    font-weight: 700;
                }
                
                /* Buttons */
                .fc-button-primary {
                    background-color: #005696 !important;
                    border-color: #005696 !important;
                    text-transform: capitalize;
                    font-weight: 600 !important;
                    border-radius: 8px !important;
                    padding: 8px 16px !important;
                    transition: all 0.2s ease !important;
                }
                .fc-button-primary:hover,
                .fc-button-primary:focus,
                .fc-button-primary:active {
                    background-color: #FFCC00 !important;
                    border-color: #FFCC00 !important;
                    color: #005696 !important;
                    box-shadow: 0 4px 12px rgba(255, 204, 0, 0.3) !important;
                }
                .fc-button-primary:disabled {
                    opacity: 0.6 !important;
                }
                .fc-button-active {
                    background-color: #0e3b5e !important;
                    border-color: #0e3b5e !important;
                }
                
                /* Remove default event styling to let custom content show properly */
                .fc-event {
                    background: transparent !important;
                    border: none !important;
                    margin: 2px 4px !important;
                }
                .fc-daygrid-event-harness {
                    margin-bottom: 4px;
                }
                
                .fc-toolbar-title {
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700 !important;
                    color: #1e293b;
                }
                
                @media (max-width: 768px) {
                    .fc-toolbar {
                        flex-direction: column;
                        gap: 12px;
                    }
                    .fc-toolbar-chunk {
                        display: flex;
                        justify-content: center;
                    }
                }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-bit-blue font-montserrat transition-all duration-300">Calendário de Postagens</h1>
                    <p className="text-slate-500 mt-2 transition-all duration-300">Gerencie e visualize suas publicações programadas.</p>
                </div>
                <button
                    onClick={() => {
                        setPrefillDate(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-[#005696] text-white font-bold py-2.5 px-5 rounded-lg hover:bg-[#FFCC00] hover:text-[#005696] transition-all duration-300 shadow hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <CalendarIcon size={18} />
                    Novo Agendamento
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 grow p-4 md:p-6 overflow-hidden">
                <div className="h-full min-h-[600px] relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-bit-blue border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-600 font-medium">Carregando calendário...</p>
                            </div>
                        </div>
                    )}

                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                        initialView={isMobile ? 'timeGridDay' : 'dayGridMonth'}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: isMobile ? 'timeGridDay,timeGridWeek' : 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={events}
                        eventContent={renderEventContent}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="100%"
                        locale="pt-br"
                        buttonText={{
                            today: 'Hoje',
                            month: 'Mês',
                            week: 'Semana',
                            day: 'Dia'
                        }}
                        dayMaxEvents={true}
                        nowIndicator={true}
                    />
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="text-lg font-bold font-montserrat text-slate-800">Detalhes da Postagem</h3>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto">
                            {selectedEvent.extendedProps.image_content && (
                                <div className="mb-6 rounded-xl overflow-hidden shadow-md border border-slate-100 aspect-video bg-slate-100 flex items-center justify-center relative group">
                                    <img
                                        src={selectedEvent.extendedProps.image_content}
                                        alt="Post content"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                                        <Clock size={16} />
                                        <span>Data e Hora</span>
                                    </div>
                                    <p className="font-medium text-slate-800 text-lg">
                                        {new Date(selectedEvent.start).toLocaleDateString('pt-BR', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        <span className="inline-block ml-2 px-2.5 py-1 bg-bit-blue/10 text-bit-blue rounded-lg font-bold text-sm">
                                            {selectedEvent.extendedProps.time}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                                        <Share2 size={16} />
                                        <span>Plataformas</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedEvent.extendedProps.platforms && selectedEvent.extendedProps.platforms.length > 0 ? (
                                            selectedEvent.extendedProps.platforms.map((platform, i) => (
                                                <span key={i} className="px-3 py-1 bg-[#FFCC00]/20 text-yellow-800 font-semibold rounded-full text-xs capitalize border border-yellow-300">
                                                    {platform}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 italic text-sm">Não especificado</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Legenda Completa</h4>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                                        {selectedEvent.extendedProps.caption || <span className="text-slate-400 italic">Sem legenda</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => navigate('/create', { state: { prefillPost: selectedEvent.extendedProps.fullData } })}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-bit-blue hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20 rounded-xl transition-all"
                            >
                                Editar Postagem
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dummy Create Appointment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-2xl font-bold font-montserrat text-[#005696] mb-2">Novo Agendamento</h3>
                        <p className="text-slate-500 mb-6 text-center text-sm">Preencha os dados do formulário de criação.</p>

                        {prefillDate && (
                            <div className="mb-6 w-full p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                <Clock className="text-[#005696]" size={20} />
                                <div>
                                    <p className="text-xs font-semibold uppercase text-blue-800 tracking-wider mb-0.5">Data Selecionada</p>
                                    <p className="font-bold text-[#005696]">{new Date(prefillDate).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        )}

                        <div className="w-full flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setPrefillDate(null);
                                }}
                                className="px-5 py-2.5 font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    // Placeholder for form submission or navigation
                                    navigate('/create', { state: { prefillDate: prefillDate } });
                                    setIsModalOpen(false);
                                }}
                                className="px-6 py-2.5 font-bold text-white bg-[#005696] hover:bg-blue-700 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;
