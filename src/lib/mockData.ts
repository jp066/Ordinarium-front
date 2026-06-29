export interface Church {
	id: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	lat: number;
	lng: number;
	bgImage?: string;
	schedules: { type: string; day: string; time: string }[];
}

export interface Schedule {
	id: string;
	type: string;
	weekday: string;
	dateStr: string;
	timeStr: string;
	churchName: string;
	churchId: string;
	notes: string;
	confidenceScore: number;
}

export const churches: Church[] = [
	{
		id: 'c1',
		name: 'Paróquia de São José',
		address: 'Rua São José, 18 - Centro, São Paulo - SP, 01013-000',
		phone: '(11) 93333-0980',
		email: 'info@ordinarium.com',
		lat: -23.5489,
		lng: -46.6388,
		bgImage: 'https://yt3.googleusercontent.com/KWss2z2TO6BFIr4NNtBg3rSs3RH9DGO12NrLnuUOp5LshX2KR7odbgJmuCqY7t3_Wm7hefyRWB4=s900-c-k-c0x00ffffff-no-rj',
		schedules: [
			{ type: 'Missa', day: 'Dom', time: '14:30' },
			{ type: 'Confissão', day: 'Dom', time: '16:00' },
			{ type: 'Missa', day: 'Dom', time: '18:00' },
			{ type: 'Missa', day: 'Sáb', time: '17:00' }
		]
	},
	{
		id: 'c2',
		name: 'Catedral Metropolitana da Sé',
		address: 'Praça da Sé, s/n - Sé, São Paulo - SP, 01001-000',
		phone: '(11) 3107-6832',
		email: 'contato@catedraldase.org.br',
		lat: -23.5505,
		lng: -46.6333,
		bgImage: 'https://coelhomochileiro.com.br/wp-content/uploads/2022/03/historia-catedral-da-se-sao-paulo.jpg',
		schedules: [
			{ type: 'Missa', day: 'Dom', time: '09:00' },
			{ type: 'Missa', day: 'Dom', time: '11:00' },
			{ type: 'Adoração', day: 'Dom', time: '12:30' },
			{ type: 'Adoração', day: 'Qui', time: '12:00' }
		]
	},
	{
		id: 'c3',
		name: 'Paróquia Nossa Senhora do Brasil',
		address: 'Praça N. Sra. do Brasil, s/n - Jardim América, São Paulo - SP, 01438-000',
		phone: '(11) 3082-9786',
		email: 'secretaria@nsbrasil.org.br',
		lat: -23.5672,
		lng: -46.6749,
		bgImage: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Igreja_Nossa_Senhora_do_Brasil%2C_SP_1.JPG',
		schedules: [
			{ type: 'Missa', day: 'Dom', time: '11:30' },
			{ type: 'Confissão', day: 'Dom', time: '17:00' },
			{ type: 'Missa', day: 'Dom', time: '19:30' },
			{ type: 'Missa', day: 'Ter', time: '18:30' }
		]
	},
	{
		id: 'c4',
		name: 'Santuário São Judas Tadeu',
		address: 'Av. Jabaquara, 2682 - Jabaquara, São Paulo - SP, 04046-500',
		phone: '(11) 5072-9900',
		email: 'secretaria@saojudas.org.br',
		lat: -23.6214,
		lng: -46.6409,
		bgImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQvI_p0VBCgq6ohrak38AaysVUGQldt9kpjA&s',
		schedules: [
			{ type: 'Missa', day: 'Dom', time: '08:30' },
			{ type: 'Adoração', day: 'Dom', time: '19:00' },
			{ type: 'Missa', day: 'Dom', time: '17:30' }
		]
	},
	{
		id: 'c5',
		name: 'Paróquia São João Evangelista e São João Batista',
		address: 'Qd. 69, Casa 22 - Parque Piauí, Teresina - PI, 64025-250',
		phone: '(86) 3233-0000',
		email: 'parquia.sjoaoevangelista@arquidiocesedeteresina.org.br',
		lat: -5.1389,
		lng: -42.8019,
		bgImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Teresina_panorama.jpg/1280px-Teresina_panorama.jpg',
		schedules: [
			{ type: 'Missa', day: 'Dom', time: '07:30' },
			{ type: 'Missa', day: 'Dom', time: '19:00' },
			{ type: 'Confissão', day: 'Sáb', time: '16:00' },
			{ type: 'Missa', day: 'Sáb', time: '18:00' },
			{ type: 'Missa', day: 'Sex', time: '18:30' }
		]
	},
	{
		id: 'c6',
		name: 'Paróquia São João Batista',
		address: 'R. Salomão Said, 951 - São João, Teresina - PI, 64046-610',
		phone: '(86) 3233-2290',
		email: 'paroquiasaojoaoteresina@gmail.com',
		lat: -5.0748,
		lng: -42.7879,
		bgImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Teresina_panorama.jpg/1280px-Teresina_panorama.jpg',
		schedules: [
			{ type: 'Missa', day: 'Dom', time: '07:00' },
			{ type: 'Missa', day: 'Dom', time: '09:00' },
			{ type: 'Missa', day: 'Dom', time: '18:00' },
			{ type: 'Confissão', day: 'Dom', time: '17:00' },
			{ type: 'Adoração', day: 'Qui', time: '19:00' },
			{ type: 'Missa', day: 'Ter', time: '07:00' }
		]
	}
];

export const schedules: Schedule[] = [
	{
		id: 's1',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Sana omin da paróquia',
		confidenceScore: 0.95
	},
	{
		id: 's2',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Sana omin da paróquia',
		confidenceScore: 0.95
	},
	{
		id: 's3',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Sana omin da paróquia',
		confidenceScore: 0.50
	},
	{
		id: 's4',
		type: 'Confissão',
		weekday: 'Dom',
		dateStr: 'Dom, 28 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Sana omin da paróquia',
		confidenceScore: 0.95
	},
	{
		id: 's5',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Sana omin da paróquia',
		confidenceScore: 0.95
	},
	{
		id: 's6',
		type: 'Confissão',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Sana omin da paróquia',
		confidenceScore: 0.50
	},
	{
		id: 's7',
		type: 'Adoração',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Peisecamento de Paróquia',
		confidenceScore: 0.95
	},
	{
		id: 's8',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Peisacamento de Paróquia',
		confidenceScore: 0.95
	},
	{
		id: 's9',
		type: 'Adoração',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Peisacamento de Paróquia',
		confidenceScore: 0.50
	},
	{
		id: 's10',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Peisacamento de Paróquia',
		confidenceScore: 0.95
	},
	{
		id: 's11',
		type: 'Adoração',
		weekday: 'Dom',
		dateStr: 'Dom, 24 Set',
		timeStr: '14:30',
		churchName: 'Paróquia de São José',
		churchId: 'c1',
		notes: 'Paisacamento de Paróquia',
		confidenceScore: 0.95
	},
	// Paróquia São João Evangelista e São João Batista - Teresina (c5)
	{
		id: 's12',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom',
		timeStr: '07:30',
		churchName: 'Paróquia São João Evangelista e São João Batista',
		churchId: 'c5',
		notes: 'Missa dominical matutina',
		confidenceScore: 0.95
	},
	{
		id: 's13',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom',
		timeStr: '19:00',
		churchName: 'Paróquia São João Evangelista e São João Batista',
		churchId: 'c5',
		notes: 'Missa dominical vespertina',
		confidenceScore: 0.95
	},
	{
		id: 's14',
		type: 'Confissão',
		weekday: 'Sáb',
		dateStr: 'Sáb',
		timeStr: '16:00',
		churchName: 'Paróquia São João Evangelista e São João Batista',
		churchId: 'c5',
		notes: 'Sacramento da reconciliação',
		confidenceScore: 0.90
	},
	{
		id: 's15',
		type: 'Missa',
		weekday: 'Sáb',
		dateStr: 'Sáb',
		timeStr: '18:00',
		churchName: 'Paróquia São João Evangelista e São João Batista',
		churchId: 'c5',
		notes: 'Missa vespertina de sábado',
		confidenceScore: 0.95
	},
	{
		id: 's16',
		type: 'Missa',
		weekday: 'Sex',
		dateStr: 'Sex',
		timeStr: '18:30',
		churchName: 'Paróquia São João Evangelista e São João Batista',
		churchId: 'c5',
		notes: 'Missa de sexta-feira',
		confidenceScore: 0.90
	},
	// Paróquia São João Batista - Teresina (c6)
	{
		id: 's17',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom',
		timeStr: '07:00',
		churchName: 'Paróquia São João Batista',
		churchId: 'c6',
		notes: 'Missa dominical da manhã',
		confidenceScore: 0.95
	},
	{
		id: 's18',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom',
		timeStr: '09:00',
		churchName: 'Paróquia São João Batista',
		churchId: 'c6',
		notes: 'Missa dominical da manhã',
		confidenceScore: 0.95
	},
	{
		id: 's19',
		type: 'Missa',
		weekday: 'Dom',
		dateStr: 'Dom',
		timeStr: '18:00',
		churchName: 'Paróquia São João Batista',
		churchId: 'c6',
		notes: 'Missa dominical da tarde',
		confidenceScore: 0.95
	},
	{
		id: 's20',
		type: 'Confissão',
		weekday: 'Dom',
		dateStr: 'Dom',
		timeStr: '17:00',
		churchName: 'Paróquia São João Batista',
		churchId: 'c6',
		notes: 'Sacramento da reconciliação',
		confidenceScore: 0.90
	},
	{
		id: 's21',
		type: 'Adoração',
		weekday: 'Qui',
		dateStr: 'Qui',
		timeStr: '19:00',
		churchName: 'Paróquia São João Batista',
		churchId: 'c6',
		notes: 'Adoração ao Santíssimo Sacramento',
		confidenceScore: 0.90
	},
	{
		id: 's22',
		type: 'Missa',
		weekday: 'Ter',
		dateStr: 'Ter',
		timeStr: '07:00',
		churchName: 'Paróquia São João Batista',
		churchId: 'c6',
		notes: 'Missa de terça-feira',
		confidenceScore: 0.90
	}
];
