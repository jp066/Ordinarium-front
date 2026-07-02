export type EventType = 'Missa' | 'Confissão' | 'Adoração' | 'Terço' | 'Outro';

export interface CommunityEvent {
	id: string;
	churchId: string;
	churchName: string;
	type: EventType;
	weekday: 'Dom' | 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb';
	timeStr: string; // HH:MM
	notes: string;
	upvotes: number;
	downvotes: number;
	userAction: 'up' | 'down' | null;
	createdAt: Date;
}

class CommunityEventsStore {
	private _events = $state<CommunityEvent[]>([]);

	constructor() {
		// Initialize with some mock community-submitted events
		const now = new Date();
		this._events = [
			{
				id: 'ce1',
				churchId: 'c1',
				churchName: 'Paróquia de São José',
				type: 'Adoração',
				weekday: 'Qua',
				timeStr: '19:30',
				notes: 'Adoração ao Santíssimo Sacramento e bênção solene na capela principal.',
				upvotes: 6,
				downvotes: 0,
				userAction: null,
				createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
			},
			{
				id: 'ce2',
				churchId: 'c2',
				churchName: 'Catedral Metropolitana da Sé',
				type: 'Terço',
				weekday: 'Sáb',
				timeStr: '10:30',
				notes: 'Terço Mariano rezado de forma comunitária na Capela do Santíssimo.',
				upvotes: 4,
				downvotes: 1,
				userAction: null,
				createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 hours ago
			},
			{
				id: 'ce3',
				churchId: 'c3',
				churchName: 'Paróquia Nossa Senhora do Brasil',
				type: 'Confissão',
				weekday: 'Ter',
				timeStr: '19:00',
				notes: 'Mutirão extra de confissão com padres convidados da Região Episcopal.',
				upvotes: 9,
				downvotes: 0,
				userAction: null,
				createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
			}
		];
	}

	get events() {
		// Active events (exclude those with massive downvotes)
		return this._events.filter(e => e.downvotes - e.upvotes < 3);
	}

	getCommunityEventsForChurch(churchId: string) {
		return this._events.filter(e => e.churchId === churchId && e.downvotes - e.upvotes < 3);
	}

	addCommunityEvent(eventData: {
		churchId: string;
		churchName: string;
		type: EventType;
		weekday: 'Dom' | 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb';
		timeStr: string;
		notes: string;
	}) {
		const newEvent: CommunityEvent = {
			id: 'ce_' + Math.random().toString(36).substring(2, 9),
			churchId: eventData.churchId,
			churchName: eventData.churchName,
			type: eventData.type,
			weekday: eventData.weekday,
			timeStr: eventData.timeStr,
			notes: eventData.notes,
			upvotes: 1,
			downvotes: 0,
			userAction: 'up', // auto-upvoted by author
			createdAt: new Date()
		};

		this._events = [newEvent, ...this._events];
		return newEvent;
	}

	voteCommunityEvent(eventId: string, actionType: 'up' | 'down') {
		this._events = this._events.map(e => {
			if (e.id !== eventId) return e;

			let upDelta = 0;
			let downDelta = 0;

			if (e.userAction === actionType) {
				// Undo vote
				if (actionType === 'up') upDelta = -1;
				if (actionType === 'down') downDelta = -1;
				return { ...e, upvotes: e.upvotes + upDelta, downvotes: e.downvotes + downDelta, userAction: null };
			} else {
				// Change or new vote
				if (e.userAction === 'up') upDelta = -1;
				if (e.userAction === 'down') downDelta = -1;

				if (actionType === 'up') upDelta += 1;
				if (actionType === 'down') downDelta += 1;

				return { ...e, upvotes: e.upvotes + upDelta, downvotes: e.downvotes + downDelta, userAction: actionType };
			}
		});
	}
}

export const reportsStore = new CommunityEventsStore();
export const communityEventsStore = reportsStore; // Alias for convenience
