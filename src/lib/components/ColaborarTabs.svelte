<script lang="ts">
	import { Heart, MessageSquare } from '@lucide/svelte';

	let { activeTab } = $props<{ activeTab: 'apoiar' | 'sugerir' }>();
</script>

<div class="flex justify-center w-full max-w-md mx-auto select-none mt-2">
	<div
		class="flex items-center gap-1.5 p-1.5 bg-bg-sidebar/85 backdrop-blur-md border border-border-dark rounded-full shadow-lg"
	>
		<a
			href="/apoiar"
			class="flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all duration-300 border cursor-pointer
			{activeTab === 'apoiar'
				? 'bg-brand-wine text-white border-transparent shadow-md scale-105'
				: 'bg-transparent text-text-muted hover:text-text-main border-transparent hover:bg-bg-card/50'}"
		>
			<Heart size={13} strokeWidth={activeTab === 'apoiar' ? 2.5 : 2} />
			<span>Apoiar Financeiramente</span>
		</a>

		<a
			href="/sugerir"
			class="flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all duration-300 border cursor-pointer
			{activeTab === 'sugerir'
				? 'bg-brand-wine text-white border-transparent shadow-md scale-105'
				: 'bg-transparent text-text-muted hover:text-text-main border-transparent hover:bg-bg-card/50'}"
		>
			<MessageSquare size={13} strokeWidth={activeTab === 'sugerir' ? 2.5 : 2} />
			<span>Sugerir Alterações</span>
		</a>
	</div>
</div>
