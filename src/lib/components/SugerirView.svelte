<script lang="ts">
	import { Check, Send, ShieldCheck } from '@lucide/svelte';

	// Suggestion form logic (mock submission)
	let suggestName = $state('');
	let suggestSchedule = $state('');
	let suggestSubmitted = $state(false);

	function submitSuggestion(e: Event) {
		e.preventDefault();
		if (suggestName && suggestSchedule) {
			suggestSubmitted = true;
			setTimeout(() => {
				suggestName = '';
				suggestSchedule = '';
				suggestSubmitted = false;
			}, 3000);
		}
	}
</script>

<div
	class="flex-1 flex flex-col justify-start items-center py-8 px-6 sm:px-12 gap-8 w-full max-w-7xl mx-auto overflow-y-auto"
>
	<div class="text-center space-y-1.5 select-none">
		<h2 class="text-3xl font-bold text-text-main tracking-tight font-sans">
			Colaborar com o Ordinarium
		</h2>
		<p class="text-sm text-text-muted max-w-xl mx-auto font-sans leading-relaxed">
			Ajude a manter esta iniciativa católica viva e atualizada com suas sugestões.
		</p>
	</div>

	<!-- Content Container -->
	<div class="flex flex-col lg:flex-row gap-8 items-stretch w-full max-w-5xl mx-auto mt-2">
		<!-- Left: Guidance and community details -->
		<div
			class="flex-1 flex flex-col justify-between space-y-6 bg-bg-card/45 border border-border-dark rounded-2xl p-6 select-none"
		>
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<span class="text-[10px] uppercase font-bold tracking-widest text-brand-gold font-sans"
						>Pedidos de Inclusão e Ideias</span
					>
				</div>
				<h2 class="text-2xl font-bold text-text-main tracking-tight font-sans">
					Como Funciona o Envio de Sugestões?
				</h2>
				<p class="text-xs text-text-muted leading-relaxed font-sans">
					Deseja sugerir a inclusão de orações clássicas, terços específicos, correções cadastrais permanentes ou novas ideias de funcionalidades? Envie-nos uma mensagem diretamente pelo formulário.
				</p>
				<p class="text-xs text-text-muted leading-relaxed font-sans">
					Para relatos rápidos de horários (Missa, Confissão, Adoração, Terço) em tempo real em paróquias, por favor utilize o **botão flutuante de reporte** diretamente na aba **Paróquias**.
				</p>
				<ul class="space-y-3 text-xs text-text-muted font-sans pl-1">
					<li class="flex items-start gap-2.5">
						<span class="text-brand-gold font-bold shrink-0">✓</span>
						<div>
							<strong class="text-text-main block mb-0.5">Identifique o Assunto</strong>
							<span>Especifique claramente se é um pedido de nova oração, ideias de recursos ou correções permanentes.</span>
						</div>
					</li>
					<li class="flex items-start gap-2.5">
						<span class="text-brand-gold font-bold shrink-0">✓</span>
						<div>
							<strong class="text-text-main block mb-0.5">Seja Detalhado</strong>
							<span>Descreva detalhadamente o que deseja incluir (novos horários permanentes, textos de devoção, etc.).</span>
						</div>
					</li>
					<li class="flex items-start gap-2.5">
						<span class="text-brand-gold font-bold shrink-0">✓</span>
						<div>
							<strong class="text-text-main block mb-0.5">Fontes e Links</strong>
							<span>Se possível, envie links oficiais, fotos de avisos paroquiais ou referências para validar a alteração com curadoria.</span>
						</div>
					</li>
				</ul>
			</div>

			<div class="p-3 bg-bg-dark/45 border border-border-dark rounded-xl flex items-center gap-3">
				<div
					class="h-8 w-8 rounded-full bg-brand-wine-dim flex items-center justify-center shrink-0"
				>
					<ShieldCheck class="h-4 w-4 text-brand-wine" />
				</div>
				<div class="text-left font-sans">
					<h4 class="text-xs font-bold text-text-main leading-tight">Validação por Curadores</h4>
					<p class="text-[10px] text-text-muted">
						Todas as sugestões gerais passam por curadoria antes de serem catalogadas no portal.
					</p>
				</div>
			</div>
		</div>

		<!-- Right: General Suggestion Form -->
		<div
			class="w-full lg:w-[380px] bg-bg-card border border-border-dark shadow-lg rounded-2xl p-6 flex flex-col justify-between shrink-0"
		>
			<div class="space-y-4">
				<div class="space-y-1 text-left select-none">
					<h3 class="text-lg font-bold text-text-main tracking-tight font-sans">
						Sugerir Inclusões
					</h3>
					<p class="text-xs text-text-muted font-sans">
						Proponha novos recursos, orações ou correções de dados históricos para o Ordinarium.
					</p>
				</div>

				{#if suggestSubmitted}
					<div
						class="flex flex-col items-center justify-center py-12 text-center space-y-3 font-sans animate-fade-in bg-bg-dark/40 rounded-xl border border-brand-gold/15 p-4 mt-4 my-auto select-none"
					>
						<div
							class="h-10 w-10 rounded-full bg-brand-gold-dim border border-brand-gold/25 flex items-center justify-center"
						>
							<Check class="h-5 w-5 text-brand-gold" />
						</div>
						<h4 class="text-sm font-bold text-text-main">Sugestão Enviada!</h4>
						<p class="text-[11px] text-text-muted leading-relaxed">
							Obrigado por colaborar. Nossa equipe de curadores irá analisar seu pedido em breve.
						</p>
					</div>
				{:else}
					<form onsubmit={submitSuggestion} class="space-y-3 mt-4">
						<div class="space-y-1.5">
							<label for="suggestName" class="text-xs font-semibold text-text-main block text-left"
								>Assunto</label
							>
							<input
								id="suggestName"
								type="text"
								bind:value={suggestName}
								placeholder="Ex: Inclusão do Terço das Lágrimas, Nova Funcionalidade..."
								required
								class="w-full px-3.5 py-2 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main placeholder-text-muted focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors"
							/>
						</div>

						<div class="space-y-1.5">
							<label
								for="suggestDetails"
								class="text-xs font-semibold text-text-main block text-left"
								>Detalhes da Sugestão</label
							>
							<textarea
								id="suggestDetails"
								rows="7"
								bind:value={suggestSchedule}
								placeholder="Descreva em detalhes a sua sugestão ou o texto completo da oração/recurso."
								required
								class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main placeholder-text-muted focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors resize-none"
							></textarea>
						</div>

						<button
							type="submit"
							class="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-wine hover:bg-brand-wine-light text-white shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
						>
							<Send size={12} />
							<span>Enviar Sugestão</span>
						</button>
					</form>
				{/if}
			</div>

			<div
				class="text-[10px] text-text-muted text-center pt-4 border-t border-border-dark mt-4 select-none"
			>
				Ajude-nos a melhorar!
			</div>
		</div>
	</div>
</div>
