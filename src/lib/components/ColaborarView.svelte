<script lang="ts">
	import { Sparkles, CreditCard, Smartphone, Shield, Check, RefreshCw, Copy } from '@lucide/svelte';

	// Colaborar view state and logic (Simulated payment flow)
	let donationAmount = $state<number>(25);
	let customAmount = $state<string>('');
	let paymentMethod = $state<'pix' | 'card'>('pix');
	let paymentStatus = $state<'idle' | 'loading' | 'success'>('idle');
	let copiado = $state(false);

	let finalAmount = $derived(
		donationAmount === 0 
			? (Number(customAmount) || 0)
			: donationAmount
	);

	const pixKey = "00020101021226840014br.gov.bcb.pix2562pix.ordinarium.com/apoio520400005303986540510.005802BR5910Ordinarium6009Sao Paulo62070503***63041A2D";

	function handleSupportSubmit(e: Event) {
		e.preventDefault();
		if (finalAmount <= 0) return;
		paymentStatus = 'loading';
		setTimeout(() => {
			paymentStatus = 'success';
		}, 1500);
	}

	function handleCopyToClipboard() {
		navigator.clipboard.writeText(pixKey);
		copiado = true;
		setTimeout(() => {
			copiado = false;
		}, 2000);
	}

	function resetPayment() {
		paymentStatus = 'idle';
		customAmount = '';
		donationAmount = 25;
		paymentMethod = 'pix';
	}

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

<div class="flex-1 flex flex-col justify-start items-center py-8 px-6 sm:px-12 gap-8 w-full max-w-7xl mx-auto overflow-y-auto">
	<div class="text-center space-y-1.5 select-none">
		<h2 class="text-3xl font-bold text-text-main tracking-tight font-sans">Colaborar com o Ordinarium</h2>
		<p class="text-sm text-text-muted max-w-xl mx-auto font-sans leading-relaxed">
			Ajude a manter esta iniciativa católica viva e atualizada.
		</p>
	</div>

	<!-- Container with Form and Financial support side-by-side -->
	<div class="flex flex-col lg:flex-row gap-6 items-stretch w-full max-w-7xl mx-auto">
		
		<!-- LEFT COLUMN: Liturgical Schedule Suggestion Form -->
		<div class="w-full lg:w-[360px] bg-bg-card border border-border-dark shadow-lg rounded-2xl p-6 shrink-0 flex flex-col justify-between">
			<div class="space-y-4">
				<div class="space-y-1 text-left">
					<h3 class="text-lg font-bold text-text-main tracking-tight font-sans">Sugerir Horários</h3>
					<p class="text-xs text-text-muted font-sans">Encontrou horários desatualizados? Contribua enviando os dados abaixo para curadoria.</p>
				</div>

				{#if suggestSubmitted}
					<div class="flex flex-col items-center justify-center py-10 text-center space-y-3 font-sans animate-fade-in bg-bg-dark/40 rounded-xl border border-brand-gold/15 p-4 mt-4">
						<div class="h-10 w-10 rounded-full bg-brand-gold-dim border border-brand-gold/25 flex items-center justify-center">
							<Check class="h-5 w-5 text-brand-gold" />
						</div>
						<h4 class="text-sm font-bold text-text-main">Sugestão Enviada!</h4>
						<p class="text-[11px] text-text-muted leading-relaxed">Obrigado por colaborar. Nossa equipe de curadores irá validar os horários em breve.</p>
					</div>
				{:else}
					<form onsubmit={submitSuggestion} class="space-y-3 mt-4">
						<div class="space-y-1.5">
							<label for="suggestName" class="text-xs font-semibold text-text-main block text-left">Nome da Paróquia / Cidade</label>
							<input
								id="suggestName"
								type="text"
								bind:value={suggestName}
								placeholder="Ex: Paróquia São José Operário, Teresina - PI"
								required
								class="w-full px-3.5 py-2 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main placeholder-text-muted focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors"
							/>
						</div>

						<div class="space-y-1.5">
							<label for="suggestDetails" class="text-xs font-semibold text-text-main block text-left">Detalhes dos Horários</label>
							<textarea
								id="suggestDetails"
								rows="5"
								bind:value={suggestSchedule}
								placeholder="Descreva os horários encontrados. Ex: Missa aos Domingos às 8h e 19h; Confissões de Terça a Sexta das 17h às 18h30."
								required
								class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main placeholder-text-muted focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors resize-none"
							></textarea>
						</div>

						<button
							type="submit"
							class="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-wine hover:bg-brand-wine-light text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
						>
							Enviar Sugestão
						</button>
					</form>
				{/if}
			</div>
			<div class="text-[10px] text-text-muted text-center pt-4 border-t border-border-dark mt-4 select-none">
				Fiéis colaborando ativamente pelo Brasil.
			</div>
		</div>

		<!-- Vertical Divider separating suggestion area and financial support area -->
		<div class="hidden lg:block w-[1px] bg-border-dark shrink-0 self-stretch my-2"></div>

		<!-- RIGHT CONTAINER (WITH HEADER AND SIDE-BY-SIDE CARDS) -->
		<div class="flex-1 flex flex-col gap-6 justify-start">
			<!-- Header for the Financial Section -->
			<div class="space-y-1 text-left shrink-0 select-none">
				<h3 class="text-xl font-bold text-text-main tracking-tight font-sans">Como eu posso ajudar a manter o Ordinarium?</h3>
				<p class="text-xs text-text-muted font-sans">Apoie financeiramente para cobrir os custos operacionais do projeto.</p>
			</div>

			<!-- Cards Side-by-Side -->
			<div class="flex-1 flex flex-col md:flex-row gap-6 items-stretch">
				<!-- Right-Left: Information and Impact -->
				<div class="flex-1 flex flex-col justify-between space-y-6 bg-bg-card/45 border border-border-dark rounded-2xl p-6 select-none">
					<div class="space-y-4">
						<div class="flex items-center gap-2">
							<span class="text-[10px] uppercase font-bold tracking-widest text-brand-gold font-sans">Apoio Financeiro</span>
						</div>
						<h2 class="text-2xl font-bold text-text-main tracking-tight font-sans">Manter o Projeto Vivo e Independente</h2>
						<p class="text-xs text-text-muted leading-relaxed font-sans">
							O Ordinarium nasceu como uma iniciativa voluntária e gratuita para ajudar os fiéis a encontrarem a Santa Missa e Confissões de forma simples e digna.
						</p>
						<p class="text-xs text-text-muted leading-relaxed font-sans">
							Para mantermos o projeto ativo e livre de anúncios comerciais inconvenientes, dependemos do apoio espontâneo da comunidade para cobrir custos de:
						</p>
						<ul class="space-y-2 text-xs text-text-muted font-sans pl-1">
							<li class="flex items-start gap-2">
								<span class="text-brand-gold font-bold">✓</span>
								<span>Servidor Cloud de Banco de Dados</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-brand-gold font-bold">✓</span>
								<span>Hospedagem Web & CDN</span>
							</li>
							<li class="flex items-start gap-2">
								<span class="text-brand-gold font-bold">✓</span>
								<span>Cota da API do Mapa (Mapbox/MapTiles)</span>
							</li>
						</ul>
					</div>
					<div class="p-3 bg-bg-dark/45 border border-border-dark rounded-xl flex items-center gap-3">
						<div class="h-8 w-8 rounded-full bg-brand-wine-dim flex items-center justify-center shrink-0">
							<Shield class="h-4 w-4 text-brand-wine" />
						</div>
						<div class="text-left font-sans">
							<h4 class="text-xs font-bold text-text-main leading-tight">Transparência Total</h4>
							<p class="text-[10px] text-text-muted">100% dos recursos são aplicados na infraestrutura do portal.</p>
						</div>
					</div>
				</div>

				<!-- Right-Right: Interactive Support Donation Form -->
				<div class="w-full md:w-[350px] bg-bg-card border border-border-dark shadow-lg rounded-2xl p-6 flex flex-col justify-between">
					{#if paymentStatus === 'idle'}
						<!-- Step 1: Set value and method -->
						<div class="space-y-4 text-left">
							<div class="space-y-1">
								<h3 class="text-lg font-bold text-text-main tracking-tight font-sans">Fazer uma Contribuição</h3>
								<p class="text-xs text-text-muted font-sans">Escolha um valor e a forma de pagamento.</p>
							</div>

							<!-- Donation values grid -->
							<div class="grid grid-cols-4 gap-2 mt-2">
								{#each [10, 25, 50, 0] as val}
									<button
										onclick={() => {
											donationAmount = val;
											if (val !== 0) customAmount = '';
										}}
										class="py-2 text-xs font-bold rounded-xl border font-sans transition-all cursor-pointer
										{donationAmount === val 
											? 'bg-brand-gold border-transparent text-bg-dark shadow-md' 
											: 'border-border-dark bg-bg-dark hover:bg-bg-dark/80 text-text-muted hover:text-text-main'}"
									>
										{val === 0 ? 'Outro' : `R$ ${val}`}
									</button>
								{/each}
							</div>

							<!-- Custom amount input -->
							{#if donationAmount === 0}
								<div class="space-y-1.5 animate-fade-in">
									<label for="customDonation" class="text-xs font-semibold text-text-muted block">Digite o Valor (R$)</label>
									<input
										id="customDonation"
										type="number"
										min="1"
										bind:value={customAmount}
										placeholder="Valor da doação. Ex: 100"
										required
										class="w-full px-3.5 py-2 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main placeholder-text-muted focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none transition-colors"
									/>
								</div>
							{/if}

							<!-- Payment Method selection -->
							<div class="space-y-2 pt-2">
								<span class="text-xs font-semibold text-text-muted block">Forma de Pagamento</span>
								<div class="flex gap-2">
									<button
										onclick={() => paymentMethod = 'pix'}
										class="flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer
										{paymentMethod === 'pix' 
											? 'border-brand-gold text-brand-gold bg-brand-gold-dim/10' 
											: 'border-border-dark bg-bg-dark hover:bg-bg-dark/80 text-text-muted hover:text-text-main'}"
									>
										<Smartphone size={13} />
										<span>Pix</span>
									</button>
									<button
										onclick={() => paymentMethod = 'card'}
										class="flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer
										{paymentMethod === 'card' 
											? 'border-brand-gold text-brand-gold bg-brand-gold-dim/10' 
											: 'border-border-dark bg-bg-dark hover:bg-bg-dark/80 text-text-muted hover:text-text-main'}"
									>
										<CreditCard size={13} />
										<span>Cartão</span>
									</button>
								</div>
							</div>

							<!-- Checkout Form -->
							<form onsubmit={handleSupportSubmit} class="pt-4 border-t border-border-dark/60 mt-4 space-y-3">
								{#if paymentMethod === 'card'}
									<div class="space-y-2.5 animate-fade-in">
										<div class="space-y-1">
											<label for="cardNum" class="text-[10px] font-semibold text-text-muted block">Número do Cartão</label>
											<input
												id="cardNum"
												type="text"
												placeholder="0000 0000 0000 0000"
												required
												class="w-full px-3 py-1.5 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main focus:border-brand-gold focus:outline-none"
											/>
										</div>
										<div class="flex gap-2">
											<div class="flex-1 space-y-1">
												<label for="cardVal" class="text-[10px] font-semibold text-text-muted block">Validade</label>
												<input
													id="cardVal"
													type="text"
													placeholder="MM/AA"
													required
													class="w-full px-3 py-1.5 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main focus:border-brand-gold focus:outline-none"
												/>
											</div>
											<div class="flex-1 space-y-1">
												<label for="cardCvc" class="text-[10px] font-semibold text-text-muted block">CVV</label>
												<input
													id="cardCvc"
													type="text"
													placeholder="123"
													required
													class="w-full px-3 py-1.5 text-xs rounded-xl border border-border-dark bg-bg-dark text-text-main focus:border-brand-gold focus:outline-none"
												/>
											</div>
										</div>
									</div>
								{/if}

								<button
									type="submit"
									disabled={finalAmount <= 0}
									class="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-wine hover:bg-brand-wine-light disabled:opacity-50 text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
								>
									Confirmar Apoio de R$ {finalAmount}
								</button>
							</form>
						</div>
					{:else if paymentStatus === 'loading'}
						<!-- Step 2: Loading State -->
						<div class="flex flex-col items-center justify-center py-20 text-center space-y-4 font-sans animate-fade-in">
							<RefreshCw class="h-8 w-8 text-brand-gold animate-spin" />
							<div>
								<h4 class="text-sm font-bold text-text-main">Processando Transação</h4>
								<p class="text-[11px] text-text-muted mt-1">Verificando dados junto à operadora...</p>
							</div>
						</div>
					{:else if paymentStatus === 'success'}
						<!-- Step 3: Success Screen (Pix QR Code OR Card Success) -->
						<div class="space-y-4 text-left animate-fade-in font-sans">
							<div class="flex items-center gap-2">
								<div class="h-6 w-6 flex items-center justify-center rounded bg-brand-gold-dim border border-brand-gold/25">
									<Check class="h-3.5 w-3.5 text-brand-gold" />
								</div>
								<span class="text-[10px] uppercase font-bold tracking-widest text-brand-gold">Apoio Confirmado</span>
							</div>

							{#if paymentMethod === 'pix'}
								<!-- Pix QR code simulator -->
								<div class="space-y-3">
									<h3 class="text-lg font-bold text-text-main tracking-tight leading-snug">Escaneie o QR Code Pix</h3>
									<p class="text-xs text-text-muted">Aponte a câmera do seu app do banco para o QR Code abaixo para doar **R$ {finalAmount}**.</p>
									
									<!-- QR code box -->
									<div class="mx-auto h-36 w-36 bg-white p-2.5 rounded-xl border border-border-dark flex items-center justify-center shadow-inner mt-2">
										<div class="w-full h-full border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 font-mono text-[9px] text-center select-none">
											[QR CODE SIMULADOR R$ {finalAmount}]
										</div>
									</div>

									<!-- Copy paste key link -->
									<div class="space-y-1.5 pt-2">
										<span class="text-[10px] font-semibold text-text-muted block">Código Pix Copia e Cola</span>
										<div class="flex gap-2">
											<input
												type="text"
												readonly
												value={pixKey}
												class="flex-1 px-3 py-1.5 text-[9px] rounded-lg border border-border-dark bg-bg-dark text-text-muted select-all focus:outline-none"
											/>
											<button
												onclick={handleCopyToClipboard}
												class="px-3 py-1.5 text-xs font-bold rounded-lg border border-border-dark bg-bg-dark hover:bg-bg-dark/80 text-text-muted hover:text-text-main flex items-center gap-1 transition-all cursor-pointer"
											>
												<Copy size={11} />
												<span>{copiado ? 'Copiado' : 'Copiar'}</span>
											</button>
										</div>
									</div>
								</div>
							{:else}
								<!-- Card Success screen -->
								<div class="space-y-2 py-6 text-center">
									<div class="h-12 w-12 rounded-full bg-brand-gold-dim border border-brand-gold/20 flex items-center justify-center mx-auto mb-3">
										<Check class="h-6 w-6 text-brand-gold" />
									</div>
									<h3 class="text-lg font-bold text-text-main tracking-tight">Obrigado pela Contribuição!</h3>
									<p class="text-xs text-text-muted leading-relaxed">Sua doação de **R$ {finalAmount}** no cartão foi processada com sucesso.</p>
								</div>
							{/if}

							<button
								onclick={resetPayment}
								class="w-full py-2 rounded-xl text-xs font-bold border border-border-dark bg-bg-dark hover:bg-bg-dark/80 text-text-muted hover:text-text-main transition-all cursor-pointer"
							>
								Fazer Outro Apoio
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
