<script lang="ts">
	import { onMount } from 'svelte';
	import { isMobileBuild } from '$lib/api/platform';
	import {
		onNetworkChange,
		getNetworkStatus,
		initNetworkListener
	} from '$lib/capacitor/network';

	let isOffline = $state(false);

	onMount(async () => {
		if (!isMobileBuild()) return;
		await initNetworkListener();
		isOffline = !getNetworkStatus().connected;
		onNetworkChange((s) => {
			isOffline = !s.connected;
		});
	});

	function retry() {
		window.location.reload();
	}
</script>

{#if isOffline}
	<div class="offline-overlay">
		<div class="offline-card">
			<div class="offline-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 20h.01" />
					<path d="M8.5 16.429a5 5 0 0 1 7 0" />
					<path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
					<path d="M13.83 10.17A10 10 0 0 1 19 12.859" />
					<path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
					<path d="M10.66 5.21A15 15 0 0 1 22 8.82" />
					<line x1="2" y1="2" x2="22" y2="22" />
				</svg>
			</div>
			<h2>Sem conexão</h2>
			<p>
				Verifique sua conexão com a internet para acessar o conteúdo litúrgico do dia.
			</p>
			<button onclick={retry} class="retry-btn">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
					<path d="M3 3v5h5" />
					<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
					<path d="M16 16h5v5" />
				</svg>
				Tentar Novamente
			</button>
		</div>
	</div>
{/if}

<style>
	.offline-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(15, 15, 17, 0.95);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		animation: fadeIn 0.3s ease-out;
	}

	.offline-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 320px;
		padding: 40px 32px;
		text-align: center;
		background: #18181b;
		border: 1px solid #27272a;
		border-radius: 16px;
		box-shadow:
			0 24px 48px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(201, 168, 76, 0.08);
	}

	.offline-icon {
		color: #c9a84c;
		opacity: 0.8;
	}

	.offline-card h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #f4f4f5;
		letter-spacing: -0.01em;
	}

	.offline-card p {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #a1a1aa;
	}

	.retry-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		padding: 10px 24px;
		font-size: 0.875rem;
		font-weight: 500;
		color: #0f0f11;
		background: linear-gradient(135deg, #c9a84c, #d4b85c);
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.retry-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(201, 168, 76, 0.3);
	}

	.retry-btn:active {
		transform: scale(0.97);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
