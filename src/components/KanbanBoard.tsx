
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { MoreHorizontal, MessageSquare, Clock } from 'lucide-react';

interface KanbanBoardProps {
    tickets: Ticket[];
    onTicketMoved: (ticketId: string, newStatus: TicketStatus) => void;
}

const columns: { id: TicketStatus; title: string; color: string }[] = [
    { id: TicketStatus.OPEN, title: 'Open Queue', color: 'bg-red-500' },
    { id: TicketStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-amber-500' },
    { id: TicketStatus.RESOLVED, title: 'Resolved', color: 'bg-green-500' },
    { id: TicketStatus.CLOSED, title: 'Closed', color: 'bg-slate-500' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets, onTicketMoved }) => {
    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        onTicketMoved(draggableId, destination.droppableId as TicketStatus);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-4">
                {columns.map((col) => {
                    const colTickets = tickets.filter((t) => t.status === col.id);

                    return (
                        <div key={col.id} className="flex-1 min-w-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{col.title}</h3>
                                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {colTickets.length}
                                    </span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-4 min-h-[500px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/50 ring-2 ring-indigo-400/30' : ''
                                            }`}
                                    >
                                        {colTickets.map((ticket, index) => (
                                            <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-3 group hover:shadow-md transition-all ${snapshot.isDragging ? 'rotate-2 shadow-2xl ring-2 ring-indigo-500/50 z-50' : ''
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                                                                {ticket.id}
                                                            </span>
                                                            <span
                                                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ticket.priority === TicketPriority.CRITICAL
                                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                    : ticket.priority === TicketPriority.HIGH
                                                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                    }`}
                                                            >
                                                                {ticket.priority}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 line-clamp-2">
                                                            {ticket.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                                            {ticket.description}
                                                        </p>

                                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-md">
                                                                    <MessageSquare className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                                                                </div>
                                                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">AI Triage</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                                                                <Clock className="w-3 h-3" />
                                                                <span>2m</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};
